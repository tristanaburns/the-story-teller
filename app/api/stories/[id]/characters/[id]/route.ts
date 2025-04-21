import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
import { getUserDb } from '@/lib/user-db';
import { createLogger, withApiLogging } from '@/lib/logging';

/**
 * Character API for managing individual characters in a story
 * This handles GET, PUT, and DELETE operations for a specific character within a story
 */

// Create a logger specifically for the individual character API
const logger = createLogger('API:CharacterDetail');

// Define a type for the MongoDB $pull operation
type PullOperator = {
  $pull: {
    [key: string]: unknown;
  };
};

/**
 * GET a single character by ID
 */
async function GET(
  req: NextRequest,
  { params }: { params: { id: string[] } }
) {
  logger.debug('Processing GET request for individual character', { 
    storyId: params.id[0], 
    characterId: params.id[1] 
  });
  
  try {
    // Get the current session
    const session = await getServerSession();
    
    if (!session || !session.user) {
      logger.warn('Unauthorized attempt to access character', { 
        storyId: params.id[0], 
        characterId: params.id[1] 
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const storyId = params.id[0];
    const characterId = params.id[1];
    
    logger.debug('Authorized request for character', { userId, storyId, characterId });
    
    // Validate the IDs
    if (!ObjectId.isValid(storyId) || !ObjectId.isValid(characterId)) {
      logger.warn('Invalid ID format provided', { storyId, characterId });
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
    
    const userDb = await getUserDb(userId);
    logger.debug('Retrieved user database connection', { userId });
    
    // Check if the story exists and belongs to the user
    const story = await userDb.collection('stories').findOne({ 
      _id: new ObjectId(storyId)
    });
    
    if (!story) {
      logger.warn('Story not found for character request', { userId, storyId });
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    
    logger.debug('Story found, fetching character', { storyId, characterId });
    
    // Find the character by ID
    const character = await userDb.collection('characters').findOne({ 
      _id: new ObjectId(characterId),
      storyId: storyId
    });
    
    if (!character) {
      logger.warn('Character not found', { storyId, characterId });
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }
    
    logger.info('Character retrieved successfully', { 
      storyId, 
      characterId,
      characterName: character.name 
    });
    
    return NextResponse.json(character);
  } catch (error) {
    logger.error('Error fetching character', { 
      storyId: params.id[0],
      characterId: params.id[1],
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
  { params }: { params: { id: string[] } }
) {
  logger.debug('Processing PUT request to update character', { 
    storyId: params.id[0], 
    characterId: params.id[1] 
  });
  
  try {
    // Get the current session
    const session = await getServerSession();
    
    if (!session || !session.user) {
      logger.warn('Unauthorized attempt to update character', { 
        storyId: params.id[0], 
        characterId: params.id[1] 
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const storyId = params.id[0];
    const characterId = params.id[1];
    
    logger.debug('Authorized request to update character', { userId, storyId, characterId });
    
    // Validate the IDs
    if (!ObjectId.isValid(storyId) || !ObjectId.isValid(characterId)) {
      logger.warn('Invalid ID format for character update', { storyId, characterId });
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
    
    const userDb = await getUserDb(userId);
    const data = await req.json();
    
    logger.debug('Retrieved user database connection and parsed update data', { 
      userId,
      characterName: data.name
    });
    
    // Check if the story exists and belongs to the user
    const story = await userDb.collection('stories').findOne({ 
      _id: new ObjectId(storyId)
    });
    
    if (!story) {
      logger.warn('Story not found for character update', { userId, storyId });
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    
    // Check if the character exists
    const existingCharacter = await userDb.collection('characters').findOne({ 
      _id: new ObjectId(characterId),
      storyId: storyId
    });
    
    if (!existingCharacter) {
      logger.warn('Character not found for update', { storyId, characterId });
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }
    
    // Validate required fields
    if (!data.name) {
      logger.warn('Missing required field: name', { storyId, characterId });
      return NextResponse.json({ error: 'Character name is required' }, { status: 400 });
    }
    
    // Prepare the update data
    const updateData = {
      name: data.name,
      role: data.role || existingCharacter.role,
      description: data.description || existingCharacter.description,
      physical_traits: data.physical_traits || existingCharacter.physical_traits,
      personality: data.personality || existingCharacter.personality,
      background: data.background || existingCharacter.background,
      goals: data.goals || existingCharacter.goals,
      relationships: data.relationships || existingCharacter.relationships,
      updatedAt: new Date()
    };
    
    logger.debug('Prepared character update data', { 
      storyId, 
      characterId,
      characterName: updateData.name
    });
    
    // Update the character
    const result = await userDb.collection('characters').updateOne(
      { _id: new ObjectId(characterId), storyId: storyId },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      logger.warn('Character not found during update operation', { storyId, characterId });
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }
    
    logger.debug('Character updated successfully, retrieving updated document', { 
      storyId, 
      characterId 
    });
    
    // Return the updated character
    const updatedCharacter = await userDb.collection('characters').findOne({
      _id: new ObjectId(characterId),
      storyId: storyId
    });
    
    logger.info('Character updated successfully', { 
      storyId, 
      characterId,
      characterName: updatedCharacter?.name 
    });
    
    return NextResponse.json(updatedCharacter);
  } catch (error) {
    logger.error('Error updating character', { 
      storyId: params.id[0],
      characterId: params.id[1],
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
  { params }: { params: { id: string[] } }
) {
  logger.debug('Processing DELETE request for character', { 
    storyId: params.id[0], 
    characterId: params.id[1] 
  });
  
  try {
    // Get the current session
    const session = await getServerSession();
    
    if (!session || !session.user) {
      logger.warn('Unauthorized attempt to delete character', { 
        storyId: params.id[0], 
        characterId: params.id[1] 
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const storyId = params.id[0];
    const characterId = params.id[1];
    
    logger.debug('Authorized request to delete character', { userId, storyId, characterId });
    
    // Validate the IDs
    if (!ObjectId.isValid(storyId) || !ObjectId.isValid(characterId)) {
      logger.warn('Invalid ID format for character deletion', { storyId, characterId });
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
    
    const userDb = await getUserDb(userId);
    logger.debug('Retrieved user database connection', { userId });
    
    // Check if the story exists and belongs to the user
    const story = await userDb.collection('stories').findOne({ 
      _id: new ObjectId(storyId)
    });
    
    if (!story) {
      logger.warn('Story not found for character deletion', { userId, storyId });
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    
    // Find the character to confirm it exists
    const character = await userDb.collection('characters').findOne({ 
      _id: new ObjectId(characterId),
      storyId: storyId
    });
    
    if (!character) {
      logger.warn('Character not found for deletion', { storyId, characterId });
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }
    
    logger.debug('Character found, proceeding with deletion', { 
      storyId, 
      characterId,
      characterName: character.name
    });
    
    // Delete the character
    await userDb.collection('characters').deleteOne({ 
      _id: new ObjectId(characterId),
      storyId: storyId
    });
    
    // Update any events that reference this character
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateQuery = { 
      $pull: { 
        characters_involved: { 
          id: characterId 
        } 
      } 
    };
    
    await userDb.collection('events').updateMany(
      { storyId: storyId, 'characters_involved.id': characterId },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateQuery as any
    );
    
    return NextResponse.json({ success: true, message: 'Character deleted successfully' });
  } catch (error) {
    logger.error('Error deleting character', { 
      storyId: params.id[0],
      characterId: params.id[1],
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({ error: 'Failed to delete character' }, { status: 500 });
  }
}

// Wrap handlers with API logging middleware
export const GET_handler = withApiLogging(GET, 'GET:characterDetail');
export const PUT_handler = withApiLogging(PUT, 'PUT:characterDetail');
export const DELETE_handler = withApiLogging(DELETE, 'DELETE:characterDetail');

// Export handlers
export { GET_handler as GET, PUT_handler as PUT, DELETE_handler as DELETE }; 