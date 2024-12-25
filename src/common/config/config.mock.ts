import { config as original } from '@common/config/config';

/**
 * Common test configuration
 */
export const config: typeof original = {
  nodeEnv: 'test',
  debug: false,
  instanceId: 0,
  serverAddress: 'https://127.0.0.1',
  port: 3000,
  db: {
    type: 'sqlite',
    host: 'localhost',
    port: 1521,
    name: 'test',
    user: 'test',
    password: 'test',
    url: '',
    loggin: false,
  },
  systemExchange: 'testcms',
  kafkajsNoPartitionerWarning: '1',
};
