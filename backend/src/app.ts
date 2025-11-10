import express, { type Application } from 'express';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import FullRoutes from './routes/index.js';

export default function App() {

  const app = express();

  app.use(express.json());

  // Request logging middleware (optional)
  // app.use(loggerMiddleware)
  app.use()

  // Configuring the routes
  FullRoutes(app)

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