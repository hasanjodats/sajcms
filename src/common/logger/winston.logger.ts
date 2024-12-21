import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// Define a custom log format
const customFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.printf(
    ({ timestamp, level, message, stack }) =>
      `${timestamp} [${level.toUpperCase()}]: ${stack || message}`,
  ),
);

// Determine the log level based on the environment (development or production)
const logLevel = process.env.NODE_ENV === 'production' ? 'warn' : 'debug';

// Winston logger configuration
export const logger = createLogger({
  level: logLevel, // Set dynamic log level based on environment
  format: customFormat,
  transports: [
    // Console output for development (colorized output for better readability)
    new transports.Console({
      format: format.combine(format.colorize(), customFormat),
    }),
    // Log errors to a separate file with daily rotation
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true, // Compress old logs
      maxSize: '20m', // Max size per log file before rotation
      maxFiles: '14d', // Keep logs for the last 14 days
    }),
    // Log all activities to a general log file with daily rotation
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d', // Keep logs for the last 30 days
    }),
  ],
  exceptionHandlers: [
    // Handle uncaught exceptions and log them
    new transports.File({ filename: 'logs/exceptions.log' }),
  ],
  rejectionHandlers: [
    // Handle unhandled promise rejections
    new transports.File({ filename: 'logs/rejections.log' }),
  ],
});
