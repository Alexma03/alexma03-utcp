/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true, isolatedModules: true, tsconfig: { module: 'ESNext', target: 'ES2022' } }],
  },
  testMatch: ['**/tests/**/*.test.ts'],
  testTimeout: 60000,
};
