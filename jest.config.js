const { pathsToModuleNameMapper } = require('ts-jest/utils');
const { compilerOptions } = require('./tsconfig');

module.exports = {
  rootDir: './',
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: [
    '<rootDir>/src/opentelemetry-export-timestamp-enrichment/index.spec.ts',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    'src/opentelemetry-js',
    'src/opentelemetry-js-api',
    'src/opentelemetry-js-contrib',
  ],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
