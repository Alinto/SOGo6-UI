/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from "jest";
import nextJest from "next/jest.js";
const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});
const config: Config = {
  clearMocks: true,
  collectCoverage: true,
  coverageProvider: "v8",
  coverageDirectory: "coverage",
  testEnvironment: "jsdom",
};

export default createJestConfig(config);
