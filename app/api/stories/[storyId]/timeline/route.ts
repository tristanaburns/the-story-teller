import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
import { getUserDb, generateEntityId } from '@/lib/user-db';
import { createLogger, withApiLogging } from '@/lib/logging';

// Create a logger specifically for the timeline API
const logger = createLogger('API:Timeline');

/**
 * GET all timeline events for a story
 */
async function GET(
  req: NextRequest,
  { params }: { params: { storyId: string } }
) {
  logger.debug('Processing GET request for timeline events', { storyId: params.storyId });
  
  try {
    // Get the current session
    const session = await getServerSession();
    
    if (!session || !session.user) {
      logger.warn('Unauthorized attempt to access timeline events', { storyId: params.storyId });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { storyId } = params;
    
    logger.debug('Authorized request for timeline events', { userId, storyId });
    
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
      logger.warn('Story not found for timeline events request', { userId, storyId });
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    
    logger.debug('Story found, fetching timeline events', { storyId, storyTitle: story.title });
    
    // Fetch all events for this story
    const events = await userDb.collection('events').find({ 
      storyId: storyId 
    }).toArray();
    
    logger.info(`Retrieved ${events.length} timeline events for story ${storyId}`, { 
      count: events.length,
      storyId,
      userId
    });
    
    // Return events
    return NextResponse.json(events);
  } catch (error) {
    logger.error('Error fetching timeline events', { 
      storyId: params.storyId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({ error: 'Failed to fetch timeline events' }, { status: 500 });
  }
}

/**
 * POST to create a new timeline event
 */
async function POST(
  req: NextRequest,
  { params }: { params: { storyId: string } }
) {
  logger.debug('Processing POST request to create timeline event', { storyId: params.storyId });
  
  try {
    // Get the current session
    const session = await getServerSession();
    
    if (!session || !session.user) {
      logger.warn('Unauthorized attempt to create timeline event', { storyId: params.storyId });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { storyId } = params;
    
    logger.debug('Authorized request to create timeline event', { userId, storyId });
    
    // Validate the story ID format
    if (!ObjectId.isValid(storyId)) {
      logger.warn('Invalid story ID format for timeline event creation', { storyId });
      return NextResponse.json({ error: 'Invalid story ID format' }, { status: 400 });
    }
    
    const userDb = await getUserDb(userId);
    logger.debug('Retrieved user database connection', { userId });
    
    // Check if the story exists and belongs to the user
    const story = await userDb.collection('stories').findOne({ 
      _id: new ObjectId(storyId)
    });
    
    if (!story) {
      logger.warn('Story not found for timeline event creation', { userId, storyId });
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    
    const data = await req.json();
    logger.debug('Parsed timeline event data for creation', { storyId, eventTitle: data.title });
    
    // Validate required fields
    if (!data.title) {
      logger.warn('Missing required field: title', { storyId });
      return NextResponse.json({ error: 'Event title is required' }, { status: 400 });
    }
    
    // Create the timeline event document
    const newEvent = {
      id: generateEntityId(), // Generate a unique ID for references
      storyId: storyId,
      title: data.title,
      description: data.description || '',
      date: data.date || '',
      chronology_date: data.chronology_date ? new Date(data.chronology_date) : null,
      significance: data.significance || '',
      characters_involved: data.characters_involved || [],
      locations_involved: data.locations_involved || [],
      preceding_events: data.preceding_events || [],
      following_events: data.following_events || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    logger.debug('Prepared timeline event document for insertion', { 
      storyId, 
      eventId: newEvent.id,
      eventTitle: newEvent.title
    });
    
    // Insert the event into the database
    const result = await userDb.collection('events').insertOne(newEvent);
    
    logger.info('Timeline event created successfully', {
      storyId,
      eventId: newEvent.id,
      eventTitle: newEvent.title,
      userId,
      mongoId: result.insertedId
    });
    
    // Return the created event
    return NextResponse.json({
      _id: result.insertedId,
      ...newEvent
    }, { status: 201 });
  } catch (error) {
    logger.error('Error creating timeline event', { 
      storyId: params.storyId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({ error: 'Failed to create timeline event' }, { status: 500 });
  }
}

// Wrap handlers with API logging middleware
export const GET_handler = withApiLogging(GET, 'GET:timeline');
export const POST_handler = withApiLogging(POST, 'POST:timeline');

// Export handlers
export { GET_handler as GET, POST_handler as POST };