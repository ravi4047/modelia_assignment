import type { Request, Response, NextFunction } from "express";
import { GetGenerationDto, PostGenerationDto } from "../dto/generation.dto.js";
import GenerationService from "../services/generation.service.js";
import { UnauthorizedError } from "../errors/errorTypes.js";

export async function postGenerationController(req:Request, res: Response, next: NextFunction) {
    // const parsed = PostGenerationDto.safeParse(req.body);
    // if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

    const { prompt, style } = PostGenerationDto.parse(req.body);

    try{
        const created = await GenerationService.postGeneration("", prompt, style)
        
        res.status(201).json({
        id: created.id,
        imageUrl: created.imageUrl,
        prompt: created.prompt,
        style: created.style,
        createdAt: created.createdAt,
        status: created.status
    });
    }catch(err){

    }
}


export async function getGenerationsController(req: Request, res: Response, next: NextFunction) {

    // Since already validated, just parse it here.
    const {limit} = GetGenerationDto.parse(req.query)

    /// As the validation middleware runs, again checking is not required. 
    // const user = req.user;
    // if (!user){
    //     throw new UnauthorizedError();
    // }

    try {
         await GenerationService.getGeneration(req.user!.uid, limit)
    } catch (err) {
        
    }   
}