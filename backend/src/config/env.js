import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file in backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Validates required environment variables on startup.
 * Terminates the process with exit code 1 if critical variables are missing.
 */
const validateEnv = () => {
  const errors = [];

  const requiredVars = ['PORT', 'NODE_ENV', 'DATABASE_URL', 'CLIENT_URL'];

  for (const key of requiredVars) {
    if (!process.env[key] || process.env[key].trim() === '') {
      errors.push(`Missing required environment variable: "${key}"`);
    }
  }

  if (process.env.PORT && isNaN(Number(process.env.PORT))) {
    errors.push(`Invalid PORT: "${process.env.PORT}" must be a valid integer.`);
  }

  const validEnvironments = ['development', 'production', 'test'];
  if (process.env.NODE_ENV && !validEnvironments.includes(process.env.NODE_ENV)) {
    errors.push(
      `Invalid NODE_ENV: "${process.env.NODE_ENV}". Must be one of: ${validEnvironments.join(', ')}.`
    );
  }

  if (errors.length > 0) {
    console.error('===================================================');
    console.error(' [FATAL ERROR] ENVIRONMENT CONFIGURATION FAILURE');
    console.error('===================================================');
    errors.forEach((err) => console.error(` ✖ ${err}`));
    console.error('---------------------------------------------------');
    console.error(' Please ensure all required variables are set in .env');
    console.error(' Refer to .env.example for required configuration.');
    console.error('===================================================');
    process.exit(1);
  }
};

// Run environment validation immediately upon module import
validateEnv();

const parseAllowedOrigins = () => {
  const rawOrigins = process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL || 'http://localhost:3000';
  return rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export const config = {
  port: parseInt(process.env.PORT, 10),
  nodeEnv: process.env.NODE_ENV,
  databaseUrl: process.env.DATABASE_URL,
  clientUrl: process.env.CLIENT_URL,
  allowedOrigins: parseAllowedOrigins(),
  jwtSecret: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'super_secret_access_jwt_key_votevibes_2026',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'super_secret_access_jwt_key_votevibes_2026',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_jwt_key_votevibes_2026',
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',
};

export default config;
