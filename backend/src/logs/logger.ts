import pino from 'pino';
import { join } from 'path';

// const isDevelopment = process.env.NODE_ENV !== 'production';

// // Configure log file destination for production
// const logDir = join(__dirname, '..', 'logs');
// const logFile = join(logDir, 'app.log');

// export const logger = pino({
//     level: process.env.LOG_LEVEL || 'info',
//     transport: isDevelopment
//         ? {
//               target: 'pino-pretty',
//               options: {
//                   colorize: true,
//                   translateTime: 'HH:MM:ss Z',
//                   ignore: 'pid,hostname',
//               },
//           }
//         : {
//             // Should we log production stuff
//             target: 'pino/file',
//             options: { destination: logFile },  
//         },
// });


// src/logger.ts
import os from 'os';
import { initLoggingIntegrations, reportError, reportInfo } from './loggingIntegrations.js';

const level = process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
const pretty = process.env.LOG_PRETTY === 'true' || (process.env.NODE_ENV !== 'production' && process.env.LOG_PRETTY !== 'false');

const base = { pid: process.pid, hostname: os.hostname() };
const commonOpts: pino.LoggerOptions = {
  level,
  base,
  serializers: {
    err: pino.stdSerializers.err,
  },
};

// build logger
export const logger = pretty
  ? pino({
      ...commonOpts,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'yyyy-mm-dd HH:MM:ss.l',
          ignore: 'pid,hostname',
        },
      },
    } as any)
  : pino(commonOpts);

// Initialize external integrations if configured (Sentry, Datadog, GCP, ELK, etc.)
// This will set up SDKs and attach global handlers for unhandledRejection/uncaughtException.
export function initLogger(): void {
  // pino itself doesn't require initialization beyond creating the logger,
  // but the integrations may. Call initLoggingIntegrations to boot them.
  initLoggingIntegrations({ logger });

  // Optionally report that logging has initialized
  logger.debug('Logger initialized');
}

// Helper wrappers that both log and report to external aggregators
export function logAndReportError(msg: string, err?: unknown, meta?: Record<string, any>) {
  logger.error({ ...meta, err }, msg);
  reportError(err, { message: msg, meta });
}

export function logAndReportInfo(msg: string, meta?: Record<string, any>) {
  logger.info({ ...meta }, msg);
  reportInfo(msg, meta);
}

export type Logger = typeof logger;
