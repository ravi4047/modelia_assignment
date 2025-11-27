import { Router } from 'express';
import { asyncHandler } from '../middleware/index.js';
import { checkDatabaseConnection } from '../db/prisma.js';

const router = Router();

/**
 * Basic health check
 * GET /health
 */
router.get('/', asyncHandler(async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
}));

/**
 * Detailed health check (includes database)
 * GET /health/detailed
 */
router.get('/detailed', asyncHandler(async (req, res) => {
    const dbHealthy = await checkDatabaseConnection();
    
    const health = {
        success: true,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        memory: {
            heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
            rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
        },
        database: {
            connected: dbHealthy,
        },
    };

    const statusCode = dbHealthy ? 200 : 503;
    res.status(statusCode).json(health);
}));

/**
 * Readiness probe (for Kubernetes/Docker)
 * GET /health/ready
 */
router.get('/ready', asyncHandler(async (req, res) => {
    const dbHealthy = await checkDatabaseConnection();
    
    if (!dbHealthy) {
        return res.status(503).json({
            success: false,
            message: 'Service not ready',
            database: false,
        });
    }
    
    res.status(200).json({
        success: true,
        message: 'Service is ready',
    });
}));

/**
 * Liveness probe (for Kubernetes/Docker)
 * GET /health/live
 */
router.get('/live', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Service is alive',
    });
});

export default router;