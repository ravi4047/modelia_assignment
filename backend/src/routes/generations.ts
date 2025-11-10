import express from 'express';
import authHandler from '../middleware/auth.js';
import multer from 'multer';
import { getGenerationsController, postGenerationController } from '../controllers/generations.js';
import { GetGenerationDto, PostGenerationDto } from '../dto/generation.dto.js';
import { validateRequest } from '../middleware/validation.middleware.js';


const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// const genSchema = z.object({ prompt: z.string().min(1), style: z.string().min(1) });

router.post('/', authHandler, validateRequest(PostGenerationDto), upload.single('image'), postGenerationController)
router.get('/', authHandler, validateRequest(GetGenerationDto), getGenerationsController);

export default router;