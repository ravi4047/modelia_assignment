import pinoHttp from 'pino-http';
import { logger } from '../logs/logger.js'  

export const loggerMiddleware = pinoHttp.default({
  logger,
  genReqId: (req) => req.headers['x-request-id'] as string || `${Date.now().toString(36)}-${Math.random().toString(16).slice(2,8)}`,
  customLogLevel: (res, err) => {
    if(res.statusCode){
        if (res.statusCode >= 500 || err) return 'error';
        if (res.statusCode >= 400) return 'warn';
    }
    return 'info';
  },
});