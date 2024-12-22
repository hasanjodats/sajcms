const common = {
  interpreter: 'node',
  interpreter_args: ['-r', 'ts-node/register', '-r', 'tsconfig-paths/register'],
  env_production: {
    NODE_ENV: 'production',
    pmx: 'false',
  },
  env_development: {
    NODE_ENV: 'development',
    pmx: 'false',
  },
  merge_logs: true,
  shutdown_with_message: true,
  source_map_support: true,
  instances: process.env.NODE_ENV === 'production' ? 'max' : 1,
  exec_mode: process.env.NODE_ENV === 'production' ? 'cluster' : 'fork',
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
