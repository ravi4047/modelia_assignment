// tests/generations.test.ts
import request from 'supertest';
import App from '../src/app';
import GenerationService from '../src/services/generation.service';
import { jest } from '@jest/globals';
import { ImageStyle } from '@prisma/client';
import e from 'express';

// ✅ Properly mock GenerationService (class with static methods)
jest.mock('../src/services/generation.service', () => ({
  __esModule: true,
  default: {
    postGeneration: jest.fn(),
    getGenerations: jest.fn(),
    getGenerationById: jest.fn(),
  },
}));

// Cast to mocked type for type‑safe usage
// const mockedGenerationService = GenerationService as jest.Mocked<typeof GenerationService>;

/**
 * We'll also mock the auth middleware used by the generations router.
 * The router imports authHandler from ../middleware/index.js
 */
const mockAuthModulePath = '../src/middleware/index.js';

describe('Generations routes', () => {
  let app: e.Application;

  const test_uid = "user-1";

  beforeAll(() => {
    app = App();
  });

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  // Instead of casting the whole service, cast each method:
    const postGenerationMock = GenerationService.postGeneration as jest.MockedFunction<
    typeof GenerationService.postGeneration>;

    test('POST /api/generations - success (with image) returns 201 and payload', async () => {
        // mock authHandler to attach a user
        jest.doMock(mockAuthModulePath, () => ({
        authHandler: (req: any, res: any, next: any) => {
            req.user = { uid: test_uid };
            return next();
        },
        }));

        const FreshApp = (await import('../src/app')).default;
        app = FreshApp();

        const created = {
        id: 'gen-1',
        userId: test_uid,
        prompt: 'A fox in a suit',
        style: ImageStyle.realistic,
        image: '/public/generated/gen-1.jpg',
        thumbnail: '/public/generated/gen-1_thumb.jpg',
        status: 'succeeded',
        createdAt: new Date(),
        };

        // mockedGenerationService.postGeneration.mockResolvedValue(created);
        postGenerationMock.mockResolvedValue(created)

        const res = await request(app)
        .post('/api/generations')
        .field('prompt', 'A fox in a suit')
        .field('style', 'REALISTIC')
        .attach('image', Buffer.from('fake-image-bytes'), 'test.jpg');

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('id', 'gen-1');
        // expect(mockedGenerationService.postGeneration).toHaveBeenCalled();
        expect(postGenerationMock).toHaveBeenCalled()
    });

    test('POST /api/generations - simulated overload -> 503', async () => {
        jest.doMock(mockAuthModulePath, () => ({
        authHandler: (req: any, res: any, next: any) => {
            req.user = { uid: 'user-1' };
            return next();
        },
        }));

        const FreshApp = (await import('../src/app')).default;
        app = FreshApp();

        const err = new Error('Model overloaded') as any;
        err.status = 503;
        // mockedGenerationService.postGeneration.mockRejectedValue(err);
        postGenerationMock.mockRejectedValue(err)

        const res = await request(app)
        .post('/api/generations')
        .field('prompt', 'prompt')
        .field('style', 'REALISTIC')
        .attach('image', Buffer.from('xxx'), 'img.jpg');

        expect(res.status).toBe(503);
        expect(res.body).toHaveProperty('error', 'Model overloaded');
    });

    test('GET /api/generations - unauthorized access returns 401', async () => {
        jest.doMock(mockAuthModulePath, () => ({
        authHandler: (req: any, res: any, next: any) => {
            return res.status(401).json({ error: 'Unauthorized' });
        },
        }));

        const FreshApp = (await import('../src/app')).default;
        app = FreshApp();

        const res = await request(app).get('/api/generations');

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('error', 'Unauthorized');
    });

    test('GET /api/generations - validation: invalid query returns 400 with consistent error', async () => {
        jest.doMock(mockAuthModulePath, () => ({
        authHandler: (req: any, res: any, next: any) => {
            req.user = { uid: 'user-1' };
            return next();
        },
        }));

        const FreshApp = (await import('../src/app')).default;
        app = FreshApp();

        const res = await request(app).get('/api/generations?page=-1&limit=5');

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
        expect(typeof res.body.error).toBe('string');
    });
});
