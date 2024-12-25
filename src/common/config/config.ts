import _ from 'lodash';
import { z } from 'zod';
import { config as mockConfig } from '@common/config/config.mock';
import dotenv from 'dotenv';

dotenv.config({ path: __dirname + '/./../../../config/environment/.env' });

/**
 * Schema definition for common configuration.
 */
const commonSchema = z.object({
  nodeEnv: z.enum(['production', 'development', 'test', 'bdd-test']), // Environment type (production, development, etc.)
  debug: z.boolean(), // Debug mode flag
  instanceId: z.number(), // Instance ID
  serverAddress: z.string(), // Server address
  port: z.number(), // Port for the application
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
    ]), // Database type
    host: z.string(), // Database host
    port: z.number(), // Database port
    name: z.string(), // Database name
    user: z.string(), // Database user
    password: z.string(), // Database password
    url: z.string(), // Database URL
    loggin: z.boolean(), // Logging flag for the database
  }),
  systemExchange: z.string(), // System exchange string
  kafkajsNoPartitionerWarning: z.string(), // System exchange string
});

/**
 * Function to create the common configuration from environment variables.
 * @param env NodeJS environment
 */
function createCommon(env: NodeJS.ProcessEnv) {
  return {
    nodeEnv: env['NODE_ENV'] as string, // Node environment variable (e.g., development, production)
    debug: env['DEBUG'] === 'true', // Set debug flag based on the environment
    instanceId: +(env['NODE_APP_INSTANCE'] as string), // Application instance ID
    serverAddress: env['SERVERADDRESS'] as string, // Server address
    port: +(env['PORT'] as string), // Port for the application
    db: {
      type: env['DB_TYPE'] as string, // Database type (e.g., mysql, postgres)
      host: env['DB_HOST'] as string, // Database host
      port: +(env['DB_PORT'] as string), // Database port
      name: env['DB_NAME'] as string, // Database name
      user: env['DB_USER'] as string, // Database user
      password: env['DB_PASSWORD'] as string, // Database password
      url: env['DB_URL'] as string, // Database URL
      loggin: env['DB_LOGGIN'] === 'true', // Database logging flag
    },
    systemExchange: env['SYSTEM_EXCHANGE'] as string, // System exchange value
    kafkajsNoPartitionerWarning: env[
      'KAFKAJS_NO_PARTITIONER_WARNING'
    ] as string, // System exchange value
  };
}

// Type alias for the common configuration
type CommonConfig = ReturnType<typeof createCommon>;

/**
 * Function to extend the base configuration with additional configuration.
 */
export function extendConfig<ExtendedConfig>(input?: {
  extensionSchema: z.AnyZodObject;
  extensionLoader: (env: NodeJS.ProcessEnv) => ExtendedConfig;
}): CommonConfig & ExtendedConfig {
  if (
    !['test', 'bdd-test'].includes(process.env['ENVIRONMENT'] ?? 'development')
  ) {
    dotenv.config();
    const schema = _.merge({}, commonSchema, input?.extensionSchema);
    const result = schema.safeParse(createCommon(process.env)); // Validate the environment variables using the schema

    if (!result.success) {
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

/**
 * Final configuration object exported from the module.
 */
export const config = extendConfig();
