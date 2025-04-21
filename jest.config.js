/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.jest.json',
    }],
  },
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/mcp-servers/node_modules/',
  ],
  collectCoverageFrom: [
    'app/api/**/*.ts',
    'lib/**/*.ts',
    'lib/**/*.tsx',
    'components/**/*.tsx',
    'app/**/*.tsx',
    '!app/layout.tsx',  // Next.js files that have minimal testable logic
    '!app/page.tsx',
    '!app/**/_*.tsx',   // Next.js special files
    '!**/*.d.ts',       // Type declaration files
    '!**/node_modules/**',
    '!**/.next/**',
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '<rootDir>/__tests__/**/*.test.ts',
    '<rootDir>/__tests__/**/*.test.tsx',
  ],
  // Enable verbose output for better debugging
  verbose: true,
  // Fail tests on uncovered lines when running in CI
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  // Allow individual files to have different coverage requirements
  // Temporarily allow some files to have lower coverage while we work on them
  coverageThreshold: {
    global: {
      branches: 90,   // Start with 90% and gradually increase to 100%
      functions: 90,
      lines: 90,
      statements: 90,
    },
    // Example of specific file coverage requirements
    "./lib/utils/**/*.ts": {
      branches: 100,   // Critical utility functions must have 100% coverage
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};

module.exports = config;
