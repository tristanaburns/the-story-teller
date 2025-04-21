import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
import { getUserDb, generateEntityId } from '@/lib/user-db';
import { createLogger, withApiLogging } from '@/lib/logging';

// Create a logger specifically for the characters API
const logger = createLogger('API:Characters');

/**
 * GET all characters for a story
 */
async function GET(
  req: NextRequest,
  { params }: { params: { storyId: string } }
) {
  logger.debug('Processing GET request for characters', { storyId: params.storyId });
  
  try {
    // Get the current session
    const session = await getServerSession();
    
    if (!session || !session.user) {
      logger.warn('Unauthorized attempt to access characters', { storyId: params.storyId });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { storyId } = params;
    
    logger.debug('Authorized request for characters', { userId, storyId });
    
    // Validate the story ID format
    if (!ObjectId.isValid(storyId)) {
      logger.warn('Invalid story ID format provided', { storyId });
      return NextResponse.json({ error: 'Invalid story ID format' }, { status: 400 });
    }
    
    const userDb = await getUserDb(userId);
    logger.debug('Retrieved user database connection', { userId });
    
    // Check if the story exists and belongs to the user
    const story = await userDb.collection('stories').findOne({ 
      _id: new ObjectId(storyId)
    });
    
    if (!story) {
      logger.warn('Story not found for characters request', { userId, storyId });
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    
    logger.debug('Story found, fetching characters', { storyId, storyTitle: story.title });
    
    // Fetch all characters for this story
    const characters = await userDb.collection('characters').find({ 
      storyId: storyId 
    }).toArray();
    
    logger.info(`Retrieved ${characters.length} characters for story ${storyId}`, { 
      count: characters.length,
      storyId,
      userId
    });
    
    // Return characters
    return NextResponse.json(characters);
  } catch (error) {
    logger.error('Error fetching characters', { 
      storyId: params.storyId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({ error: 'Failed to fetch characters' }, { status: 500 });
  }
}

/**
 * POST to create a new character
 */
async function POST(
  req: NextRequest,
  { params }: { params: { storyId: string } }
) {
  logger.debug('Processing POST request to create character', { storyId: params.storyId });
  
  try {
    // Get the current session
    const session = await getServerSession();
    
    if (!session || !session.user) {
      logger.warn('Unauthorized attempt to create character', { storyId: params.storyId });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { storyId } = params;
    
    logger.debug('Authorized request to create character', { userId, storyId });
    
    // Validate the story ID format
    if (!ObjectId.isValid(storyId)) {
      logger.warn('Invalid story ID format for character creation', { storyId });
      return NextResponse.json({ error: 'Invalid story ID format' }, { status: 400 });
    }
    
    const userDb = await getUserDb(userId);
    logger.debug('Retrieved user database connection', { userId });
    
    // Check if the story exists and belongs to the user
    const story = await userDb.collection('stories').findOne({ 
      _id: new ObjectId(storyId)
    });
    
    if (!story) {
      logger.warn('Story not found for character creation', { userId, storyId });
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    
    const data = await req.json();
    logger.debug('Parsed character data for creation', { storyId, characterName: data.name });
    
    // Validate required fields
    if (!data.name) {
      logger.warn('Missing required field: name', { storyId });
      return NextResponse.json({ error: 'Character name is required' }, { status: 400 });
    }
    
    // Create the character document
    const newCharacter = {
      id: generateEntityId(), // Generate a unique ID for references
      storyId: storyId,
      name: data.name,
      full_name: data.full_name || null,
      type: data.type || 'supporting',
      status: data.status || 'alive',
      description: data.description || '',
      physical_appearance: data.physical_appearance || {
        height: null,
        build: null,
        distinctive_features: [],
        typical_attire: null
      },
      personality: data.personality || {
        traits: [],
        values: [],
        motivations: []
      },
      background: data.background || {
        birthplace: null,
        occupation: null,
        significant_events: []
      },
      relationships: data.relationships || [],
      story_role: data.story_role || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    logger.debug('Prepared character document for insertion', { 
      storyId, 
      characterId: newCharacter.id,
      characterName: newCharacter.name
    });
    
    // Insert the character into the database
    const result = await userDb.collection('characters').insertOne(newCharacter);
    
    logger.info('Character created successfully', {
      storyId,
      characterId: newCharacter.id,
      characterName: newCharacter.name,
      userId,
      mongoId: result.insertedId
    });
    
    // Return the created character
    return NextResponse.json({
      _id: result.insertedId,
      ...newCharacter
    }, { status: 201 });
  } catch (error) {
    logger.error('Error creating character', { 
      storyId: params.storyId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({ error: 'Failed to create character' }, { status: 500 });
  }
}

// Wrap handlers with API logging middleware
export const GET_handler = withApiLogging(GET, 'GET:characters');
export const POST_handler = withApiLogging(POST, 'POST:characters');

// Export handlers
export { GET_handler as GET, POST_handler as POST };