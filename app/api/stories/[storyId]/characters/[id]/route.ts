import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
import { getUserDb } from '@/lib/user-db';
import { createLogger, withApiLogging } from '@/lib/logging';

// Create a logger specifically for the character API
const logger = createLogger('API:Character');

// Define a type for the MongoDB $pull operation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PullOperator = {
  $pull: {
    [key: string]: any;
  };
};

/**
 * GET a single character by ID
 */
async function GET(
  req: NextRequest,
  { params }: { params: { storyId: string; id: string } }
) {
  const { storyId, id } = params;
  logger.debug('Processing GET request for character', { storyId, characterId: id });

  try {
    // Get the current session
    const session = await getServerSession();
    
    if (!session || !session.user) {
      logger.warn('Unauthorized attempt to access character', { storyId, characterId: id });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    logger.debug('Authorized request for character', { userId, storyId, characterId: id });
    
    // Validate the IDs
    if (!ObjectId.isValid(storyId) || !ObjectId.isValid(id)) {
      logger.warn('Invalid ID format for character retrieval', { storyId, characterId: id });
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
    
    const userDb = await getUserDb(userId);
    logger.debug('Retrieved user database connection', { userId });
    
    // Check if the story exists and belongs to the user
    const story = await userDb.collection('stories').findOne({ 
      _id: new ObjectId(storyId)
    });
    
    if (!story) {
      logger.warn('Story not found for character retrieval', { userId, storyId, characterId: id });
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    
    logger.debug('Story found, fetching character', { storyId, storyTitle: story.title, characterId: id });
    
    // Find the character by ID
    const character = await userDb.collection('characters').findOne({ 
      _id: new ObjectId(id),
      storyId: storyId
    });
    
    if (!character) {
      logger.warn('Character not found', { storyId, characterId: id });
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }
    
    logger.info('Character retrieved successfully', { 
      storyId, 
      characterId: id, 
      characterName: character.name 
    });
    
    return NextResponse.json(character);
  } catch (error) {
    logger.error('Error fetching character', { 
      storyId, 
      characterId: id,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({ error: 'Failed to fetch character' }, { status: 500 });
  }
}

/**
 * PUT to update a character
 */
async function PUT(
  req: NextRequest,
  { params }: { params: { storyId: string; id: string } }
) {
  const { storyId, id } = params;
  logger.debug('Processing PUT request to update character', { storyId, characterId: id });
  
  try {
    // Get the current session
    const session = await getServerSession();
    
    if (!session || !session.user) {
      logger.warn('Unauthorized attempt to update character', { storyId, characterId: id });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    logger.debug('Authorized request to update character', { userId, storyId, characterId: id });
    
    // Validate the IDs
    if (!ObjectId.isValid(storyId) || !ObjectId.isValid(id)) {
      logger.warn('Invalid ID format for character update', { storyId, characterId: id });
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
    
    const userDb = await getUserDb(userId);
    const data = await req.json();
    logger.debug('Received character update data', { storyId, characterId: id, updatedName: data.name });
    
    // Check if the story exists and belongs to the user
    const story = await userDb.collection('stories').findOne({ 
      _id: new ObjectId(storyId)
    });
    
    if (!story) {
      logger.warn('Story not found for character update', { userId, storyId, characterId: id });
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    
    // Check if the character exists
    const existingCharacter = await userDb.collection('characters').findOne({ 
      _id: new ObjectId(id),
      storyId: storyId
    });
    
    if (!existingCharacter) {
      logger.warn('Character not found for update', { storyId, characterId: id });
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }
    
    // Validate required fields
    if (!data.name) {
      logger.warn('Missing required field: name', { storyId, characterId: id });
      return NextResponse.json({ error: 'Character name is required' }, { status: 400 });
    }
    
    // Prepare the update data
    const updateData = {
      name: data.name,
      full_name: data.full_name || null,
      type: data.type || existingCharacter.type,
      status: data.status || existingCharacter.status,
      description: data.description || existingCharacter.description,
      physical_appearance: data.physical_appearance || existingCharacter.physical_appearance,
      personality: data.personality || existingCharacter.personality,
      background: data.background || existingCharacter.background,
      relationships: data.relationships || existingCharacter.relationships,
      story_role: data.story_role || existingCharacter.story_role,
      updatedAt: new Date()
    };
    
    logger.debug('Prepared character update data', { 
      storyId, 
      characterId: id, 
      characterName: updateData.name
    });
    
    // Update the character
    const result = await userDb.collection('characters').updateOne(
      { _id: new ObjectId(id), storyId: storyId },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      logger.warn('Character not found during update operation', { storyId, characterId: id });
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }
    
    logger.info('Character updated successfully', { 
      storyId, 
      characterId: id, 
      characterName: updateData.name,
      modifiedCount: result.modifiedCount
    });
    
    // Return the updated character
    const updatedCharacter = await userDb.collection('characters').findOne({
      _id: new ObjectId(id),
      storyId: storyId
    });
    
    return NextResponse.json(updatedCharacter);
  } catch (error) {
    logger.error('Error updating character', { 
      storyId, 
      characterId: id,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({ error: 'Failed to update character' }, { status: 500 });
  }
}

/**
 * DELETE a character
 */
async function DELETE(
  req: NextRequest,
  { params }: { params: { storyId: string; id: string } }
) {
  const { storyId, id } = params;
  logger.debug('Processing DELETE request for character', { storyId, characterId: id });
  
  try {
    // Get the current session
    const session = await getServerSession();
    
    if (!session || !session.user) {
      logger.warn('Unauthorized attempt to delete character', { storyId, characterId: id });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    logger.debug('Authorized request to delete character', { userId, storyId, characterId: id });
    
    // Validate the IDs
    if (!ObjectId.isValid(storyId) || !ObjectId.isValid(id)) {
      logger.warn('Invalid ID format for character deletion', { storyId, characterId: id });
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
    
    const userDb = await getUserDb(userId);
    logger.debug('Retrieved user database connection', { userId });
    
    // Check if the story exists and belongs to the user
    const story = await userDb.collection('stories').findOne({ 
      _id: new ObjectId(storyId)
    });
    
    if (!story) {
      logger.warn('Story not found for character deletion', { userId, storyId, characterId: id });
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    
    // Find the character to confirm it exists
    const character = await userDb.collection('characters').findOne({ 
      _id: new ObjectId(id),
      storyId: storyId
    });
    
    if (!character) {
      logger.warn('Character not found for deletion', { storyId, characterId: id });
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }
    
    logger.debug('Found character for deletion', { 
      storyId, 
      characterId: id, 
      characterName: character.name 
    });
    
    // Delete the character
    await userDb.collection('characters').deleteOne({ 
      _id: new ObjectId(id),
      storyId: storyId
    });
    
    logger.debug('Character deleted, updating relationships', { storyId, characterId: id });
    
    // Update character relationships that reference this character
    const relationshipPull: PullOperator = {
      $pull: {
        relationships: {
          character_id: id
        }
      }
    };
    
    await userDb.collection('characters').updateMany(
      { storyId: storyId },
      relationshipPull
    );
    
    // Also remove this character from any timeline events
    const characterInvolvedPull: PullOperator = {
      $pull: {
        characters_involved: {
          id: id
        }
      }
    };
    
    await userDb.collection('events').updateMany(
      { storyId: storyId },
      characterInvolvedPull
    );
    
    logger.info('Character and references deleted successfully', { 
      storyId, 
      characterId: id, 
      characterName: character.name 
    });
    
    return NextResponse.json({ success: true, message: 'Character deleted successfully' });
  } catch (error) {
    logger.error('Error deleting character', { 
      storyId, 
      characterId: id,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({ error: 'Failed to delete character' }, { status: 500 });
  }
}

// Wrap handlers with API logging middleware
export const GET_handler = withApiLogging(GET, 'GET:character');
export const PUT_handler = withApiLogging(PUT, 'PUT:character');
export const DELETE_handler = withApiLogging(DELETE, 'DELETE:character');

// Export handlers
export { GET_handler as GET, PUT_handler as PUT, DELETE_handler as DELETE };