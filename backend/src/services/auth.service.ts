import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { BCRYPT_ROUNDS, JWT_SECRET } from "../config/config.js";
import { prisma } from '../db/prisma.js';
import { UnauthorizedError } from '../errors/errorTypes.js';
import type { JwtPayload } from '../models/user.model.js';


class AuthService{
    // SignUp
    static async signUp(email: string, password: string) {
        const rounds = Number(BCRYPT_ROUNDS) || 10;
        const hashed = await bcrypt.hash(password, rounds);

        try {
            const user = await prisma.user.create({
                data: { email, password: hashed },
            });

            const payload: JwtPayload = {
                sub: user.id,
                email: user.email
            }

            const token = jwt.sign(payload, JWT_SECRET, {
                expiresIn: '7d',
            });

            return { token, userId: user.id };
        } catch (err: any) {
            // Prisma unique constraint for email: code P2002
            if (err?.code === 'P2002') {
                const error: any = new Error('Email already used');
                error.status = 409;
                throw error;
            }
            throw err;
        }
    }

    // Login
    static async login(email: string, password: string) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // const e: any = new Error('Invalid credentials');
            // e.status = 401;
            // throw e;
            throw new UnauthorizedError('Invalid credentials')
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            // const e: any = new Error('Invalid credentials');
            // e.status = 401;
            // throw e; 
            throw new UnauthorizedError('Invalid credentials')
        }

        const payload: JwtPayload = {
            sub: user.id,
            email: user.email
        }

        const token = jwt.sign(payload, JWT_SECRET, {
            expiresIn: '7d',
        });

        return { token, userId: user.id };
    }
}

export default AuthService