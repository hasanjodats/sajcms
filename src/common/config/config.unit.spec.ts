import { describe, expect, it } from '@jest/globals';
import { extendConfig } from '@common/config/config';
import { z } from 'zod';

describe('Config Tests', () => {
  it('should load config correctly from environment variables', () => {
    process.env.NODE_ENV = 'development';
    process.env.DEBUG = 'true';
    process.env.NODE_APP_INSTANCE = '0';
    process.env.SERVERADDRESS = 'localhost';
    process.env.PORT = '3000';
    process.env.DB_TYPE = 'postgres';
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '5432';
    process.env.DB_NAME = 'postgres';
    process.env.DB_USER = 'postgres';
    process.env.DB_PASSWORD = '123456';
    process.env.DB_LOGGIN = 'true';
    process.env.SYSTEM_EXCHANGE = 'SAJCMS';

    const config = extendConfig({
      extensionSchema: z.object({
        kafkajsNoPartitionerWarning: z.string(),
      }),
      extensionLoader: (env) => ({
        kafkajsNoPartitionerWarning:
          env['KAFKAJS_NO_PARTITIONER_WARNING'] || '1',
      }),
    });

    expect(config.nodeEnv).toBe('development');
    expect(config.debug).toBe(true);
    expect(config.db.type).toBe('postgres');
    expect(config.db.host).toBe('localhost');
    expect(config.db.port).toBe(5432);
    expect(config.db.name).toBe('postgres');
    expect(config.kafkajsNoPartitionerWarning).toBe('1');
  });

  it('should throw error if validation fails', () => {
    process.env.NODE_ENV = 'development';
    process.env.DEBUG = 'not_a_boolean';

    expect(() => {
      extendConfig({
        extensionSchema: z.object({
          customValue: z.string(),
        }),
        extensionLoader: (env) => ({
          customValue: env['CUSTOM_VALUE'] || 'default',
        }),
      });
    }).toThrowError('Config validation error');
  });

  it('should use mock config in test environment', () => {
    process.env.ENVIRONMENT = 'test';

    const mockConfig = extendConfig({
      extensionSchema: z.object({
        customValue: z.string(),
      }),
      extensionLoader: (env) => ({
        customValue: env['CUSTOM_VALUE'] || 'default',
      }),
    });

    expect(mockConfig.nodeEnv).toBe('test');
    expect(mockConfig.db.type).toBe('sqlite');
  });
});
