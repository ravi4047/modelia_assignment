// src/middleware/validateParams.ts
import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';
import { ValidationError } from '../errors/errorTypes.js';

export const validateParams =
  (schema: ZodType) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const parseResult = schema.safeParse(req.params);
    if (!parseResult.success) {
      // send friendly validation error (you can use your ValidationError class)
    //   return res.status(400).json({
    //     success: false,
    //     error: {
    //       message: 'Invalid route parameters',
    //       details: parseResult.error.issues,
    //     },
    //   });
        return next(new ValidationError( 'Invalid route params', parseResult.error.issues))
    }

    // Replace req.params with parsed/typed values
    req.params = parseResult.data as any;
    next();
  };