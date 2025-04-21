/**
 * Jest setup file
 * 
 * This file runs before each test file
 */

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  // Keep error and warn for debugging
  error: jest.fn(),
  warn: jest.fn(),
  // Silence info and log in tests
  info: jest.fn(),
  log: jest.fn(),
  debug: jest.fn(),
};

// Mock NextAuth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(() => Promise.resolve({
    user: {
      name: 'Test User',
      email: 'test@example.com',
      image: 'https://example.com/avatar.png',
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  })),
}));

// Mock lib/auth
jest.mock('@/lib/auth', () => ({
  authOptions: {
    providers: [],
    callbacks: {
      session: jest.fn(),
      jwt: jest.fn(),
    },
  },
}));

// Mock MongoDB
jest.mock('@/lib/mongodb', () => ({
  clientPromise: Promise.resolve({
    db: jest.fn(() => ({
      collection: jest.fn(() => ({
        findOne: jest.fn(),
        find: jest.fn(() => ({
          sort: jest.fn(() => ({
            limit: jest.fn(() => ({
              toArray: jest.fn(() => Promise.resolve([])),
            })),
          })),
          toArray: jest.fn(() => Promise.resolve([])),
        })),
        insertOne: jest.fn(() => Promise.resolve({ insertedId: 'mock-id' })),
        updateOne: jest.fn(() => Promise.resolve({ modifiedCount: 1 })),
        deleteOne: jest.fn(() => Promise.resolve({ deletedCount: 1 })),
        createIndex: jest.fn(() => Promise.resolve()),
        listCollections: jest.fn(() => ({
          toArray: jest.fn(() => Promise.resolve([])),
        })),
      })),
      listCollections: jest.fn(() => ({
        toArray: jest.fn(() => Promise.resolve([])),
      })),
      createCollection: jest.fn(() => Promise.resolve()),
    })),
  }),
}));

// Mock the logging library
jest.mock('@/lib/logging/init', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R;
    }
  }
}

expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

beforeAll(() => {
  // Global setup before all tests
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/api';
  process.env.MONGODB_URI = 'mongodb://localhost:27017/storyteller-test';
  process.env.NEXTAUTH_URL = 'http://localhost:3000';
  process.env.NEXTAUTH_SECRET = 'test-secret';
});

afterAll(() => {
  // Global teardown after all tests
  jest.clearAllMocks();
});
