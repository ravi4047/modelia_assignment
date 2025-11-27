import express from 'express';
import {authHandler} from '../middleware/index.js';
import multer from 'multer';
import { getGenerationByIdController, getGenerationsController, postGenerationController } from '../controllers/generation.controller.js';
import { GetGenerationByIdDto, GetGenerationDto, PostGenerationDto } from '../dto/generation.dto.js';
import { validateRequest } from '../middleware/validateRequest.middleware.js';
import { validateParams } from '../middleware/validateParams.middleware.js';
import { validateQuery } from '../middleware/validateQuery.middleware.js';


const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Apply authHandler to all routes in this router
router.use(authHandler);

router.post('/', upload.single('image'), validateRequest(PostGenerationDto), postGenerationController)
router.get('/', validateQuery(GetGenerationDto), getGenerationsController);

router.get('/:id', validateParams(GetGenerationByIdDto), getGenerationByIdController);

export default router;