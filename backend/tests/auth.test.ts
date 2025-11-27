// tests/auth.test.ts
import request from 'supertest';
import App from '../src/app'; // adjust path if your app entry is elsewhere
import AuthService from '../src/services/auth.service';
import { jest } from '@jest/globals';
import e from 'express';

// ✅ Properly mock AuthService (class with static methods)
jest.mock('../src/services/auth.service', () => ({
  __esModule: true,
  default: {
    signUp: jest.fn(),
    login: jest.fn(),
  },
}));

// Cast to mocked type for type‑safe usage
// const mockedAuthService = AuthService as jest.Mocked<typeof AuthService>;

describe('Auth routes', () => {
    let app: any;

    beforeAll(() => {
        app = App();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const mockedSignUp = AuthService.signUp as jest.MockedFunction<
        typeof AuthService.signUp>;
    
    const mockedLogin = AuthService.login as jest.MockedFunction<
        typeof AuthService.login>;

    test('POST /api/auth/signup - happy path', async () => {
        // Arrange: mock signUp to return token and userId
        mockedSignUp.mockResolvedValue({ token: 'fake-token', userId: 'u-1' });

        const payload = {
        email: 'test@example.com',
        password: 'StrongP@ss1',
        };

        // Act
        const res = await request(app).post('/api/auth/signup').send(payload);

        // Assert
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('data.token', 'fake-token');
        expect(res.body).toHaveProperty('data.userId', 'u-1');
        expect(mockedSignUp).toHaveBeenCalledWith(payload.email, payload.password);
    });

    test('POST /api/auth/signup - invalid input returns 400 & consistent error', async () => {
        const payload = {
        email: 'bad-email',
        password: 'short', // violates signup DTO
        };

        const res = await request(app).post('/api/auth/signup').send(payload);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
        expect(typeof res.body.error).toBe('string');
    });

    test('POST /api/auth/login - happy path', async () => {

        mockedLogin.mockResolvedValue({ token: 'login-token', userId: 'u-2' });

        const payload = {
        email: 'me@example.com',
        password: 'anything', // login DTO only requires non-empty
        };

        const res = await request(app).post('/api/auth/login').send(payload);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('data.token', 'login-token');
        expect(res.body).toHaveProperty('data.userId', 'u-2');
        expect(mockedLogin).toHaveBeenCalledWith(payload.email, payload.password);
    });

    test('POST /api/auth/login - missing password returns 400', async () => {
        const payload = {
        email: 'me@example.com',
        // no password
        } as any;

        const res = await request(app).post('/api/auth/login').send(payload);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
        expect(typeof res.body.error).toBe('string');
    });
});
