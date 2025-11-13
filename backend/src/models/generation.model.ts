// src/types/generation.ts (optional)
import { Prisma } from '@prisma/client';

export type Generation = Prisma.GenerationGetPayload<{
    omit: {userId: true} 
}>