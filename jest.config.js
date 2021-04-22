const { pathsToModuleNameMapper } = require('ts-jest/utils');
const { compilerOptions } = require('./tsconfig');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testRegex: [
    '/src/opentelemetry-export-timestamp-enrichment/.*\\.spec\\.ts',
    '/src/opentelemetry-exporter-sumologic/.*\\.spec\\.ts',
  ],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
  setupFiles: ['jsdom-worker', './src/setup-tests.ts'],
};
