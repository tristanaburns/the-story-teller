import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
import { getUserDb } from '@/lib/user-db';
import { createLogger, withApiLogging } from '@/lib/logging';

/**
 * Story Characters API routes - Handles operations on characters within a story
 * Implements GET (list all characters) and POST (create a character) operations
 */

// Create a logger specifically for the story characters API
const logger = createLogger('API:StoryCharacters');

/**
 * GET - retrieves all characters for a story
 */
async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const storyId = params.id;
  logger.debug('Processing GET request for story characters', { storyId });

  try {
    // Get the current session
    const session = await getServerSession();

    if (!session || !session.user) {
      logger.warn('Unauthorized attempt to access story characters', { storyId });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    logger.debug('Authorized request for story characters', { userId, storyId });

    // Validate story ID format
    if (!ObjectId.isValid(storyId)) {
      logger.warn('Invalid story ID format', { storyId });
      return NextResponse.json({ error: 'Invalid story ID' }, { status: 400 });
    }

    // Get user's database
    const userDb = await getUserDb(userId);

    // Verify the story exists and belongs to the user
    const story = await userDb.collection('stories').findOne({
      _id: new ObjectId(storyId)
    });

    if (!story) {
      logger.warn('Story not found for character retrieval', { userId, storyId });
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Query for all characters in this story
    const characters = await userDb.collection('characters')
      .find({ storyId: storyId })
      .toArray();

    logger.info('Characters retrieved successfully', { 
      userId, 
      storyId, 
      characterCount: characters.length 
    });
    
    return NextResponse.json(characters);
  } catch (error) {
    logger.error('Error fetching characters', { 
      storyId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { error: 'Failed to fetch characters' }, 
      { status: 500 }
    );
  }
}

/**
 * POST - creates a new character for a story
 */
async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const storyId = params.id;
  logger.debug('Processing POST request to create character', { storyId });

  try {
    // Get the current session
    const session = await getServerSession();

    if (!session || !session.user) {
      logger.warn('Unauthorized attempt to create character', { storyId });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    logger.debug('Authorized request to create character', { userId, storyId });

    // Validate story ID format
    if (!ObjectId.isValid(storyId)) {
      logger.warn('Invalid story ID format', { storyId });
      return NextResponse.json({ error: 'Invalid story ID' }, { status: 400 });
    }

    // Parse request body
    const data = await req.json();
    logger.debug('Character data received', { storyId, fields: Object.keys(data) });

    // Validate required fields
    if (!data.name) {
      logger.warn('Missing required field: name', { storyId });
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Get user's database
    const userDb = await getUserDb(userId);

    // Verify the story exists and belongs to the user
    const story = await userDb.collection('stories').findOne({
      _id: new ObjectId(storyId)
    });

    if (!story) {
      logger.warn('Story not found for character creation', { userId, storyId });
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Create the character document
    const characterDoc = {
      name: data.name,
      type: data.type || 'major',
      status: data.status || 'active',
      description: data.description || '',
      background: data.background || '',
      goals: data.goals || '',
      notes: data.notes || '',
      traits: data.traits || [],
      relationships: data.relationships || [],
      storyId: storyId,
      userId: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert the character
    const result = await userDb.collection('characters').insertOne(characterDoc);

    // Return the created character with its ID
    const createdCharacter = {
      ...characterDoc,
      _id: result.insertedId
    };

    logger.info('Character created successfully', { 
      userId, 
      storyId, 
      characterId: result.insertedId.toString(),
      characterName: data.name
    });

    return NextResponse.json(createdCharacter, { status: 201 });
  } catch (error) {
    logger.error('Error creating character', { 
      storyId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { error: 'Failed to create character' },
      { status: 500 }
    );
  }
}

// Wrap handlers with API logging middleware
export const GET_handler = withApiLogging(GET, 'GET:storyCharacters');
export const POST_handler = withApiLogging(POST, 'POST:storyCharacters');

// Export handlers
export { GET_handler as GET, POST_handler as POST }; 