/**
 * @file init-database.ts
 * @description Database initialization module for The Story Teller
 * @module database/InitDatabase
 * @exports Functions for initializing per-user MongoDB databases
 */

import { Db, MongoClient } from 'mongodb';
import { Logger } from '../logging/logger';
import { 
  storySchema, 
  characterSchema,
  locationSchema,
  timelineEventSchema,
  metadataSchema
} from '../schemas/story-schema';

// Create a logger for database initialization
const logger = new Logger('InitDatabase');

/**
 * Database initialization options
 */
export interface InitDatabaseOptions {
  /**
   * MongoDB connection URI
   */
  mongoUri: string;
  
  /**
   * Database prefix for user-specific databases
   */
  databasePrefix?: string;
  
  /**
   * Whether to drop existing collections (default: false)
   */
  dropExisting?: boolean;
}

/**
 * Initialize a user-specific database
 * @param userId - User ID to create database for
 * @param options - Initialization options
 */
export async function initUserDatabase(
  userId: string,
  options: InitDatabaseOptions
): Promise<Db> {
  try {
    // Initialize parameters
    const prefix = options.databasePrefix || 'user_';
    const dbName = `${prefix}${userId}`;
    
    logger.info(`Initializing database for user ${userId}`, { 
      dbName,
      dropExisting: options.dropExisting
    });
    
    // Connect to MongoDB
    const client = new MongoClient(options.mongoUri);
    await client.connect();
    
    // Get database
    const db = client.db(dbName);
    
    // Create collections with validators
    const collections = [
      { name: 'stories', schema: storySchema },
      { name: 'characters', schema: characterSchema },
      { name: 'locations', schema: locationSchema },
      { name: 'timeline_events', schema: timelineEventSchema },
      { name: 'metadata', schema: metadataSchema }
    ];
    
    // Process each collection
    for (const { name, schema } of collections) {
      // Check if collection exists
      const collectionExists = (await db.listCollections({ name }).toArray()).length > 0;
      
      if (collectionExists) {
        if (options.dropExisting) {
          // Drop existing collection
          await db.collection(name).drop();
          logger.debug(`Dropped existing collection: ${name}`);
        } else {
          // Update validator
          await db.command({
            collMod: name,
            ...schema
          });
          logger.debug(`Updated validator for collection: ${name}`);
          continue;
        }
      }
      
      // Create collection with validator
      await db.createCollection(name, schema);
      logger.debug(`Created collection: ${name}`);
      
      // Add indexes (this is just an example)
      if (name === 'stories') {
        await db.collection(name).createIndex({ title: 1 });
        await db.collection(name).createIndex({ createdAt: -1 });
      } else if (name === 'characters') {
        await db.collection(name).createIndex({ name: 1 });
        await db.collection(name).createIndex({ storyId: 1 });
      } else if (name === 'locations') {
        await db.collection(name).createIndex({ name: 1 });
        await db.collection(name).createIndex({ storyId: 1 });
      } else if (name === 'timeline_events') {
        await db.collection(name).createIndex({ title: 1 });
        await db.collection(name).createIndex({ storyId: 1 });
        await db.collection(name).createIndex({ 'chronology_date': 1 });
      }
    }
    
    // Initialize metadata document if it doesn't exist
    const metadataExists = await db.collection('metadata').findOne({ userId });
    
    if (!metadataExists) {
      await db.collection('metadata').insertOne({
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        plan: 'free',
        storiesCount: 0
      });
      logger.debug(`Initialized metadata for user ${userId}`);
    }
    
    logger.info(`Database initialization complete for user ${userId}`);
    
    return db;
  } catch (error) {
    logger.error(`Failed to initialize database for user ${userId}`, error);
    throw error;
  }
}

/**
 * Get a user-specific database
 * @param userId - User ID to get database for
 * @param options - Database options
 * @returns MongoDB database instance
 */
export async function getUserDatabase(
  userId: string,
  options: { mongoUri: string; databasePrefix?: string }
): Promise<Db> {
  try {
    // Initialize parameters
    const prefix = options.databasePrefix || 'user_';
    const dbName = `${prefix}${userId}`;
    
    logger.debug(`Getting database for user ${userId}`, { dbName });
    
    // Connect to MongoDB
    const client = new MongoClient(options.mongoUri);
    await client.connect();
    
    // Get database
    const db = client.db(dbName);
    
    return db;
  } catch (error) {
    logger.error(`Failed to get database for user ${userId}`, error);
    throw error;
  }
}

/**
 * Seed a user database with sample data
 * @param userId - User ID to seed database for
 * @param options - Database options
 */
export async function seedUserDatabase(
  userId: string,
  options: { mongoUri: string; databasePrefix?: string }
): Promise<void> {
  try {
    logger.info(`Seeding database for user ${userId}`);
    
    // Get user database
    const db = await getUserDatabase(userId, options);
    
    // Check if database already has stories
    const storiesCount = await db.collection('stories').countDocuments();
    
    if (storiesCount > 0) {
      logger.info(`Database already has ${storiesCount} stories, skipping seed`);
      return;
    }
    
    // Create a sample story
    const storyId = new ObjectId();
    await db.collection('stories').insertOne({
      _id: storyId,
      title: 'The Shadow Team Chronicles',
      description: 'A sample story for The Story Teller application',
      coverImage: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId,
      content: '',
      status: 'draft',
      metadata: {
        genre: 'sci-fi',
        setting: 'near-future',
        timeline: 'linear',
        tags: ['sample', 'shadow-team']
      }
    });
    
    // Create some sample characters
    const character1Id = new ObjectId();
    const character2Id = new ObjectId();
    
    await db.collection('characters').insertMany([
      {
        _id: character1Id,
        id: 'character-1',
        storyId: storyId.toString(),
        name: 'Alex Chen',
        full_name: 'Alexandria Chen',
        type: 'protagonist',
        status: 'alive',
        description: 'A brilliant computer scientist with a mysterious past',
        physical_appearance: {
          height: 'average',
          build: 'athletic',
          distinctive_features: ['scar on left cheek', 'bright green eyes'],
          typical_attire: 'casual tech wear'
        },
        personality: {
          traits: ['determined', 'analytical', 'cautious'],
          values: ['truth', 'justice', 'innovation'],
          motivations: ['uncover conspiracy', 'protect team']
        },
        background: {
          birthplace: 'Seattle, WA',
          occupation: 'Cybersecurity Expert',
          significant_events: ['lost parents at age 12', 'recruited by Shadow Team at 25']
        },
        relationships: [
          {
            character_id: 'character-2',
            relationship_type: 'colleague',
            dynamics: 'trusted ally with occasional tension'
          }
        ],
        story_role: 'team leader',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: character2Id,
        id: 'character-2',
        storyId: storyId.toString(),
        name: 'Marcus Wright',
        full_name: 'Marcus James Wright',
        type: 'supporting',
        status: 'alive',
        description: 'A former military operative with exceptional tactical skills',
        physical_appearance: {
          height: 'tall',
          build: 'muscular',
          distinctive_features: ['military tattoo on forearm', 'buzz cut'],
          typical_attire: 'tactical clothing'
        },
        personality: {
          traits: ['loyal', 'disciplined', 'direct'],
          values: ['honor', 'teamwork', 'duty'],
          motivations: ['redeem past mistakes', 'protect civilians']
        },
        background: {
          birthplace: 'Chicago, IL',
          occupation: 'Security Specialist',
          significant_events: ['served in special forces', 'rescued by Alex during failed mission']
        },
        relationships: [
          {
            character_id: 'character-1',
            relationship_type: 'colleague',
            dynamics: 'respects leadership but questions methods'
          }
        ],
        story_role: 'security specialist',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    
    // Create a sample location
    const locationId = new ObjectId();
    await db.collection('locations').insertOne({
      _id: locationId,
      id: 'location-1',
      storyId: storyId.toString(),
      name: 'Shadow Base Alpha',
      type: 'headquarters',
      description: 'A hidden underground facility that serves as the main base for the Shadow Team',
      physical_characteristics: {
        size: 'large',
        climate: 'controlled',
        notable_features: ['reinforced walls', 'advanced security', 'cutting-edge tech']
      },
      cultural_aspects: {
        inhabitants: ['Shadow Team members', 'support staff'],
        customs: ['daily briefing', 'security protocols'],
        history: 'Built five years ago after the Nexus Incident'
      },
      related_locations: [],
      appeared_in: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Create a sample timeline event
    await db.collection('timeline_events').insertOne({
      _id: new ObjectId(),
      id: 'event-1',
      storyId: storyId.toString(),
      title: 'The Nexus Incident',
      description: 'A catastrophic cyber attack that nearly revealed the existence of the Shadow Initiative',
      date: '5 years ago',
      chronology_date: new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000),
      significance: 'major',
      characters_involved: [character1Id.toString(), character2Id.toString()],
      locations_involved: [locationId.toString()],
      preceding_events: [],
      following_events: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Update metadata
    await db.collection('metadata').updateOne(
      { userId },
      { 
        $set: { 
          updatedAt: new Date(),
          storiesCount: 1
        }
      }
    );
    
    logger.info(`Successfully seeded database for user ${userId}`);
  } catch (error) {
    logger.error(`Failed to seed database for user ${userId}`, error);
    throw error;
  }
}

// Helper for MongoDB ObjectId
class ObjectId {
  toString() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}
