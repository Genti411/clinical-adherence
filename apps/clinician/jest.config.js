/* eslint-disable @typescript-eslint/no-require-imports -- Jest config must be CommonJS */
const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const customConfig = {
  testEnvironment: 'jsdom',
  testMatch: ['**/*.test.{ts,tsx}'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@clinical/exercise-core$': '<rootDir>/../../packages/exercise-core/src/index.ts',
  },
  transform: {
    '^.+\\.(ts|tsx|js|jsx|mjs)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        module: 'commonjs',
        moduleResolution: 'node',
        strict: true,
      },
    }],
  },
  transformIgnorePatterns: [],
};

module.exports = createJestConfig(customConfig);
