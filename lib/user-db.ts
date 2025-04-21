import { Db, ObjectId } from 'mongodb';
import { clientPromise } from './mongodb';
import { 
  storySchema, 
  characterSchema, 
  locationSchema, 
  timelineEventSchema,
  metadataSchema
} from './schemas/story-schema';
import { setupDatabaseIndexes } from './database/indexes';
import { Logger } from './logging/logger';

// Create a logger instance
const logger = new Logger('user-db');

// This function creates a new MongoDB database for each user
export async function createUserDb(userId: string) {
  try {
    const client = await clientPromise;
    const userDb = client.db(`user-${userId}`);
    
    // Check if user database already exists by looking for a metadata collection
    const collections = await userDb.listCollections({ name: 'metadata' }).toArray();
    
    if (collections.length === 0) {
      logger.info(`Creating new database for user: ${userId}`);
      
      // Create initial collections for the user's database with schema validation
      await userDb.createCollection('metadata', metadataSchema);
      await userDb.createCollection('stories', storySchema);
      await userDb.createCollection('characters', characterSchema);
      await userDb.createCollection('locations', locationSchema);
      await userDb.createCollection('timelines');
      await userDb.createCollection('timelineEvents', timelineEventSchema);
      await userDb.createCollection('relationships');
      await userDb.createCollection('storyContent');
      await userDb.createCollection('settings');
      
      // Initialize metadata collection with creation timestamp
      await userDb.collection('metadata').insertOne({
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        plan: 'free',
        storiesCount: 0
      });
      
      // Setup database indexes for optimal performance
      await setupDatabaseIndexes(userDb, userId);
      
      logger.info(`Database setup completed for user: ${userId}`);
    } else {
      logger.info(`Database already exists for user: ${userId}`);
      
      // Even if the database exists, check and update indexes
      // This ensures that any new indexes added to the application are applied to existing databases
      await setupDatabaseIndexes(userDb, userId);
    }
    
    return userDb;
  } catch (error) {
    logger.error(`Error creating user database:`, { error, userId });
    throw error;
  }
}

// This function gets a user's database
export async function getUserDb(userId: string): Promise<Db> {
  try {
    const client = await clientPromise;
    return client.db(`user-${userId}`);
  } catch (error) {
    logger.error(`Error getting user database:`, { error, userId });
    throw error;
  }
}

/**
 * Get the database name for a specific user
 */
export function getUserDatabaseName(userId: string): string {
  return `user-${userId}`;
}

/**
 * Check if a specific user database exists by userId
 */
export async function userDbExists(userId: string): Promise<boolean> {
  try {
    logger.debug('Checking if user database exists', { userId });
    
    const client = await clientPromise;
    const userDbName = getUserDatabaseName(userId);
    
    // Instead of using admin(), create a connection to the user db
    // and check if the metadata collection exists
    const userDb = client.db(userDbName);
    const collections = await userDb.listCollections({ name: 'metadata' }).toArray();
    
    const exists = collections.length > 0;
    logger.debug('User database exists check completed', { userId, exists });
    
    return exists;
  } catch (error) {
    logger.error('Error checking if user database exists', { userId, error });
    return false; // Return false on error instead of throwing
  }
}

// This function gets a specific story including all its related data
export async function getStoryWithRelatedData(userId: string, storyId: string) {
  try {
    const userDb = await getUserDb(userId);
    
    // Get the story metadata
    const story = await userDb.collection('stories').findOne({ _id: new ObjectId(storyId) });
    
    if (!story) {
      return null;
    }
    
    // Get related data
    const [characters, locations, timelineEvents, relationships] = await Promise.all([
      userDb.collection('characters').find({ storyId }).toArray(),
      userDb.collection('locations').find({ storyId }).toArray(),
      userDb.collection('timelineEvents').find({ storyId }).toArray(),
      userDb.collection('relationships').find({ storyId }).toArray()
    ]);
    
    // Get the latest content version
    const content = await userDb.collection('storyContent')
      .find({ storyId })
      .sort({ version: -1 })
      .limit(1)
      .toArray();
    
    return {
      story,
      characters,
      locations,
      timelineEvents,
      relationships,
      content: content.length > 0 ? content[0] : null,
    };
  } catch (error) {
    logger.error(`Error getting story with related data:`, { error, userId, storyId });
    throw error;
  }
}

// Generate a unique ID for new entities
export function generateEntityId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Function to update database schema and indexes for all users
// This can be called during application startup or as a maintenance task
export async function updateAllUserDatabases() {
  try {
    logger.info('Starting database schema and index update for all users');
    
    const client = await clientPromise;
    
    // Instead of using admin().listDatabases(), we'll use a different approach
    // We'll maintain a collection in the system database to track user IDs
    const systemDb = client.db('system');
    
    // Check if the users collection exists, if not, create it
    const collections = await systemDb.listCollections({ name: 'users' }).toArray();
    if (collections.length === 0) {
      await systemDb.createCollection('users');
      logger.info('Created users collection in system database');
    }
    
    // Get all user IDs from the users collection
    const users = await systemDb.collection('users').find({}).toArray();
    const userIds = users.map(user => user.userId);
    
    logger.info(`Found ${userIds.length} users to update`);
    
    for (const userId of userIds) {
      try {
        const dbName = getUserDatabaseName(userId);
        const userDb = client.db(dbName);
        
        logger.info(`Updating database for user: ${userId}`);
        
        // Ensure all required collections exist
        const requiredCollections = [
          'metadata', 'stories', 'characters', 'locations', 
          'timelineEvents', 'relationships', 'storyContent', 'settings'
        ];
        
        const existingCollections = (await userDb.listCollections().toArray())
          .map(c => c.name);
        
        for (const collName of requiredCollections) {
          if (!existingCollections.includes(collName)) {
            logger.info(`Creating missing collection: ${collName} for user: ${userId}`);
            
            // Apply the appropriate schema validation if available
            let options = {};
            switch (collName) {
              case 'stories':
                options = storySchema;
                break;
              case 'characters':
                options = characterSchema;
                break;
              case 'locations':
                options = locationSchema;
                break;
              case 'timelineEvents':
                options = timelineEventSchema;
                break;
              case 'metadata':
                options = metadataSchema;
                break;
            }
            
            await userDb.createCollection(collName, options);
          }
        }
        
        // Setup database indexes for optimal performance
        await setupDatabaseIndexes(userDb, userId);
        
        logger.info(`Successfully updated database for user: ${userId}`);
      } catch (dbError) {
        logger.error(`Error updating database for user: ${userId}`, { dbError });
        // Continue with other databases even if one fails
      }
    }
    
    logger.info('Completed database schema and index update for all users');
    return { success: true, count: userIds.length };
  } catch (error) {
    logger.error('Failed to update all user databases', { error });
    throw error;
  }
}
