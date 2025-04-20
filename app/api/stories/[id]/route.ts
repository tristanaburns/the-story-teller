/**
 * API route for individual story operations with comprehensive logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { createLogger, withApiLogging } from '@/lib/logging';
import { getCollection } from '@/lib/mongodb';

// Create a logger specifically for the individual story API
const logger = createLogger('API:Story');

/**
 * Helper function to validate MongoDB ObjectId
 */
function isValidObjectId(id: string): boolean {
  try {
    new ObjectId(id);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * GET handler for retrieving a single story
 */
async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  
  logger.debug(`Processing GET request for story ${id}`);
  
  // Validate ID format
  if (!isValidObjectId(id)) {
    logger.warn(`Invalid story ID format: ${id}`);
    return NextResponse.json({ error: 'Invalid story ID format' }, { status: 400 });
  }
  
  try {
    // Get stories collection
    const storiesCollection = await getCollection('stories');
    
    // Find story by ID
    const story = await storiesCollection.findOne({ _id: new ObjectId(id) });
    
    if (!story) {
      logger.warn(`Story not found with ID: ${id}`);
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    
    logger.info(`Retrieved story ${id}`, {
      title: story.title,
      userId: story.userId
    });
    
    // Return story
    return NextResponse.json({ story });
  } catch (error) {
    // Log error with detailed context
    logger.error(`Error retrieving story ${id}`, error);
    
    // Return error response
    return NextResponse.json(
      { error: 'Failed to retrieve story' },
      { status: 500 }
    );
  }
}

/**
 * PUT handler for updating a story
 */
async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  
  logger.debug(`Processing PUT request for story ${id}`);
  
  // Validate ID format
  if (!isValidObjectId(id)) {
    logger.warn(`Invalid story ID format: ${id}`);
    return NextResponse.json({ error: 'Invalid story ID format' }, { status: 400 });
  }
  
  try {
    // Parse request body
    const body = await request.json();
    
    // Get stories collection
    const storiesCollection = await getCollection('stories');
    
    // Check if story exists
    const existingStory = await storiesCollection.findOne({ _id: new ObjectId(id) });
    
    if (!existingStory) {
      logger.warn(`Attempted to update non-existent story ${id}`);
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    
    // Prepare update data
    const updateData = {
      ...body,
      updatedAt: new Date()
    };
    
    // Remove _id if present in the update data
    delete updateData._id;
    
    logger.debug(`Updating story ${id}`, {
      fields: Object.keys(updateData)
    });
    
    // Update story
    const result = await storiesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    logger.info(`Updated story ${id}`, {
      modifiedCount: result.modifiedCount
    });
    
    // Return updated story
    const updatedStory = await storiesCollection.findOne({ _id: new ObjectId(id) });
    
    return NextResponse.json({
      success: true,
      story: updatedStory
    });
  } catch (error) {
    // Log error with detailed context
    logger.error(`Error updating story ${id}`, error);
    
    // Return error response
    return NextResponse.json(
      { error: 'Failed to update story' },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for removing a story
 */
async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  
  logger.debug(`Processing DELETE request for story ${id}`);
  
  // Validate ID format
  if (!isValidObjectId(id)) {
    logger.warn(`Invalid story ID format: ${id}`);
    return NextResponse.json({ error: 'Invalid story ID format' }, { status: 400 });
  }
  
  try {
    // Get stories collection
    const storiesCollection = await getCollection('stories');
    
    // Check if story exists
    const existingStory = await storiesCollection.findOne({ _id: new ObjectId(id) });
    
    if (!existingStory) {
      logger.warn(`Attempted to delete non-existent story ${id}`);
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    
    // Store story info for logging before deletion
    const storyInfo = {
      title: existingStory.title,
      userId: existingStory.userId
    };
    
    // Delete story
    const result = await storiesCollection.deleteOne({ _id: new ObjectId(id) });
    
    logger.info(`Deleted story ${id}`, {
      ...storyInfo,
      deletedCount: result.deletedCount
    });
    
    // Return success response
    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    // Log error with detailed context
    logger.error(`Error deleting story ${id}`, error);
    
    // Return error response
    return NextResponse.json(
      { error: 'Failed to delete story' },
      { status: 500 }
    );
  }
}

// Wrap handlers with API logging middleware
export const GET_handler = withApiLogging(GET, 'GET:story');
export const PUT_handler = withApiLogging(PUT, 'PUT:story');
export const DELETE_handler = withApiLogging(DELETE, 'DELETE:story');

// Export handlers
export { GET_handler as GET, PUT_handler as PUT, DELETE_handler as DELETE };
