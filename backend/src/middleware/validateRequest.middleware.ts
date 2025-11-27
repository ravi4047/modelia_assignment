import type {Request, Response, NextFunction } from "express";
import * as z from 'zod'
import { ValidationError } from "../errors/errorTypes.js";
import { logger } from "../logs/logger.js";

export const validateRequest = (schema: z.ZodObject) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    console.log("body", req.body)
    console.log("file", req.file)
    console.log(req.files)
    const validationResult = schema.safeParse(req.body);

    if (!validationResult.success) {
      // Extract error messages
      // const errorMessages = validationResult.error.issues.map(err => ({
      //   path: err.path.join('.'),
      //   message: err.message,
      // }));

      // Send a response if validation fails
      // res.status(400).json(unifiedResponse(false, 'Validation error', null, errorMessages));

      return next(new ValidationError(validationResult.error.message)); // Ensure no further middleware is called
    }

    // Attach parsed data to the request object (optional, but useful)
    req.body = validationResult.data;

    // Call next middleware if validation passes
    next();
  };
};