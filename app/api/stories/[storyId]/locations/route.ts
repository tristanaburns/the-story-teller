import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
import { getUserDb, generateEntityId } from '@/lib/user-db';
import { createLogger, withApiLogging } from '@/lib/logging';

// Create a logger specifically for the locations API
const logger = createLogger('API:Locations');

/**
 * GET all locations for a story
 */
async function GET(
  req: NextRequest,
  { params }: { params: { storyId: string } }
) {
  logger.debug('Processing GET request for locations', { storyId: params.storyId });
  
  try {
    // Get the current session
    const session = await getServerSession();
    
    if (!session || !session.user) {
      logger.warn('Unauthorized attempt to access locations', { storyId: params.storyId });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { storyId } = params;
    
    logger.debug('Authorized request for locations', { userId, storyId });
    
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
      logger.warn('Story not found for locations request', { userId, storyId });
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    
    logger.debug('Story found, fetching locations', { storyId, storyTitle: story.title });
    
    // Fetch all locations for this story
    const locations = await userDb.collection('locations').find({ 
      storyId: storyId 
    }).toArray();
    
    logger.info(`Retrieved ${locations.length} locations for story ${storyId}`, { 
      count: locations.length,
      storyId,
      userId
    });
    
    // Return locations
    return NextResponse.json(locations);
  } catch (error) {
    logger.error('Error fetching locations', { 
      storyId: params.storyId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
}

/**
 * POST to create a new location
 */
async function POST(
  req: NextRequest,
  { params }: { params: { storyId: string } }
) {
  logger.debug('Processing POST request to create location', { storyId: params.storyId });
  
  try {
    // Get the current session
    const session = await getServerSession();
    
    if (!session || !session.user) {
      logger.warn('Unauthorized attempt to create location', { storyId: params.storyId });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { storyId } = params;
    
    logger.debug('Authorized request to create location', { userId, storyId });
    
    // Validate the story ID format
    if (!ObjectId.isValid(storyId)) {
      logger.warn('Invalid story ID format for location creation', { storyId });
      return NextResponse.json({ error: 'Invalid story ID format' }, { status: 400 });
    }
    
    const userDb = await getUserDb(userId);
    logger.debug('Retrieved user database connection', { userId });
    
    // Check if the story exists and belongs to the user
    const story = await userDb.collection('stories').findOne({ 
      _id: new ObjectId(storyId)
    });
    
    if (!story) {
      logger.warn('Story not found for location creation', { userId, storyId });
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    
    const data = await req.json();
    logger.debug('Parsed location data for creation', { storyId, locationName: data.name });
    
    // Validate required fields
    if (!data.name) {
      logger.warn('Missing required field: name', { storyId });
      return NextResponse.json({ error: 'Location name is required' }, { status: 400 });
    }
    
    // Create the location document
    const newLocation = {
      id: generateEntityId(), // Generate a unique ID for references
      storyId: storyId,
      name: data.name,
      type: data.type || '',
      description: data.description || '',
      physical_characteristics: data.physical_characteristics || {
        size: null,
        climate: null,
        notable_features: []
      },
      cultural_aspects: data.cultural_aspects || {
        inhabitants: [],
        customs: [],
        history: null
      },
      related_locations: data.related_locations || [],
      appeared_in: data.appeared_in || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    logger.debug('Prepared location document for insertion', { 
      storyId, 
      locationId: newLocation.id,
      locationName: newLocation.name
    });
    
    // Insert the location into the database
    const result = await userDb.collection('locations').insertOne(newLocation);
    
    logger.info('Location created successfully', {
      storyId,
      locationId: newLocation.id,
      locationName: newLocation.name,
      userId,
      mongoId: result.insertedId
    });
    
    // Return the created location
    return NextResponse.json({
      _id: result.insertedId,
      ...newLocation
    }, { status: 201 });
  } catch (error) {
    logger.error('Error creating location', { 
      storyId: params.storyId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({ error: 'Failed to create location' }, { status: 500 });
  }
}

// Wrap handlers with API logging middleware
export const GET_handler = withApiLogging(GET, 'GET:locations');
export const POST_handler = withApiLogging(POST, 'POST:locations');

// Export handlers
export { GET_handler as GET, POST_handler as POST };