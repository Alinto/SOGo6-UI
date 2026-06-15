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
    '^next-intl/navigation$': '<rootDir>/__mocks__/next-intl.ts',
    '^next-intl/routing$': '<rootDir>/__mocks__/next-intl/routing.ts',
  },
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: ['node_modules/(?!(next-intl)/)'],
  // Performance optimizations
  maxWorkers: '50%', // Use half of available CPU cores
  testTimeout: 20000, // integration tests under parallel pre-commit (findRelatedTests)
  // Cache test results
  cacheDirectory: '<rootDir>/.jest-cache',
  // Faster test discovery
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  workerThreads: true,
}

export default createJestConfig(config)
