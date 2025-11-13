import type { Generation } from '../models/generation.model.js';

export interface GenerationResponse{
    success: boolean
    data: Generation
}

export interface GenerationResponse{
    success: boolean
    data: Generation
}


export interface GetGenerationsResponse{
    success: boolean
    data: Generation[]
}