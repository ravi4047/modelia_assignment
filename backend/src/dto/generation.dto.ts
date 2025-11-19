import * as z from "zod";
import { ImageStyle as PrismaImageStyle } from "@prisma/client";

// Use Prisma's generated enum (single source of truth)
const imageStyleValues = Object.values(PrismaImageStyle);

export const PostGenerationDto = z.object({
    prompt: z
    .string()
    .trim()
    .min(1, { message: 'Prompt cannot be empty' }),
    
    style: z.enum(imageStyleValues as [string, ...string[]]).refine(
      (val) => imageStyleValues.includes(val as PrismaImageStyle),
      { message: `style must be one of: ${imageStyleValues.join(', ')}` }
    ),
    // Note: file is handled by multer, not Zod
})

export const GetGenerationDto = z.object({
  page: z
    .string()
    .transform((val, ctx) => {
      const parsed = parseInt(val, 10);
      if (Number.isNaN(parsed) || parsed < 1) {
        ctx.addIssue({
          code: 'custom',
          message: 'page must be a positive integer',
          path: ['page'],
          fatal: true,
        });
        return z.NEVER;
      }
      return parsed;
    })
    .optional()
    .default(1), // default query string value before transform

  limit: z
    .string()
    .transform((val, ctx) => {
      const parsed = parseInt(val, 10);
      if (Number.isNaN(parsed) || parsed < 1 || parsed > 100) {
        ctx.addIssue({
          code: 'custom',
          message: 'limit must be a valid integer between 1 and 100',
          path: ['limit'],
          fatal: true,
        });
        return z.NEVER;
      }
      return parsed;
    })
    .optional()
    .default(5),
});


export const GetGenerationByIdDto = z.object({
  id: z.string().min(1, 'id is required'),
  // if you use UUIDs use: id: z.string().uuid()
});