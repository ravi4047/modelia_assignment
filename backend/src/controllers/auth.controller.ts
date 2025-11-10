import type { Request, Response, NextFunction } from "express";
import { LoginDto, SignUpDto } from "../dto/auth.dto.js";
import { prisma } from "../db/prisma.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "../config/config.js";
import AuthService from "../services/auth.service.js";

export async function signUpController(req:Request, res:Response, next:NextFunction){
    const parsed = SignUpDto.safeParse(req.body)
    if (!parsed.success) {
        // If invalid data, then throw bad request
        return res.status(400).json({error: parsed.error.issues[0]?.message})
    }

    try {
        const { token } = await AuthService.signUp(parsed.data.email, parsed.data.password);
        // you can choose to send token in body or set cookie:
        // res.cookie('access_token', token, { httpOnly: true, secure: true, sameSite: 'lax' });
        res.status(201).json({ token });
    } catch (err: any) {
        // If service attached a status
        if (err?.status) return res.status(err.status).json({ error: err.message });
        next(err); // let centralized handler do the rest
    }
}


export async function loginController(req:Request, res:Response, next:NextFunction){
    const parsed = LoginDto.safeParse(req.body);
    
    if (!parsed.success) {
        // If invalid data, then throw bad request
        return res.status(400).json({error: parsed.error.issues[0]?.message})
    }
    
    try {
        const { token } = await AuthService.login(parsed.data.email, parsed.data.password);
        res.status(200).json({ token });
    } catch (err: any) {
        if (err?.status) return res.status(err.status).json({ error: err.message });
        next(err);
    }
}