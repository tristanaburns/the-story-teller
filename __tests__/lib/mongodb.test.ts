import { MongoClient } from 'mongodb';
import {
  connectToDatabase,
  getCollection,
  disconnectFromDatabase,
  getDb,
} from '@/lib/mongodb';

// Mock MongoDB client
jest.mock('mongodb', () => {
  const mockCollection = {
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn(),
    insertOne: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
    toArray: jest.fn(),
  };
  
  const mockDb = {
    collection: jest.fn().mockReturnValue(mockCollection),
  };
  
  const mockClient = {
    connect: jest.fn(),
    close: jest.fn(),
    db: jest.fn().mockReturnValue(mockDb),
  };
  
  return {
    MongoClient: jest.fn().mockImplementation(() => mockClient),
  };
});

// Mock process.env
const originalEnv = process.env;

describe('MongoDB Connection', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.MONGODB_URI = 'mongodb://fakemongo:27017/test';
    process.env.MONGODB_DB = 'test-db';
    
    // Clear the cached client and db instances between tests
    (global as any).__mongoClientPromise = undefined;
    (global as any).__db = undefined;
  });
  
  afterAll(() => {
    process.env = originalEnv;
  });
  
  it('should connect to MongoDB using environment variables', async () => {
    const clientPromise = await connectToDatabase();
    
    expect(MongoClient).toHaveBeenCalledWith(process.env.MONGODB_URI, expect.any(Object));
    expect(clientPromise).toBeDefined();
  });
  
  it('should reuse the existing connection when called multiple times', async () => {
    const firstClientPromise = await connectToDatabase();
    const secondClientPromise = await connectToDatabase();
    
    expect(MongoClient).toHaveBeenCalledTimes(1);
    expect(firstClientPromise).toBe(secondClientPromise);
  });
  
  it('should throw an error if MONGODB_URI is not defined', async () => {
    delete process.env.MONGODB_URI;
    
    await expect(connectToDatabase()).rejects.toThrow(
      'Please define the MONGODB_URI environment variable'
    );
  });
  
  it('should throw an error if MONGODB_DB is not defined', async () => {
    delete process.env.MONGODB_DB;
    
    await expect(getDb()).rejects.toThrow(
      'Please define the MONGODB_DB environment variable'
    );
  });
  
  it('should get database instance with the correct database name', async () => {
    const mockClient = {
      db: jest.fn().mockReturnValue({ test: 'db' }),
    };
    
    (global as any).__mongoClientPromise = Promise.resolve(mockClient);
    
    const db = await getDb();
    
    expect(mockClient.db).toHaveBeenCalledWith(process.env.MONGODB_DB);
    expect(db).toEqual({ test: 'db' });
  });
  
  it('should reuse the same db instance on multiple calls', async () => {
    const mockDb = { test: 'db' };
    const mockClient = {
      db: jest.fn().mockReturnValue(mockDb),
    };
    
    (global as any).__mongoClientPromise = Promise.resolve(mockClient);
    
    const firstDb = await getDb();
    
    // Set __db to simulate caching
    (global as any).__db = mockDb;
    
    // Mock should not be called on second invocation if cache is working
    mockClient.db.mockClear();
    
    const secondDb = await getDb();
    
    expect(firstDb).toBe(secondDb);
    expect(mockClient.db).not.toHaveBeenCalled();
  });
});

describe('MongoDB Utilities', () => {
  let originalEnv: NodeJS.ProcessEnv;
  
  beforeAll(() => {
    // Save original environment
    originalEnv = process.env;
    
    // Setup test environment
    process.env = {
      ...originalEnv,
      MONGODB_URI: 'mongodb://localhost:27017/test',
    };
  });
  
  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('connectToDatabase', () => {
    it('connects to the database using the environment URI', async () => {
      const client = await connectToDatabase();
      
      // Verify MongoClient was instantiated with correct URI
      expect(MongoClient).toHaveBeenCalledWith(
        'mongodb://localhost:27017/test',
        expect.any(Object)
      );
      
      // Verify client.connect was called
      expect(client.connect).toHaveBeenCalled();
    });
    
    it('returns the same client instance on subsequent calls', async () => {
      const client1 = await connectToDatabase();
      const client2 = await connectToDatabase();
      
      // Should be the same instance (singleton pattern)
      expect(client1).toBe(client2);
      
      // connect should only be called once
      expect(client1.connect).toHaveBeenCalledTimes(1);
    });
    
    it('throws an error if MONGODB_URI is not defined', async () => {
      // Temporarily remove MONGODB_URI
      const mongoUri = process.env.MONGODB_URI;
      delete process.env.MONGODB_URI;
      
      await expect(connectToDatabase()).rejects.toThrow(
        'Please define the MONGODB_URI environment variable'
      );
      
      // Restore MONGODB_URI
      process.env.MONGODB_URI = mongoUri;
    });
  });
  
  describe('getCollection', () => {
    it('returns a collection from the database', async () => {
      const client = await connectToDatabase();
      const collection = getCollection('users');
      
      // Verify client.db was called
      expect(client.db).toHaveBeenCalled();
      
      // Verify db.collection was called with correct name
      const mockDb = client.db();
      expect(mockDb.collection).toHaveBeenCalledWith('users');
    });
    
    it('caches collections for repeated use', () => {
      const collection1 = getCollection('users');
      const collection2 = getCollection('users');
      
      // Should be the same collection instance
      expect(collection1).toBe(collection2);
      
      // Verify db.collection was only called once
      const client = (MongoClient as jest.Mock).mock.results[0].value;
      const mockDb = client.db();
      expect(mockDb.collection).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('disconnectFromDatabase', () => {
    it('closes the database connection', async () => {
      const client = await connectToDatabase();
      await disconnectFromDatabase();
      
      // Verify client.close was called
      expect(client.close).toHaveBeenCalled();
    });
    
    it('does nothing if no connection exists', async () => {
      // Reset client to simulate no connection
      jest.resetModules();
      
      // This should not throw an error
      await disconnectFromDatabase();
    });
  });
}); 