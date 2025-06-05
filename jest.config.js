/** @type {import("jest").Config} **/
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: [
    "**/__tests__/**/*.ts",
    "**/__tests__/**/*.js", 
    "**/?(*.)+(spec|test).ts",
    "**/?(*.)+(spec|test).js"
  ],
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { useESM: true }],
  },
  collectCoverageFrom: [
    "src/**/*.{ts,js}",
    "scripts/**/*.{ts,js}",
    "!src/**/*.test.{ts,js}",
    "!src/**/*.spec.{ts,js}",
    "!scripts/dist/**",
    "!**/*.d.ts"
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testTimeout: 30000,
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
};