import express, { type Application } from 'express';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import FullRoutes from './routes/index.js';
import { loggerMiddleware } from './middleware/loggerMiddleware.js';
import path from 'path';
import { fileURLToPath } from 'url';

import cors from 'cors';

import authRouter from './routes/auth.js'
import generationRouter from './routes/generations.js'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function App() {

  const app = express();

  app.use(express.json());
  // app.use(express.urlencoded({ extended: true }));

  // 1) Debugging middleware - logs headers and content-length
  app.use((req, res, next) => {
    console.log('--- incoming request ---');
    console.log(req.method, req.url);
    console.log('headers:', req.headers);
    console.log("body", req.body)
    next();
  });


  app.use(cors())

  // Serve static files (uploaded images)
  app.use('/public', express.static(path.join(__dirname, '../public')));

  // Request logging middleware (optional)
  // app.use(loggerMiddleware)
  app.use(loggerMiddleware)

  // app.use((req, res, next) => {
  //   console.log('--- incoming request ---');
  //   console.log(req.method, req.url);
  //   console.log('headers:', req.headers);
  //   console.log("body", req.body)
  //   next();
  // });

  // Configuring the routes
  // FullRoutes(app)
  app.use("/api/auth", authRouter)
  app.use('/api/generations', generationRouter)

  // Health check endpoint
  app.get('/health', (req, res) => {
      res.status(200).json({ success: true, message: 'Server is running' });
  });

  // 404 handler - MUST be after all routes
  app.use(notFoundHandler);

  // Error Handling Middleware
  app.use(errorHandler)

  // Listen to the port
  // const server = app.listen(PORT, () => {
  //   console.log(`Server is running on http://localhost:${PORT}`);
  // });

  return app
}