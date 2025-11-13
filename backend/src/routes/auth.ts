import express from 'express';
import { z, ZodError } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/config.js';
import { prisma } from '../db/prisma.js';
import { LoginDto, SignUpDto } from '../dto/auth.dto.js';
import { loginController, signUpController } from '../controllers/auth.controller.js';
import { validateRequest } from '../middleware/validateRequest.middleware.js';

const router = express.Router()

// TODO Need a comment here
// const signupSchema = z.object({ email: z.email(), password: z.string().min(8) });

// Signup
router.post('/signup', validateRequest(SignUpDto), signUpController)

// Login
router.post('/login', validateRequest(LoginDto), loginController)

export default router