// src/loggingIntegrations.ts
/**
 * Central place to initialize external logging/error-aggregation backends.
 *
 * To use any integration:
 * 1. Install the SDK (see TODOs below)
 * 2. Set the corresponding env var (see README / .env.example)
 * 3. Fill in options for SDK init below if you need custom settings
 *
 * This file exposes:
 * - initLoggingIntegrations({ logger }) — initialize SDKs
 * - reportError(err, ctx) — forward errors to aggregator(s)
 * - reportInfo(msg, ctx) — forward info/telemetry if desired
 *
 * NOTE: All functions are no-ops unless the related SDK env var is set and the SDK is installed.
 */

import type pino from 'pino';

// --- Placeholders / optional imports (uncomment when installed) ---
// import * as Sentry from '@sentry/node';
// import { datadogLogs } from '@datadog/browser-logs' // or use datadog-winston/pino integrations
// import { Logging } from '@google-cloud/logging';
// import * as winston from 'winston'; // if you want a winston-based forwarder to syslog/ELK

type InitOpts = { logger?: pino.Logger };

/**
 * Initialize external logging & error aggregation SDKs.
 * - SENTRY_DSN: initialize Sentry
 * - DD_API_KEY / DATADOG_API_KEY: initialize Datadog (server agent or http client)
 * - GCP_LOGGING_ENABLE: initialize Google Cloud Logging
 * - ELK_FORWARDER: placeholder to configure Filebeat/Logstash forwarding guidance
 */
export function initLoggingIntegrations(opts: InitOpts = {}) {
  const logger = opts.logger;

  // --------------------
  // SENTRY
  // --------------------
  const sentryDsn = process.env.SENTRY_DSN;
  if (sentryDsn) {
    // TODO: Install and configure @sentry/node
    // npm i @sentry/node
    // import * as Sentry from '@sentry/node';
    // Sentry.init({ dsn: sentryDsn, environment: process.env.NODE_ENV, release: process.env.RELEASE });
    // Example:
    // Sentry.init({
    //   dsn: sentryDsn,
    //   environment: process.env.NODE_ENV,
    //   tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.0),
    // });
    logger?.info('Sentry integration enabled (SENTRY_DSN detected)');
  }

  // --------------------
  // DATADOG
  // --------------------
  const datadogApiKey = process.env.DATADOG_API_KEY || process.env.DD_API_KEY;
  if (datadogApiKey) {
    // TODO: Install Datadog server agent or SDK for logs & traces.
    // For server-side Node you often use the Datadog Agent + dd-trace:
    // npm i dd-trace
    // import tracer from 'dd-trace';
    // tracer.init({ service: 'your-service-name', env: process.env.NODE_ENV });
    // For Logs, you can forward pino to datadog agent with pino-datadog or use HTTP intake.
    logger?.info('Datadog integration placeholder enabled (DATADOG_API_KEY detected)');
  }

  // --------------------
  // GOOGLE CLOUD LOGGING
  // --------------------
  const gcpLogging = process.env.GCP_LOGGING_ENABLE === 'true';
  if (gcpLogging) {
    // TODO: Install @google-cloud/logging and configure credentials
    // npm i @google-cloud/logging
    // const logging = new Logging({ projectId: process.env.GCP_PROJECT_ID });
    // const log = logging.log(process.env.GCP_LOG_NAME || 'app-log');
    // configure a pino transport or write structured entries
    logger?.info('Google Cloud Logging integration placeholder enabled (GCP_LOGGING_ENABLE=true)');
  }

  // --------------------
  // ELK / Filebeat / Logstash
  // --------------------
  const elkForward = process.env.ELK_FORWARDER === 'true';
  if (elkForward) {
    // Best practice: keep pino JSON and let Filebeat/Fluentd/Logstash read from STDOUT or file.
    // TODO: Add docs / sample Filebeat config in your repo to forward logs to Elasticsearch.
    logger?.info('ELK/Filebeat forwarding placeholder enabled (ELK_FORWARDER=true)');
  }

  // --------------------
  // Global process handlers
  // --------------------
  // Capture uncaught errors and forward to integrations
  process.on('uncaughtException', (err) => {
    logger?.fatal({ err }, 'uncaughtException - shutting down');
    // Send to Sentry if initialized
    // if (Sentry && Sentry.captureException) Sentry.captureException(err);
    // Ensure flush then exit
    setTimeout(() => process.exit(1), 2000);
  });

  process.on('unhandledRejection', (reason) => {
    logger?.error({ reason }, 'unhandledRejection');
    // if (Sentry && Sentry.captureException) Sentry.captureException(reason);
  });
}


/**
 * reportError: forwarding helper that sends an error to all enabled aggregators.
 * Implementation must be filled for each third-party SDK you enable.
 */
export function reportError(err: unknown, ctx?: Record<string, any>) {
  // TODO: Wire Sentry: Sentry.captureException(err, { extra: ctx });
  // TODO: Wire Datadog/Event API: ...
  // TODO: Wire Google Cloud Error Reporting: ...
  // Default: no-op when SDKs are not installed
  return;
}

/**
 * reportInfo: send non-error telemetry if desired (e.g., important events, metrics).
 */
export function reportInfo(message: string, ctx?: Record<string, any>) {
  // TODO: Wire event logging to chosen backends (Sentry breadcrumbs, Datadog events, etc)
  return;
}