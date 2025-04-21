/**
 * Custom MongoDB type declarations
 * 
 * This file provides TypeScript type extensions for MongoDB objects.
 */

// Declare required MongoDB types
declare module 'mongodb' {
  export class ObjectId {
    constructor(id?: string | ObjectId);
    toString(): string;
    toHexString(): string;
    getTimestamp(): Date;
    static isValid(id: string | ObjectId | undefined | null): boolean;
    equals(otherId: ObjectId): boolean;
  }

  export class MongoClient {
    constructor(uri: string, options?: any);
    connect(): Promise<MongoClient>;
    db(name?: string): Db;
    close(): Promise<void>;
    on(event: string, listener: (...args: any[]) => void): void;
  }

  export class Db {
    collection<T = any>(name: string): Collection<T>;
    listCollections(filter?: any, options?: any): Cursor<any>;
    createCollection(name: string, options?: any): Promise<Collection<any>>;
  }

  export interface Collection<T = Document> {
    findOne(filter?: any, options?: any): Promise<T | null>;
    find(filter?: any, options?: any): Cursor<T>;
    insertOne(doc: any, options?: any): Promise<any>;
    insertMany(docs: any[], options?: any): Promise<any>;
    updateOne(filter: any, update: any, options?: any): Promise<any>;
    updateMany(filter: any, update: any, options?: any): Promise<any>;
    deleteOne(filter: any, options?: any): Promise<any>;
    deleteMany(filter: any, options?: any): Promise<any>;
    aggregate<U = T>(pipeline: any[], options?: any): Cursor<U>;
    createIndex(fieldOrSpec: any, options?: any): Promise<string>;
    countDocuments(filter?: any, options?: any): Promise<number>;
    collectionName: string;
  }

  export interface Cursor<T = any> {
    toArray(): Promise<T[]>;
    forEach(callback: (doc: T) => void): Promise<void>;
    sort(spec: any): Cursor<T>;
    limit(n: number): Cursor<T>;
    skip(n: number): Cursor<T>;
    project(spec: any): Cursor<T>;
    count(): Promise<number>;
  }

  export interface Document {
    _id?: ObjectId | string;
    title?: string;
    userId?: string;
    name?: string;
    description?: string;
    type?: string;
    content?: string;
    date?: string;
    metadata?: Record<string, any>;
  }

  // Add type assertions for MongoDB result properties
  interface InsertManyResult {
    insertedCount: number;
  }
  
  interface UpdateResult {
    modifiedCount: number;
    matchedCount: number;
    upsertedCount: number;
  }
  
  interface DeleteResult {
    deletedCount: number;
  }
}

// Extend the console with additional logging methods
interface Console {
  log(message?: any, ...optionalParams: any[]): void;
  info(message?: any, ...optionalParams: any[]): void;
  warn(message?: any, ...optionalParams: any[]): void;
  error(message?: any, ...optionalParams: any[]): void;
  debug(message?: any, ...optionalParams: any[]): void;
  trace(message?: any, ...optionalParams: any[]): void;
}

// Extend Request objects for logging
interface Request {
  url: string;
  method: string;
}

// Extend XMLHttpRequest for logging
interface XMLHttpRequest {
  __logInfo?: {
    url: string;
    method: string;
    startTime: number;
  };
}

// Extend PerformanceEntry for Web Vitals
interface PerformanceEntry {
  processingStart?: number;
} 