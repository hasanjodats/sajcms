import { describe, expect, it, jest } from '@jest/globals';
import { logger } from '@common/logger/winston.logger';

jest.mock('winston', () => {
  const mFormat = {
    combine: jest.fn(),
    timestamp: jest.fn(),
    errors: jest.fn(),
    printf: jest.fn(),
    colorize: jest.fn(),
  };

  const mTransports = {
    Console: jest.fn(),
    File: jest.fn(),
  };

  return {
    format: mFormat,
    transports: mTransports,
    createLogger: jest.fn(() => ({
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    })),
  };
});

describe('Logger Tests', () => {
  it('should create a logger instance', () => {
    expect(logger).toBeDefined();
  });

  it('should log info messages', () => {
    const infoSpy = jest.spyOn(logger, 'info');
    logger.info('Test message');
    expect(infoSpy).toHaveBeenCalledWith('Test message');
  });
});
