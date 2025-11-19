import { test, expect, Page, APIRequestContext } from '@playwright/test';

test.describe('Authentication E2E', () => {
  test.beforeEach(async ({ page }) => {
    // start each test from a clean app state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  // Helper to mock POST endpoints used by AuthProvider -> apiService
  const mockApi = async (page: Page, routePath: string, status: number, body: any) => {
    await page.route(`**${routePath}`, async (route) => {
      // only mock POSTs to the auth endpoints
      const req = route.request();
      if (req.method() === 'POST') {
        await route.fulfill({
          status,
          contentType: 'application/json',
          body: JSON.stringify(body),
        });
      } else {
        await route.continue();
      }
    });
  };

  test('Signup: successful signup navigates to /studio and sets localStorage', async ({ page }) => {
    await mockApi(page, '/api/signup', 200, { token: 'fake-token-1', userId: 'u123' });

    // open signup page
    await page.goto('/signup');

    // fill inputs (Input component uses ids derived from labels: 'email', 'password', 'confirm-password')
    await page.fill('input[id="email"]', 'alice@example.com');
    await page.fill('input[id="password"]', 'P@ssw0rd1');
    await page.fill('input[id="confirm-password"]', 'P@ssw0rd1');

    // click sign up - button text matches 'Sign Up'
    await page.click('text=Sign Up');

    // expect navigation to /studio
    await expect(page).toHaveURL(/\/studio$/);

    // assert localStorage has token and user
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    const user = await page.evaluate(() => localStorage.getItem('user'));
    expect(token).toBe('fake-token-1');
    expect(user).toBeTruthy();
    const parsed = JSON.parse(user as string);
    expect(parsed.email).toBe('alice@example.com');
    expect(parsed.id).toBe('u123');
  });

  test('Login: successful login navigates to /studio and sets localStorage', async ({ page }) => {
    await mockApi(page, '/api/login', 200, { token: 'login-token', userId: 'u999' });

    await page.goto('/login');
    await page.fill('input[id="email"]', 'bob@example.com');
    await page.fill('input[id="password"]', 'secret123');

    // Login form uses a form onSubmit, so clicking the Login button will submit
    await page.click('text=Login');

    await expect(page).toHaveURL(/\/studio$/);

    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    const user = await page.evaluate(() => localStorage.getItem('user'));
    expect(token).toBe('login-token');
    expect(user).toBeTruthy();
    const parsed = JSON.parse(user as string);
    expect(parsed.email).toBe('bob@example.com');
    expect(parsed.id).toBe('u999');
  });

  test('Login: failed login shows error message from API', async ({ page }) => {
    await mockApi(page, '/api/login', 401, { error: { message: 'Invalid credentials' } });

    await page.goto('/login');
    await page.fill('input[id="email"]', 'someone@example.com');
    await page.fill('input[id="password"]', 'bad-password');

    await page.click('text=Login');

    // expect the error message to appear in the UI
    await expect(page.locator('text=Invalid credentials')).toBeVisible();

    // still on login page
    await expect(page).toHaveURL(/\/login$/);
  });

  test('Private route redirects to /login when not authenticated', async ({ page }) => {
    // ensure no token/user
    await page.evaluate(() => localStorage.clear());
    await page.goto('/studio');

    await expect(page).toHaveURL(/\/login$/);
  });

  test('Public route redirects to /studio when already authenticated', async ({ page }) => {
    // Put token/user into localStorage before visiting /login
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'existing-token');
      localStorage.setItem('user', JSON.stringify({ id: 'u1', email: 'x@y.com' }));
    });

    await page.goto('/login');
    // Authenticated -> PublicRoute should redirect to /studio
    await expect(page).toHaveURL(/\/studio$/);
  });

  test('app:unauthorized event clears user and navigates to /login', async ({ page }) => {
    // set up an authenticated state
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'existing-token');
      localStorage.setItem('user', JSON.stringify({ id: 'u2', email: 'me@me.com' }));
    });

    await page.goto('/studio');
    // ensure we are on studio
    await expect(page).toHaveURL(/\/studio$/);

    // dispatch unauthorized event from the window - this should trigger the effect in AuthProvider
    await page.evaluate(() => {
      const ev = new Event('app:unauthorized');
      window.dispatchEvent(ev);
    });

    // app should navigate to /login
    await expect(page).toHaveURL(/\/login$/);

    // localStorage should have removed auth_token & user
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    const user = await page.evaluate(() => localStorage.getItem('user'));
    expect(token).toBeNull();
    expect(user).toBeNull();
  });
});
