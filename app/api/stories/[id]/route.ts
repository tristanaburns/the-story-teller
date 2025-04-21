/**
 * API route for individual story operations with comprehensive logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
import { getUserDb } from '@/lib/user-db';
import { createLogger, withApiLogging } from '@/lib/logging';

// Create a logger specifically for the individual story API
const logger = createLogger('API:StoryDetail');

/**
 * GET handler for retrieving a single story
 */
async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const storyId = params.id;
  logger.debug('Processing GET request for story', { storyId });

  try {
    // Get the current session
    const session = await getServerSession();

    if (!session || !session.user) {
      logger.warn('Unauthorized attempt to access story', { storyId });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    logger.debug('Authorized request for story', { userId, storyId });

    // Validate story ID format
    if (!ObjectId.isValid(storyId)) {
      logger.warn('Invalid story ID format', { storyId });
      return NextResponse.json({ error: 'Invalid story ID' }, { status: 400 });
    }

    // Get user's database
    const userDb = await getUserDb(userId);

    // Query the story
    const story = await userDb.collection('stories').findOne({
      _id: new ObjectId(storyId)
    });

    if (!story) {
      logger.warn('Story not found', { userId, storyId });
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    logger.info('Story retrieved successfully', { userId, storyId });
    return NextResponse.json(story);
  } catch (error) {
    logger.error('Error fetching story', { 
      storyId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json({ error: 'Failed to fetch story' }, { status: 500 });
  }
}

/**
 * PUT handler for updating a story
 */
async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const storyId = params.id;
  logger.debug('Processing PUT request to update story', { storyId });

  try {
    // Get the current session
    const session = await getServerSession();

    if (!session || !session.user) {
      logger.warn('Unauthorized attempt to update story', { storyId });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    logger.debug('Authorized request to update story', { userId, storyId });

    // Validate story ID format
    if (!ObjectId.isValid(storyId)) {
      logger.warn('Invalid story ID format', { storyId });
      return NextResponse.json({ error: 'Invalid story ID' }, { status: 400 });
    }

    // Parse request body
    const data = await req.json();
    logger.debug('Update data received', { storyId, fields: Object.keys(data) });

    // Get user's database
    const userDb = await getUserDb(userId);

    // Check if story exists and belongs to user
    const existingStory = await userDb.collection('stories').findOne({
      _id: new ObjectId(storyId)
    });

    if (!existingStory) {
      logger.warn('Story not found for update', { userId, storyId });
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Prepare update document
    const updateDoc = {
      ...data,
      updatedAt: new Date()
    };

    // Don't allow changing the userId
    delete updateDoc.userId;
    
    // Don't allow modifying the _id
    delete updateDoc._id;

    // Update the story
    const result = await userDb.collection('stories').updateOne(
      { _id: new ObjectId(storyId) },
      { $set: updateDoc }
    );

    if (result.matchedCount === 0) {
      logger.warn('Story update failed - no matching document', { userId, storyId });
      return NextResponse.json({ error: 'Failed to update story' }, { status: 500 });
    }

    // Get the updated story
    const updatedStory = await userDb.collection('stories').findOne({
      _id: new ObjectId(storyId)
    });

    logger.info('Story updated successfully', { 
      userId, 
      storyId,
      modifiedFields: Object.keys(data)
    });

    return NextResponse.json(updatedStory);
  } catch (error) {
    logger.error('Error updating story', { 
      storyId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json({ error: 'Failed to update story' }, { status: 500 });
  }
}

/**
 * DELETE handler for removing a story
 */
async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const storyId = params.id;
  logger.debug('Processing DELETE request for story', { storyId });

  try {
    // Get the current session
    const session = await getServerSession();

    if (!session || !session.user) {
      logger.warn('Unauthorized attempt to delete story', { storyId });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    logger.debug('Authorized request to delete story', { userId, storyId });

    // Validate story ID format
    if (!ObjectId.isValid(storyId)) {
      logger.warn('Invalid story ID format', { storyId });
      return NextResponse.json({ error: 'Invalid story ID' }, { status: 400 });
    }

    // Get user's database
    const userDb = await getUserDb(userId);

    // Check if story exists and belongs to user
    const existingStory = await userDb.collection('stories').findOne({
      _id: new ObjectId(storyId)
    });

    if (!existingStory) {
      logger.warn('Story not found for deletion', { userId, storyId });
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Delete the story
    const result = await userDb.collection('stories').deleteOne({
      _id: new ObjectId(storyId)
    });

    if (result.deletedCount === 0) {
      logger.warn('Story deletion failed', { userId, storyId });
      return NextResponse.json({ error: 'Failed to delete story' }, { status: 500 });
    }

    logger.info('Story deleted successfully', { userId, storyId });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting story', { 
      storyId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json({ error: 'Failed to delete story' }, { status: 500 });
  }
}

// Wrap handlers with API logging middleware
export const GET_handler = withApiLogging(GET, 'GET:storyDetail');
export const PUT_handler = withApiLogging(PUT, 'PUT:storyDetail');
export const DELETE_handler = withApiLogging(DELETE, 'DELETE:storyDetail');

// Export handlers
export { GET_handler as GET, PUT_handler as PUT, DELETE_handler as DELETE };
