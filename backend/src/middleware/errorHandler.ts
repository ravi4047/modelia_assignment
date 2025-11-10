// src/middleware/errorHandler.ts

import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import {PrismaClientKnownRequestError, PrismaClientValidationError} from "@prisma/client/runtime/client.js"
import { AppError } from '../errors/AppError.js';
import { logger } from '../logs/logger.js';

interface ErrorResponse {
    success: boolean;
    error: {
        message: string;
        code?: string;
        statusCode: number;
        details?: any;
        stack?: string|undefined;
    };
}

/**
 * Handles Zod validation errors
 */
function handleZodError(error: ZodError): ErrorResponse {
    const details = error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
    }));

    return {
        success: false,
        error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            statusCode: 400,
            details,
        },
    };
}

/**
 * Handles Prisma errors
 */
function handlePrismaError(error: PrismaClientKnownRequestError): ErrorResponse {
    switch (error.code) {
        case 'P2002': {
            // Unique constraint violation
            const field = (error.meta?.target as string[])?.join(', ') || 'field';
            return {
                success: false,
                error: {
                    message: `${field} already exists`,
                    code: 'CONFLICT',
                    statusCode: 409,
                    details: { field, constraint: 'unique' },
                },
            };
        }
        case 'P2025': {
            // Record not found
            return {
                success: false,
                error: {
                    message: 'Record not found',
                    code: 'NOT_FOUND',
                    statusCode: 404,
                },
            };
        }
        case 'P2003': {
            // Foreign key constraint failed
            return {
                success: false,
                error: {
                    message: 'Related record not found',
                    code: 'BAD_REQUEST',
                    statusCode: 400,
                },
            };
        }
        case 'P2014': {
            // Relation violation
            return {
                success: false,
                error: {
                    message: 'Invalid relation',
                    code: 'BAD_REQUEST',
                    statusCode: 400,
                },
            };
        }
        default: {
            return {
                success: false,
                error: {
                    message: 'Database error occurred',
                    code: 'DATABASE_ERROR',
                    statusCode: 500,
                    details: process.env.NODE_ENV === 'development' ? { prismaCode: error.code } : undefined,
                },
            };
        }
    }
}

/**
 * Handles JWT errors
 */
function handleJWTError(error: Error): ErrorResponse {
    const isExpired = error.name === 'TokenExpiredError';
    
    return {
        success: false,
        error: {
            message: isExpired ? 'Token expired' : 'Invalid token',
            code: 'UNAUTHORIZED',
            statusCode: 401,
        },
    };
}

/**
 * Main error handling middleware
 */
export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    // Log the error
    logger.error({
        err,
        req: {
            method: req.method,
            url: req.url,
            headers: req.headers,
            body: req.body,
        },
    }, 'Error occurred');

    // Handle specific error types
    let errorResponse: ErrorResponse;

    if (err instanceof AppError) {
        // Custom application errors
        errorResponse = {
            success: false,
            error: {
                message: err.message,
                code: err.code,
                statusCode: err.statusCode,
                details: err.details,
                stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
            },
        };
    } else if (err instanceof ZodError) {
        // Zod validation errors
        errorResponse = handleZodError(err);
    } else if (err instanceof PrismaClientKnownRequestError) {
        // Prisma known errors
        errorResponse = handlePrismaError(err);
    } else if (err instanceof PrismaClientValidationError) {
        // Prisma validation errors
        errorResponse = {
            success: false,
            error: {
                message: 'Invalid data provided',
                code: 'VALIDATION_ERROR',
                statusCode: 400,
            },
        };
    } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        // JWT errors
        errorResponse = handleJWTError(err);
    } else if (err.name === 'SyntaxError' && 'body' in err) {
        // JSON parse errors
        errorResponse = {
            success: false,
            error: {
                message: 'Invalid JSON',
                code: 'BAD_REQUEST',
                statusCode: 400,
            },
        };
    } else {
        // Unknown errors
        errorResponse = {
            success: false,
            error: {
                message: process.env.NODE_ENV === 'production' 
                    ? 'Internal server error' 
                    : err.message,
                code: 'INTERNAL_SERVER_ERROR',
                statusCode: 500,
                stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
            },
        };
    }

    // Send response
    res.status(errorResponse.error.statusCode).json(errorResponse);
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response): void {
    res.status(404).json({
        success: false,
        error: {
            message: `Route ${req.method} ${req.path} not found`,
            code: 'NOT_FOUND',
            statusCode: 404,
        },
    });
}

/**
 * Async handler wrapper to catch promise rejections
 */
export function asyncHandler(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}