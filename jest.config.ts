// jest.config.ts
import nextJest from 'next/jest';
import type { Config } from 'jest';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app directory
  dir: "./",
});

const customJestConfig: Config = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  // Polyfill globals for Next API route tests
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy"
  },
};

export default createJestConfig(customJestConfig);
