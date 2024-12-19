import dotenv from 'dotenv';
import _ from 'lodash';
import { z } from 'zod';
import { config as mockConfig } from '@common/config/config.mock';

const commonSchema = z.object({
  nodeEnv: z.enum(['production', 'development', 'test', 'bdd-test']),
  debug: z.boolean(),
  instanceId: z.number(),
  serverAddress: z.string(),
  port: z.number(),
  db: z.object({
    type: z.enum([
      'mysql',
      'postgres',
      'cockroachdb',
      'sap',
      'spanner',
      'mariadb',
      'sqlite',
      'cordova',
      'react-native',
      'nativescript',
      'sqljs',
      'oracle',
      'mssql',
      'mongodb',
      'aurora-mysql',
      'aurora-postgres',
      'expo',
      'better-sqlite3',
      'capacitor',
    ]),
    host: z.string(),
    port: z.number(),
    name: z.string(),
    user: z.string(),
    password: z.string(),
    url: z.string(),
    loggin: z.boolean(),
  }),
  systemExchange: z.string(),
});

function createCommon(env: NodeJS.ProcessEnv) {
  return {
    nodeEnv: env['NODE_ENV'] as string,
    debug: env['DEBUG'] === 'true',
    instanceId: +(env['NODE_APP_INSTANCE'] as string),
    serverAddress: env['SERVERADDRESS'] as string,
    port: +(env['PORT'] as string),
    db: {
      type: env['DB_TYPE'] as string,
      host: env['DB_HOST'] as string,
      port: +(env['DB_PORT'] as string),
      name: env['DB_NAME'] as string,
      user: env['DB_USER'] as string,
      password: env['DB_PASSWORD'] as string,
      url: env['DB_URL'] as string,
      loggin: env['DB_LOGGIN'] === 'true',
    },
    systemExchange: env['SYSTEM_EXCHANGE'] as string,
  };
}

type CommonConfig = ReturnType<typeof createCommon>;

export function extendConfig<ExtendedConfig>(input?: {
  extensionSchema: z.AnyZodObject;
  extensionLoader: (env: NodeJS.ProcessEnv) => ExtendedConfig;
}): CommonConfig & ExtendedConfig {
  if (
    !['test', 'bdd-test'].includes(process.env['ENVIRONMENT'] ?? 'development')
  ) {
    dotenv.config();
    const schema = _.merge({}, commonSchema, input?.extensionSchema);
    const result = schema.safeParse(createCommon(process.env));
    if (result.error) {
      throw new Error(`Config validation error: ${result.error.message}`);
    }
    return _.merge(
      createCommon(process.env),
      input?.extensionLoader(process.env),
    );
  }
  return _.merge(
    { ...mockConfig, environment: process.env['ENVIRONMENT'] as string },
    input?.extensionLoader(process.env),
  );
}

export const config = extendConfig();
