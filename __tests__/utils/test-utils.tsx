/**
 * Test Utilities
 * 
 * This file contains utilities for testing components and functions
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';
import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Mock session for testing authenticated components
export const mockSession: Session = {
  user: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    image: 'https://example.com/avatar.png',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

// Custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  session?: Session | null;
}

export function customRender(
  ui: ReactElement,
  { session = mockSession, ...options }: CustomRenderOptions = {}
) {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
      <SessionProvider session={session}>
        {children}
      </SessionProvider>
    );
  };

  return render(ui, { wrapper: Wrapper, ...options });
}

// MongoDB memory server for database tests
let mongoMemoryServer: MongoMemoryServer;
let mongoClient: MongoClient;

/**
 * Start an in-memory MongoDB instance for testing
 */
export async function startMongoMemoryServer() {
  mongoMemoryServer = await MongoMemoryServer.create();
  const uri = mongoMemoryServer.getUri();
  mongoClient = new MongoClient(uri);
  await mongoClient.connect();
  return mongoClient;
}

/**
 * Stop the in-memory MongoDB instance
 */
export async function stopMongoMemoryServer() {
  if (mongoClient) {
    await mongoClient.close();
  }
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
}

/**
 * Get the MongoDB client
 */
export function getMongoClient() {
  if (!mongoClient) {
    throw new Error('MongoDB memory server is not started');
  }
  return mongoClient;
}

/**
 * Create a MongoDB database with test data
 */
export async function createTestDatabase(dbName: string, collections: Record<string, any[]>) {
  const client = getMongoClient();
  const db = client.db(dbName);
  
  // Create collections and insert data
  for (const [collectionName, documents] of Object.entries(collections)) {
    if (documents.length > 0) {
      const collection = db.collection(collectionName);
      await collection.insertMany(documents);
    }
  }
  
  return db;
}

/**
 * Clear all data from a MongoDB database
 */
export async function clearTestDatabase(dbName: string) {
  const client = getMongoClient();
  const db = client.db(dbName);
  const collections = await db.collections();
  
  for (const collection of collections) {
    await collection.deleteMany({});
  }
}

/**
 * Mock API response for testing
 */
export function mockApiResponse(status: number, data: any) {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data)),
    headers: new Headers(),
  };
}

/**
 * Wait for a specified amount of time
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a mock logger for testing
 */
export function createMockLogger() {
  return {
    trace: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
    log: jest.fn(),
    setContext: jest.fn().mockReturnThis(),
    setCorrelationId: jest.fn().mockReturnThis(),
    getCorrelationId: jest.fn().mockReturnValue('test-correlation-id'),
    createChildLogger: jest.fn(),
    trackMethod: jest.fn().mockReturnValue({
      end: jest.fn().mockImplementation(result => result),
      error: jest.fn().mockImplementation(error => { throw error; }),
    }),
  };
}

/**
 * Create spy functions for all methods of an object
 */
export function spyOnAllFunctions<T extends object>(obj: T): jest.Mocked<T> {
  const spiedObj = { ...obj } as any;
  
  for (const key of Object.keys(obj)) {
    if (typeof obj[key as keyof T] === 'function') {
      spiedObj[key] = jest.spyOn(obj, key as keyof T);
    }
  }
  
  return spiedObj as jest.Mocked<T>;
}

// Re-export everything from testing-library
export * from '@testing-library/react';
