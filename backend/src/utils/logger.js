import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import config from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const logsDir = path.resolve(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let logMsg = `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      logMsg += ` ${JSON.stringify(meta)}`;
    }
    if (stack) {
      logMsg += `\n${stack}`;
    }
    return logMsg;
  })
);

// Define console format with colors for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let logMsg = `[${timestamp}] ${level}: ${message}`;
    if (Object.keys(meta).length > 0) {
      logMsg += ` ${JSON.stringify(meta)}`;
    }
    if (stack) {
      logMsg += `\n${stack}`;
    }
    return logMsg;
  })
);

// Transports configuration
const transports = [
  // File transport for error level logs
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  // File transport for all combined logs
  new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

// If in development or not production, also log to console
if (config.nodeEnv !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: 'debug',
    })
  );
} else {
  // Console logging for production (standard JSON or log format)
  transports.push(
    new winston.transports.Console({
      format: logFormat,
      level: 'info',
    })
  );
}

// Create Winston Logger instance
export const logger = winston.createLogger({
  level: config.isDevelopment ? 'debug' : 'info',
  format: logFormat,
  transports,
  exceptionHandlers: [
    new winston.transports.File({ filename: path.join(logsDir, 'error.log') }),
    new winston.transports.Console({ format: consoleFormat }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: path.join(logsDir, 'error.log') }),
    new winston.transports.Console({ format: consoleFormat }),
  ],
  exitOnError: false,
});

export default logger;
