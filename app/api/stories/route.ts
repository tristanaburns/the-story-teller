/**
 * API route for stories with comprehensive logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { createLogger, withApiLogging } from '@/lib/logging';
import { getCollection } from '@/lib/mongodb';

// Create a logger specifically for the stories API
const logger = createLogger('API:Stories');

/**
 * GET handler for stories
 */
async function GET(request: NextRequest) {
  logger.debug('Processing GET request for stories');
  
  try {
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = Number(searchParams.get('limit') || '10');
    const page = Number(searchParams.get('page') || '0');
    
    // Validate parameters
    if (!userId) {
      logger.warn('GET request missing required userId parameter');
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    
    logger.debug('Fetching stories from database', { userId, limit, page });
    
    // Get stories collection
    const storiesCollection = await getCollection('stories');
    
    // Query stories for user
    const stories = await storiesCollection.find(
      { userId },
      { 
        limit,
        skip: page * limit,
        sort: { updatedAt: -1 } 
      }
    );
    
    // Get total count for pagination
    const totalCount = await storiesCollection.getNativeCollection().countDocuments({ userId });
    
    logger.info(`Retrieved ${stories.length} stories for user ${userId}`, {
      totalCount,
      page,
      limit
    });
    
    // Return stories
    return NextResponse.json({
      stories,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    // Log error with detailed context
    logger.error('Error processing GET request for stories', error);
    
    // Return error response
    return NextResponse.json(
      { error: 'Failed to retrieve stories' },
      { status: 500 }
    );
  }
}

/**
 * POST handler for creating a new story
 */
async function POST(request: NextRequest) {
  logger.debug('Processing POST request for creating a story');
  
  try {
    // Parse request body
    const body = await request.json();
    const { title, description, userId, genre, tags } = body;
    
    // Validate request body
    if (!title || !userId) {
      const missingFields = [];
      if (!title) missingFields.push('title');
      if (!userId) missingFields.push('userId');
      
      logger.warn('POST request missing required fields', { missingFields });
      
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    logger.debug('Creating new story', { title, userId });
    
    // Get stories collection
    const storiesCollection = await getCollection('stories');
    
    // Create story object
    const story = {
      title,
      description: description || '',
      userId,
      genre: genre || 'General',
      tags: tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'draft',
      contentBlocks: [],
      characters: [],
      locations: [],
      timeline: []
    };
    
    // Insert story
    const result = await storiesCollection.insertOne(story);
    
    logger.info(`Created new story "${title}" for user ${userId}`, {
      storyId: result.insertedId
    });
    
    // Return created story
    return NextResponse.json({
      success: true,
      storyId: result.insertedId,
      story
    });
  } catch (error) {
    // Log error with detailed context
    logger.error('Error processing POST request for creating a story', error);
    
    // Return error response
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
