import type {Request, Response, NextFunction } from "express";
import * as z from 'zod'
import { ValidationError } from "../errors/errorTypes.js";
import { logger } from "../logs/logger.js";

export const validateQuery = (schema: z.ZodObject) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    console.log(req.query)

    const validationResult = schema.safeParse(req.query);

    if (!validationResult.success) {
      return next(new ValidationError(validationResult.error.message)); // Ensure no further middleware is called
    }

    // Call next middleware if validation passes
    next();
  };
};