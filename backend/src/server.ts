// Load environment variables from .env as early as possible so modules that
// read process.env (like src/config/config.ts) get the values during import.
import 'dotenv/config';

import { Server } from 'http';
import App from './app.js';
import { disconnectDatabase, prisma } from './db/prisma.js';
import { logger } from './logs/logger.js';

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

let server: Server;

/**
 * Start the server
 */
async function startServer() {
    try {
        // This is not needed --------- start
        // Connect to database
        // logger.info('Connecting to database...');
        // await prisma.$connect();
        // logger.info('Database connected successfully');
        // This is not needed --------- stop

        // Test database connection
        logger.info('Testing database connection...');
        await prisma.$queryRaw`SELECT 1`;
        logger.info('Database health check passed');

        // Start HTTP server
        server = App().listen(PORT, () => {
            logger.info({
                port: PORT,
                env: NODE_ENV,
                nodeVersion: process.version,
            }, `Server is running on port ${PORT}`);
        });

        // Handle server errors
        server.on('error', (error: NodeJS.ErrnoException) => {
            if (error.code === 'EADDRINUSE') {
                logger.error(`Port ${PORT} is already in use`);
            } else {
                logger.error({ err: error }, 'Server error');
            }
            process.exit(1);
        });

    } catch (error) {
        logger.error({ err: error }, 'Failed to start server');
        process.exit(1);
    }
}

/**
 * Graceful shutdown
 */
async function gracefulShutdown(signal: string) {
    logger.info(`${signal} received, starting graceful shutdown...`);

    // Stop accepting new connections
    if (server) {
        server.close(async (err) => {
            if (err) {
                logger.error({ err }, 'Error during server close');
                process.exit(1);
            }

            logger.info('HTTP server closed');

            try {
                // Close database connections
                await disconnectDatabase();

                logger.info('Graceful shutdown completed');
                process.exit(0);
            } catch (error) {
                logger.error({ err: error }, 'Error during database disconnect');
                process.exit(1);
            }
        });

        // Force shutdown after timeout
        setTimeout(() => {
            logger.error('Forced shutdown due to timeout');
            process.exit(1);
        }, 30000); // 30 seconds timeout
    } else {
        process.exit(0);
    }
}

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error: Error) => {
    logger.error({ err: error }, 'Uncaught Exception - shutting down...');
    process.exit(1);
});

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error({
        reason,
        promise,
    }, 'Unhandled Promise Rejection - shutting down...');
    process.exit(1);
});

/**
 * Handle termination signals
 */
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

/**
 * Handle process warnings
 */
process.on('warning', (warning) => {
    logger.warn({
        name: warning.name,
        message: warning.message,
        stack: warning.stack,
    }, 'Process warning');
});

// Start the server
startServer();