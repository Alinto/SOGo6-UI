/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './',
})
const config: Config = {
  clearMocks: true,
  collectCoverage: true,
  coverageProvider: 'v8',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/__mocks__/**',
    '!src/**/node_modules/**',
  ],
  coverageDirectory: 'coverage',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  // Performance optimizations
  maxWorkers: '50%', // Use half of available CPU cores
  testTimeout: 10000, // 10 second timeout instead of default 5s
  // Cache test results
  cacheDirectory: '<rootDir>/.jest-cache',
  // Faster test discovery
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  // Skip node_modules transformation for faster execution
  transformIgnorePatterns: [
    'node_modules/(?!(lucide-react|@radix-ui|next-intl|@formatjs)/)',
  ],
  workerThreads: true,
}

export default createJestConfig(config)
