/**
 * API route for stories with comprehensive logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getUserDb } from '@/lib/user-db';
import { createLogger, withApiLogging } from '@/lib/logging';

/**
 * Stories Collection API Routes - Handles operations on the stories collection
 * Implements GET (list all stories) and POST (create a story) operations
 */

// Create a logger specifically for the stories API
const logger = createLogger('API:Stories');

/**
 * GET - retrieves all stories for the authenticated user
 */
async function GET(req: NextRequest) {
  logger.debug('Processing GET request for all stories');

  try {
    // Get the current session
    const session = await getServerSession();

    if (!session || !session.user) {
      logger.warn('Unauthorized attempt to access stories');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    logger.debug('Authorized request for stories list', { userId });

    // Get user's database
    const userDb = await getUserDb(userId);

    // Query for all stories belonging to the user
    const stories = await userDb.collection('stories')
      .find({})
      .sort({ updatedAt: -1 })
      .toArray();

    logger.info('Stories retrieved successfully', { 
      userId, 
      storyCount: stories.length 
    });

    return NextResponse.json(stories);
  } catch (error) {
    logger.error('Error fetching stories', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { error: 'Failed to fetch stories' }, 
      { status: 500 }
    );
  }
}

/**
 * POST - creates a new story for the authenticated user
 */
async function POST(req: NextRequest) {
  logger.debug('Processing POST request to create a story');

  try {
    // Get the current session
    const session = await getServerSession();

    if (!session || !session.user) {
      logger.warn('Unauthorized attempt to create a story');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    logger.debug('Authorized request to create a story', { userId });

    // Parse request body
    const data = await req.json();
    logger.debug('Story data received', { fields: Object.keys(data) });

    // Validate required fields
    if (!data.title) {
      logger.warn('Missing required field: title', { userId });
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Get user's database
    const userDb = await getUserDb(userId);

    // Create the story document
    const storyDoc = {
      title: data.title,
      description: data.description || '',
      genre: data.genre || '',
      status: data.status || 'draft',
      content: data.content || '',
      settings: data.settings || {},
      userId: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert the story
    const result = await userDb.collection('stories').insertOne(storyDoc);

    // Return the created story with its ID
    const createdStory = {
      ...storyDoc,
      _id: result.insertedId
    };

    logger.info('Story created successfully', { 
      userId, 
      storyId: result.insertedId.toString(),
      storyTitle: data.title
    });

    return NextResponse.json(createdStory, { status: 201 });
  } catch (error) {
    logger.error('Error creating story', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { error: 'Failed to create story' },
      { status: 500 }
    );
  }
}

// Wrap handlers with API logging middleware
export const GET_handler = withApiLogging(GET, 'GET:stories');
export const POST_handler = withApiLogging(POST, 'POST:stories');

// Export handlers
export { GET_handler as GET, POST_handler as POST };
