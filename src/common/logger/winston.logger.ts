import { createLogger, format, transports } from 'winston';

// Define a custom log format
const customFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.printf(
    ({ timestamp, level, message, stack }) =>
      `${timestamp} [${level.toUpperCase()}]: ${stack || message}`,
  ),
);

// Winston logger configuration
export const logger = createLogger({
  level: 'info', // Set minimum log level (info, warn, error, debug)
  format: customFormat,
  transports: [
    // Console output for development
    new transports.Console({
      format: format.combine(format.colorize(), customFormat),
    }),
    // Log errors to a separate file
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    // Log all activities to a general log file
    new transports.File({
      filename: 'logs/combined.log',
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
