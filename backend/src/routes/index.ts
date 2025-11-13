import type { Application } from "express";
import authRouter from './auth.js'
import generationRouter from './generations.js'

const FullRoutes = (app:Application)=>{
    app.use("/api/auth", authRouter)
    app.use('/api/generations', generationRouter)

    // Health check endpoint
    app.get('/health', (req, res) => {
        res.status(200).json({ success: true, message: 'Server is running' });
    });
}

export default FullRoutes;