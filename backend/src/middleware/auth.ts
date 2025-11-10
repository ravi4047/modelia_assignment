import type {Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from '../config/config.js';
import { UnauthorizedError } from "../errors/errorTypes.js";
// import type User from "../models/user.model.js";
import { UserSchema, type User } from "../models/user.model.js";

// Setting up the user data to be passed to the routes as a payload
declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}

export default function authHandler(req: Request, res: Response, next: NextFunction){
    const header = req.headers.authorization
    if(!header?.startsWith('Bearer ')) return res.status(401).send({ error: 'Unauthorized' });

    const token = header.split(' ')[1];
    if (!token){
        throw new UnauthorizedError()
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET)
        const parsed = UserSchema.safeParse(payload)
        if (!parsed.success)
            throw new UnauthorizedError('Invalid token payload')

        // ✅ Attach typed, validated user to req
        req.user = parsed.data;

        next();
    } catch (error) {
        // return res.status(401).send({ error: 'Unauthorized' }); 
        next(error)
    }
}