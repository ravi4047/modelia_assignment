// src/types/generation.ts (optional)
import { Prisma } from '@prisma/client';

export type GenerationFromDb = Prisma.GenerationGetPayload<{
    omit: {userId: true} 
}>

// export type ThumbnailGenerationPrisma = Prisma.GenerationGetPayload<{
//     omit: {userId: true},
// }>


// API Response type with renamed fields for client
export interface Generation {
  id: string;
  prompt: string;
  style: string;
  imageUrl: string;      // renamed from 'image'
  thumbnailUrl: string;  // renamed from 'thumbnail'
  status: string;
  createdAt: Date;
}

// Helper function to transform DB model to API response
// export function toGeneration(generation: GenerationFromDb): Generation {
//   return {
//     id: generation.id,
//     prompt: generation.prompt,
//     style: generation.style,
//     imageUrl: generation.imageUrl,
//     thumbnailUrl: generation.thumbnailUrl,
//     status: generation.status,
//     createdAt: generation.createdAt,
//   };
// }