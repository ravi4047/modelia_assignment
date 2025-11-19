// src/types/index.ts

export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    userId: string;
  };
}

// export enum GenerationStatus {
//   IDLE = 'idle',
//   UPLOADING = 'uploading',
//   GENERATING = 'generating',
//   SUCCESS = 'success',
//   ERROR = 'error',
//   ABORTED = 'aborted',
// }
// export type GenerationStatus =
//   | 'idle'
//   | 'uploading'
//   | 'generating'
//   | 'success'
//   | 'error'
//   | 'aborted';


// status.ts
export const GenerationStatus = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  GENERATING: 'generating',
  SUCCESS: 'success',
  ERROR: 'error',
  ABORTED: 'aborted',
} as const;

// runtime values: GenerationStatus.IDLE etc.

export type GenerationStatus = (typeof GenerationStatus)[keyof typeof GenerationStatus];

// export enum ImageStyle {
//   REALISTIC = 'realistic',
//   ARTISTIC = 'artistic',
//   CARTOON = 'cartoon',
//   CYBERPUNK = 'cyberpunk',
//   WATERCOLOR = 'watercolor',
// }

// export type ImageStyle =
//   | 'realistic'
//   | 'artistic'
//   | 'cartoon'
//   | 'cyberpunk'
//   | 'watercolor';

export const ImageStyle = {
  REALISTIC : 'realistic',
  ARTISTIC : 'artistic',
  CARTOON : 'cartoon',
  CYBERPUNK : 'cyberpunk',
  WATERCOLOR : 'watercolor',
} as const

export type ImageStyle = (typeof ImageStyle)[keyof typeof ImageStyle];

export interface GenerationRequest {
  imageFile: File;
  prompt: string;
  style: ImageStyle;
}

export interface Generation {
  id: string;
  // userId: string;
  // originalImageUrl: string;
  // generatedImageUrl: string;
  imageUrl: string;
  thumbnailUrl: string;
  prompt: string;
  style: ImageStyle;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  // updatedAt: string;
}

// export interface ThumbnailGeneration {
//   id: string;
//   // userId: string;
//   // originalImageUrl: string;
//   // generatedImageUrl: string;
//   thumbnailUrl: string;
//   prompt: string;
//   style: ImageStyle;
//   status: 'pending' | 'completed' | 'failed';
//   createdAt: string;
//   // updatedAt: string;
// }

export interface GenerationResponse {
  success: boolean;
  data: Generation;
}

export interface GenerationHistoryResponse {
  success: boolean;
  // data: {
  //   generations: Generation[];
  //   total: number;
  //   page: number;
  //   limit: number;
  // };
  // data: Generation[]
  data: Generation[]
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    code?: string;
    statusCode: number;
    details?: unknown;
  };
}

export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}