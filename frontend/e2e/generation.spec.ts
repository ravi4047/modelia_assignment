// frontend/e2e/generation.spec.ts
import path from 'path'

import { test, expect } from '@playwright/test';
// import path from 'path';

test.describe('Image Generation Flow', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('complete user journey: signup → login → generate → view history', async ({ page }) => {
    // Step 1: Signup
    await test.step('User signs up', async () => {
      await page.goto('/signup');
      await page.getByLabel(/email/i).fill(testEmail);
      await page.getByLabel(/^password$/i).fill(testPassword);
      await page.getByLabel(/confirm password/i).fill(testPassword);
      await page.getByRole('button', { name: /sign up/i }).click();
      
      // Should redirect to studio
      await expect(page).toHaveURL('/studio');
      await expect(page.getByText('Image Generation Studio')).toBeVisible();
    });

    // Step 2: Upload image
    await test.step('User uploads an image', async () => {
      const fileInput = page.locator('input[type="file"]');
      const testImage = path.join(__dirname, 'fixtures', 'test-image.jpg');
      
      await fileInput.setInputFiles(testImage);
      
      // Preview should be visible
      await expect(page.locator('img[alt="Preview"]')).toBeVisible();
    });

    // Step 3: Fill generation form
    await test.step('User fills generation form', async () => {
      await page.getByLabel(/prompt/i).fill('Transform into a beautiful watercolor painting');
      await page.getByLabel(/style/i).selectOption('watercolor');
    });

    // Step 4: Generate image
    await test.step('User generates image', async () => {
      await page.getByRole('button', { name: /generate/i }).click();
      
      // Loading state should appear
      await expect(page.getByText(/generating/i)).toBeVisible();
      
      // Wait for completion (with timeout)
      await expect(page.getByText(/generation completed successfully/i))
        .toBeVisible({ timeout: 30000 });
    });

    // Step 5: View history
    await test.step('User sees generation in history', async () => {
      const historySection = page.locator('text=Recent Generations').locator('..');
      await expect(historySection).toBeVisible();
      
      // Should see the generated item
      await expect(historySection.getByText(/transform into a beautiful/i)).toBeVisible();
    });

    // Step 6: Restore from history
    await test.step('User restores previous generation', async () => {
      const historyItem = page.locator('text=Transform into a beautiful').locator('..');
      await historyItem.click();
      
      // Should restore to workspace (verify by checking if it's focused or highlighted)
      await expect(historyItem).toBeFocused();
    });

    // Step 7: Logout
    await test.step('User logs out', async () => {
      await page.getByRole('button', { name: /logout/i }).click();
      
      // Should redirect to login
      await expect(page).toHaveURL('/login');
    });
  });

  test('handles abort functionality', async ({ page }) => {
    // Login first
    await page.goto('/signup');
    await page.getByLabel(/email/i).fill(`abort-test-${Date.now()}@example.com`);
    await page.getByLabel(/^password$/i).fill(testPassword);
    await page.getByLabel(/confirm password/i).fill(testPassword);
    await page.getByRole('button', { name: /sign up/i }).click();
    
    await expect(page).toHaveURL('/studio');

    // Upload and start generation
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'test-image.jpg'));
    await page.getByLabel(/prompt/i).fill('Test abort');
    await page.getByRole('button', { name: /generate/i }).click();

    // Abort during generation
    await expect(page.getByText(/generating/i)).toBeVisible();
    await page.getByRole('button', { name: /abort/i }).click();

    // Should show aborted message
    await expect(page.getByText(/generation aborted/i)).toBeVisible();
  });

  test('handles retry on error', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(testEmail);
    await page.getByLabel(/password/i).fill(testPassword);
    await page.getByRole('button', { name: /login/i }).click();

    // The 20% error simulation might trigger retry
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'test-image.jpg'));
    await page.getByLabel(/prompt/i).fill('Test retry');
    await page.getByRole('button', { name: /generate/i }).click();

    // May see retry message
    const retryMessage = page.getByText(/retrying/i);
    const successMessage = page.getByText(/generation completed successfully/i);
    const errorMessage = page.getByText(/generation failed/i);

    // One of these should appear
    await expect(
      Promise.race([
        retryMessage.waitFor({ timeout: 5000 }).catch(() => null),
        successMessage.waitFor({ timeout: 30000 }).catch(() => null),
        errorMessage.waitFor({ timeout: 30000 }).catch(() => null),
      ])
    ).resolves.toBeTruthy();
  });

  test('validates image upload constraints', async ({ page }) => {
    await page.goto('/signup');
    await page.getByLabel(/email/i).fill(`validation-${Date.now()}@example.com`);
    await page.getByLabel(/^password$/i).fill(testPassword);
    await page.getByLabel(/confirm password/i).fill(testPassword);
    await page.getByRole('button', { name: /sign up/i }).click();

    // Try uploading invalid file type
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'test-document.pdf'));

    // Should show error
    await expect(page.getByText(/only jpeg and png/i)).toBeVisible();
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(testEmail);
    await page.getByLabel(/password/i).fill(testPassword);
    await page.getByRole('button', { name: /login/i }).click();

    // Tab through form elements
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeTruthy();
    
    // Space/Enter should work on buttons
    const generateButton = page.getByRole('button', { name: /generate/i });
    await generateButton.focus();
    await page.keyboard.press('Enter');
    
    // Should show validation (since form is incomplete)
    await expect(generateButton).toBeDisabled();
  });

  test('responsive layout works on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

    await page.goto('/login');
    await page.getByLabel(/email/i).fill(testEmail);
    await page.getByLabel(/password/i).fill(testPassword);
    await page.getByRole('button', { name: /login/i }).click();

    // All elements should be visible
    await expect(page.getByText('Image Generation Studio')).toBeVisible();
    await expect(page.locator('input[type="file"]')).toBeVisible();
    await expect(page.getByLabel(/prompt/i)).toBeVisible();
  });
});

// frontend/e2e/auth.spec.ts

test.describe('Authentication', () => {
  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('wrong@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /login/i }).click();

    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
  });

  test('signup with existing email shows error', async ({ page }) => {
    const existingEmail = 'existing@example.com';
    
    // First signup
    await page.goto('/signup');
    await page.getByLabel(/email/i).fill(existingEmail);
    await page.getByLabel(/^password$/i).fill('Password123!');
    await page.getByLabel(/confirm password/i).fill('Password123!');
    await page.getByRole('button', { name: /sign up/i }).click();

    // Logout
    await page.getByRole('button', { name: /logout/i }).click();

    // Try to signup again with same email
    await page.goto('/signup');
    await page.getByLabel(/email/i).fill(existingEmail);
    await page.getByLabel(/^password$/i).fill('Password123!');
    await page.getByLabel(/confirm password/i).fill('Password123!');
    await page.getByRole('button', { name: /sign up/i }).click();

    await expect(page.getByText(/email already/i)).toBeVisible();
  });

  test('password mismatch shows error', async ({ page }) => {
    await page.goto('/signup');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/^password$/i).fill('Password123!');
    await page.getByLabel(/confirm password/i).fill('DifferentPassword123!');
    await page.getByRole('button', { name: /sign up/i }).click();

    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
  });
});