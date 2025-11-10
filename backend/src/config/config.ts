// Centralized runtime-validated environment config.
// This module throws during startup if required environment variables are missing.
function requiredEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const JWT_SECRET: string = requiredEnv('JWT_SECRET', process.env.JWT_SECRET);

// Add other environment helpers here as needed, e.g. DB connection strings, PORT, etc.
export const PORT = process.env.PORT ?? '3000';

export const BCRYPT_ROUNDS = 10