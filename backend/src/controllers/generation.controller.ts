import type { Request, Response, NextFunction } from "express";
import { GetGenerationByIdDto, GetGenerationDto, PostGenerationDto } from "../dto/generation.dto.js";
import GenerationService from "../services/generation.service.js";
import { BadRequestError, UnauthorizedError } from "../errors/errorTypes.js";
import type { GetGenerationsResponse, GenerationResponse } from "../response/generation.response.js";
import type { ImageStyle } from "@prisma/client";
import type { Generation } from "../models/generation.model.js";

export async function postGenerationController(req:Request, res: Response, next: NextFunction) {
    const { prompt, style } = PostGenerationDto.parse(req.body);
    const uid = req.user!.uid;
    const file = req.file; // Multer attaches the uploaded file here

    // Ensure file is provided
    if (!file) {
        return next(new BadRequestError('Image file is required'));
    }

    try {
        // Cast style string to ImageStyle enum (safe because Zod already validated it)
        const created = await GenerationService.postGeneration(uid, prompt, style as ImageStyle, file);

        // Build absolute URL for image so frontend can fetch it directly
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const payload: Generation = {
            ...created,
            imageUrl: created.image ? `${baseUrl}${created.image}` : created.image,
            thumbnailUrl: created.thumbnail ? `${baseUrl}${created.thumbnail}` : created.thumbnail,
        };

        const response: GenerationResponse = {
            success: true,
            data: payload,
        };

        console.log(response)

        res.status(201).json(response);
    } catch(err) {
        next(err)
    }
}


export async function getGenerationsController(req: Request, res: Response, next: NextFunction) {

    // Since already validated, just parse it here.
    const {page, limit} = GetGenerationDto.parse(req.query)

    /// As the validation middleware runs, again checking is not required. 
    // const user = req.user;
    // if (!user){
    //     throw new UnauthorizedError();
    // }

    try {
        const generations = await GenerationService.getGenerations(req.user!.uid, page, limit)
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const payload = generations.map(g => ({
            id: g.id,
            createdAt: g.createdAt,
            prompt: g.prompt,
            style: g.style,
            status: g.status,
            imageUrl: g.image ? `${baseUrl}${g.image}` : g.image,
            thumbnailUrl: g.thumbnail ? `${baseUrl}${g.thumbnail}` : g.thumbnail,
        } as Generation));

        const response: GetGenerationsResponse = {
            success: true,
            data: payload,
        };
        console.log(response)
        return res.status(200).json(response)
    } catch (err) {
        next(err)
    }
}

export async function getGenerationByIdController(req:Request, res: Response, next: NextFunction) {
    const {id} = GetGenerationByIdDto.parse(req.params)

    try{
        const generation = await GenerationService.getGenerationById(req.user!.uid, id)

        if(!generation){
            next(new BadRequestError())
        }else{
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const payload = {
                ...generation,
                imageUrl: generation.image ? `${baseUrl}${generation.image}` : generation.image,
                thumbnailUrl: generation.thumbnail ? `${baseUrl}${generation.thumbnail}` : generation.thumbnail,
            };

            const response: GenerationResponse = {
                success: true,
                data: payload as any,
            };
            return res.status(200).json(response)
        }
    }catch(err){
        next(err)
    }
}