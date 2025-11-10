import { prisma } from "../db/prisma.js";
import { AppError } from "../errors/AppError.js";
import { ServiceUnavailableError } from "../errors/errorTypes.js";

export default class GenerationService{

    // Post generation
    static async postGeneration(uid: string, prompt: string, style: string) {
        // Simulate generation delay 1-2s
        await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));

        // 20% overload
        if (Math.random() < 0.2) {
            // const err = new AppError(message: "Model overloaded", statusCode: 503, )
            // const err: AppError = new AppError('Model overloaded', 503, true, );
            // throw err;
            // return res.status(503).json({ message: 'Model overloaded' });
            throw new ServiceUnavailableError("Model overloaded");
        }

        // For simulation: convert upload buffer to base64 data URL or save to disk / S3; here return a placeholder URL

        // Creating a unique id for image
        const id = crypto.randomUUID();

        const imageUrl = `/static/generated/${id}.png`; // or data URL
        const created = await prisma.generation.create({
            data: {
                id,
                userId: uid,
                prompt,
                style,
                imageUrl,
                status: 'succeeded',
            }
        });

        return created
    }

    // Get generation
    static async getGeneration(uid:string, limit:number|undefined){
        const nLimit = Math.min(Number(limit || 5), 50);
        const gens = await prisma.generation.findMany({
            where: { userId: uid },
            orderBy: { createdAt: 'desc' },
            take: nLimit
        });

        return gens;
        // res.json(gens);
    }
}