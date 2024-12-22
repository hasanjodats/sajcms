module.exports = async () => {
  return {
    verbose: true,
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js'],
    rootDir: '../../src',
    testRegex: '.unit.spec.ts$',
    maxConcurrency: 1,
    maxWorkers: '50%',
    testRunner: 'jest-circus/runner',
    moduleNameMapper: {
      '@~/(.*)': '<rootDir>/$1',
      '@common/(.*)': '<rootDir>/common/$1',
      '@core/(.*)': '<rootDir>/microservices/core/$1',
    },
    reporters: [
      'default',
      [
        'jest-junit',
        {
          suiteName: 'SAJCMS Unit Tests',
          outputDirectory: './documentation/test/unit/artifacts/reports',
          outputName: 'junit.xml',
        },
      ],
    ],
    modulePathIgnorePatterns: ['/node_modules/'],
    transform: {
      '^.+\\.ts$': 'ts-jest',
    },
    transformIgnorePatterns: ['/node_modules/'],
  };
};
