import { Db, ObjectId } from 'mongodb';
import { clientPromise } from './mongodb';
import { 
  storySchema, 
  characterSchema, 
  locationSchema, 
  timelineEventSchema,
  metadataSchema
} from './schemas/story-schema';

// This function creates a new MongoDB database for each user
export async function createUserDb(userId: string) {
  try {
    const client = await clientPromise;
    const userDb = client.db(`user-${userId}`);
    
    // Check if user database already exists by looking for a metadata collection
    const collections = await userDb.listCollections({ name: 'metadata' }).toArray();
    
    if (collections.length === 0) {
      console.log(`Creating new database for user: ${userId}`);
      
      // Create initial collections for the user's database with schema validation
      await userDb.createCollection('metadata', metadataSchema);
      await userDb.createCollection('stories', storySchema);
      await userDb.createCollection('characters', characterSchema);
      await userDb.createCollection('locations', locationSchema);
      await userDb.createCollection('timelines');
      await userDb.createCollection('events', timelineEventSchema);
      
      // Initialize metadata collection with creation timestamp
      await userDb.collection('metadata').insertOne({
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        plan: 'free',
        storiesCount: 0
      });
      
      console.log(`Database setup completed for user: ${userId}`);
    } else {
      console.log(`Database already exists for user: ${userId}`);
    }
    
    return userDb;
  } catch (error) {
    console.error(`Error creating user database: ${error}`);
    throw error;
  }
}

// This function gets a user's database
export async function getUserDb(userId: string): Promise<Db> {
  try {
    const client = await clientPromise;
    return client.db(`user-${userId}`);
  } catch (error) {
    console.error(`Error getting user database: ${error}`);
    throw error;
  }
}

// This function checks if a user's database exists
export async function userDbExists(userId: string): Promise<boolean> {
  try {
    const client = await clientPromise;
    const userDb = client.db(`user-${userId}`);
    const collections = await userDb.listCollections({ name: 'metadata' }).toArray();
    return collections.length > 0;
  } catch (error) {
    console.error(`Error checking if user database exists: ${error}`);
    return false;
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
    const [characters, locations, events] = await Promise.all([
      userDb.collection('characters').find({ storyId }).toArray(),
      userDb.collection('locations').find({ storyId }).toArray(),
      userDb.collection('events').find({ storyId }).toArray()
    ]);
    
    return {
      story,
      characters,
      locations,
      events
    };
  } catch (error) {
    console.error(`Error getting story with related data: ${error}`);
    throw error;
  }
}

// Generate a unique ID for new entities
export function generateEntityId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}