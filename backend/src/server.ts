import express from 'express'
import App from './app.js'
import { PORT } from './config/config.js';
import type { Server } from 'http';
import { logger } from './logs/logger.js';

async function startServer() {

    const app = App()

    const serverInstance = app.listen(PORT, ()=>{
        logger.info(`Server is running on http://localhost:${PORT}`);
    })

    // Handle system signals for graceful shutdown
    // process.on('SIGINT', gracefulShutdown(serverInstance));
    // process.on('SIGTERM', gracefulShutdown(serverInstance));

    process.on('uncaughtException', handleUncaughtException);
    process.on('unhandledRejection', handleUnhandledRejection);
}

function gracefulShutdown(server: Server){
    server.closeAllConnections();
}

// Handle uncaught exceptions
function handleUncaughtException(error: Error): void {
    console.error('Uncaught Exception:', error.message);
    process.exit(1); // Exit with error code for unexpected issues
}

// Handle unhandled promise rejections
function handleUnhandledRejection(reason: any, promise: Promise<any>): void {
    console.error('Unhandled Rejection:', reason);
    console.error('Unhandled promise:', promise);
    process.exit(1); // Exit with error status for unhandled rejections
}

startServer()