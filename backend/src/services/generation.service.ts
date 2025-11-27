import { prisma } from "../db/prisma.js";
import { AppError } from "../errors/AppError.js";
import { InternalServerError, NotFoundError, ServiceUnavailableError } from "../errors/errorTypes.js";
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type { ImageStyle } from "@prisma/client";
import { processUploadedImage } from "../utils/imageProcessor.js";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class GenerationService {

    static async postGeneration(uid: string, prompt: string, style: ImageStyle, file: Express.Multer.File) {
        // Simulate generation delay 1-2s
        await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));

        // 20% overload
        if (Math.random() < 0.2) {
            throw new ServiceUnavailableError("Model overloaded");
        }

        // Generate a UUID for the file
        const fileId = crypto.randomUUID();

        let image = '';
        let thumbnail = '';

        // Process and save both images
        try {
            // Process images to standard sizes
            const { fullImage, thumbnailImage } = await processUploadedImage(file.buffer);

            // Create uploads directory if it doesn't exist
            const uploadsDir = path.join(__dirname, '../../public/generated');
            await fs.mkdir(uploadsDir, { recursive: true });

            // Define filenames (using .jpg since we're converting to JPEG)
            const filename = `${fileId}.jpg`;
            const thumbnailFilename = `${fileId}_thumb.jpg`;
            
            const filepath = path.join(uploadsDir, filename);
            const thumbnailPath = path.join(uploadsDir, thumbnailFilename);

            console.log("file path ", filepath)
            console.log("thumbnail file path", thumbnailPath)

            // Save both images
            await fs.writeFile(filepath, fullImage);
            await fs.writeFile(thumbnailPath, thumbnailImage);

            // Set URLs
            image = `/public/generated/${filename}`;
            thumbnail = `/public/generated/${thumbnailFilename}`;
        } catch (error) {
            console.error('Error processing/saving images:', error);
            throw new InternalServerError('Failed to process and save images');
        }

        const created = await prisma.generation.create({
            data: {
                userId: uid,
                prompt,
                style,
                image,
                thumbnail,
                status: 'succeeded',
            }
        });

        return created;
    }


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
        const generation = await prisma.generation.findUnique({
            where: { id }, // or { id: idNum }
        });

        return generation;
    }

}