require('dotenv').config();

const isDebug = process.env.DEBUG === 'true';
const nodeEnv = process.env.NODE_ENV || 'development';

const common = {
  interpreter: 'node',
  interpreter_args: [
    '-r',
    'ts-node/register',
    '-r',
    'tsconfig-paths/register',
    ...(isDebug ? ['--inspect=0'] : []),
  ],
  env: {
    NODE_ENV: nodeEnv,
    pmx: 'false',
  },
  merge_logs: true,
  shutdown_with_message: true,
  source_map_support: true,
  exec_mode: nodeEnv === 'development' ? 'fork' : 'cluster',
  instances: nodeEnv === 'development' ? 1 : 'max',
  ignore_watch: ['node_modules', 'src/**/*.spec.ts'],
};

export const apps = [
  {
    ...common,
    name: 'index',
    script: 'src/microservices/core/index.ts',
    watch: ['src/microservices/core', 'src/common'],
  },
];
