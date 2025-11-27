import { Prisma, PrismaClient } from "@prisma/client"
import { withAccelerate } from "@prisma/extension-accelerate"
import { logger } from "../logs/logger.js";

// export const prisma = new PrismaClient().$extends(withAccelerate())

// let user: Prisma.UserCreateInput


// Depending on what your models look like, the Prisma Client API will look 
// different as well. For example, if you have a User model, your PrismaClient 
// instance exposes a property called user on which you can call CRUD methods 
// like findMany, create or update. The property is named after the model, 
// but the first letter is lowercased (so for the Post model it's called post, 
// for Profile it's called profile).

const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * PrismaClient configuration
 */
const prismaClientOptions = {
    log: [
        { level: 'query' as const, emit: 'event' as const },
        { level: 'error' as const, emit: 'event' as const },
        { level: 'warn' as const, emit: 'event' as const },
    ],
};

/// uncomment later ----- start
/**
 * Create Prisma Client instance
 * In development, use global to prevent multiple instances during hot reload
 */
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient(NODE_ENV === 'production' ? prismaClientOptions : undefined) // .$extends(withAccelerate);

if (NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
/// uncomment later ----- stop

/**
 * Prisma Query Event Logging
 */
if (NODE_ENV === 'development') {
    prisma.$on('query' as never, (e: any) => {
        logger.debug({
            query: e.query,
            params: e.params,
            duration: `${e.duration}ms`,
        }, 'Database query');
    });
}

/**
 * Prisma Error Event Logging
 */
prisma.$on('error' as never, (e: any) => {
    logger.error({
        message: e.message,
        target: e.target,
    }, 'Prisma error');
});

/**
 * Prisma Warning Event Logging
 */
prisma.$on('warn' as never, (e: any) => {
    logger.warn({
        message: e.message,
    }, 'Prisma warning');
});

/**
 * Health check function
 */
export async function checkDatabaseConnection(): Promise<boolean> {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return true;
    } catch (error) {
        logger.error({ err: error }, 'Database health check failed');
        return false;
    }
}

/**
 * Graceful disconnect
 */
export async function disconnectDatabase(): Promise<void> {
    await prisma.$disconnect();
    logger.info('Prisma client disconnected');
}