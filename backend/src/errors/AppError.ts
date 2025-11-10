// src/errors/AppError.ts

/**
 * Base application error class
 * All custom errors should extend this class
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    // public readonly code?: string;
    public readonly code: string;
    public readonly details?: any;

    constructor(
        message: string,
        statusCode: number = 500,
        isOperational: boolean = true,
        code: string,
        details?: any
    ) {
        super(message);
        
        // Maintains proper stack trace for where our error was thrown (only available on V8)
        Error.captureStackTrace(this, this.constructor);

        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.code = code;
        this.details = details;
    }
}