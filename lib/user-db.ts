import clientPromise from './mongodb';

// This function creates a new MongoDB database for each user
export async function createUserDb(userId: string) {
  const client = await clientPromise;
  const userDb = client.db(`user-${userId}`);
  
  // Check if user database already exists by looking for a metadata collection
  const collections = await userDb.listCollections({ name: 'metadata' }).toArray();
  
  if (collections.length === 0) {
    // Create initial collections for the user's database
    await userDb.createCollection('metadata');
    await userDb.createCollection('stories');
    await userDb.createCollection('characters');
    await userDb.createCollection('locations');
    await userDb.createCollection('timelines');
    await userDb.createCollection('events');
    
    // Initialize metadata collection with creation timestamp
    await userDb.collection('metadata').insertOne({
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      plan: 'free',
      storiesCount: 0
    });
  }
  
  return userDb;
}

// This function gets a user's database
export async function getUserDb(userId: string) {
  const client = await clientPromise;
  return client.db(`user-${userId}`);
}

// This function gets a specific story database within a user's database
export async function getStoryDb(userId: string, storyId: string) {
  const userDb = await getUserDb(userId);
  return {
    metadata: userDb.collection('stories'),
    characters: userDb.collection('characters').find({ storyId }).toArray(),
    locations: userDb.collection('locations').find({ storyId }).toArray(),
    timelines: userDb.collection('timelines').find({ storyId }).toArray(),
    events: userDb.collection('events').find({ storyId }).toArray(),
  };
}