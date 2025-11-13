import { prisma } from "../db/prisma.js";
import { AppError } from "../errors/AppError.js";
import { InternalServerError, NotFoundError, ServiceUnavailableError } from "../errors/errorTypes.js";
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type { ImageStyle } from "@prisma/client";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class GenerationService {

    // Post generation
    static async postGeneration(uid: string, prompt: string, style: ImageStyle, file: Express.Multer.File) {
        // Simulate generation delay 1-2s
        await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));

        // 20% overload
        if (Math.random() < 0.2) {
            throw new ServiceUnavailableError("Model overloaded");
        }

        // Generate a UUID for the file (Prisma will auto-generate id in the database)
        const fileId = crypto.randomUUID();

        let imageUrl = '';

        // Save file with unique filename
        try {
            // Create uploads directory if it doesn't exist
            const uploadsDir = path.join(__dirname, '../../public/generated');
            await fs.mkdir(uploadsDir, { recursive: true });

            // Generate unique filename with original extension
            const ext = path.extname(file.originalname) || '.png';
            const filename = `${fileId}${ext}`;
            const filepath = path.join(uploadsDir, filename);

            // Save file to disk
            await fs.writeFile(filepath, file.buffer);

            // Update imageUrl to point to the saved file
            imageUrl = `/public/generated/${filename}`;
        } catch (error) {
            console.error('Error saving file:', error);
            throw new InternalServerError('Failed to save uploaded file')
        }

        const created = await prisma.generation.create({
            data: {
                userId: uid,
                prompt,
                style,
                imageUrl,
                status: 'succeeded',
            }
        });

        return created;
    }

    // Get generations
    // static async getGenerations(uid:string, limit:number|undefined){
    //     const nLimit = Math.min(Number(limit || 5), 50);
        
    //     const gens = await prisma.generation.findMany({
    //         where: { userId: uid },
    //         orderBy: { createdAt: 'desc' },
    //         take: nLimit
    //     });

    //     return gens;
    // }

    static async getGenerations(uid:string, page: number, limit:number){
        const nLimit = Math.min(Number(limit || 5), 50);
        
        const gens = await prisma.generation.findMany({
            where: { userId: uid },
            orderBy: { createdAt: 'desc' },
            take: nLimit,
            skip: (page-1)*limit
        });

        return gens;
    }

    // Get generation by id
    static async getGenerationById(uid:string, id: string){
        // try {
     
        const generation = await prisma.generation.findUnique({
            where: { id }, // or { id: idNum }
        });

        return generation;

        // if (!generation) {
        //     return 
        // }

        // return res.status(200).json({
        //     success: true,
        //     data: generation,
        // });
        // } catch (err) {
        // return next(err);
        // }
    }

    // static async uploadImage(){

    // }
}