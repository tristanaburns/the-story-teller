/**
 * API route for story analytics with comprehensive logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { createLogger, withApiLogging } from '@/lib/logging';
import { getCollection } from '@/lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Create a logger specifically for the story analytics API
const logger = createLogger('API:StoryAnalytics');

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
 * GET handler for retrieving analytics for all user stories
 */
async function GET(request: NextRequest) {
  logger.debug('Processing GET request for story analytics');
  
  try {
    // Get user session for authorization
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      logger.warn('Unauthorized access attempt to story analytics');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all'; // all, week, month, year
    
    logger.debug('Fetching story analytics', { userId, period });
    
    // Calculate date range based on period
    const now = new Date();
    let startDate: Date | null = null;
    
    if (period === 'week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
    } else if (period === 'year') {
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
    }
    
    // Get collections
    const storiesCollection = await getCollection('stories');
    const charactersCollection = await getCollection('characters');
    const locationsCollection = await getCollection('locations');
    const timelineEventsCollection = await getCollection('timelineEvents');
    
    // Build queries
    const timeQuery = startDate ? { userId, createdAt: { $gte: startDate } } : { userId };
    
    // Get stories statistics
    const stories = await storiesCollection.find(timeQuery);
    
    // Get total word count across all stories
    let totalWordCount = 0;
    let totalCharacterCount = 0;
    
    stories.forEach(story => {
      const content = story.content || '';
      totalWordCount += content.split(/\s+/).filter(Boolean).length;
      totalCharacterCount += content.length;
    });
    
    // Get characters, locations, and timeline events counts
    const charactersCount = await charactersCollection.getNativeCollection().countDocuments({
      storyId: { $in: stories.map(story => story._id.toString()) }
    });
    
    const locationsCount = await locationsCollection.getNativeCollection().countDocuments({
      storyId: { $in: stories.map(story => story._id.toString()) }
    });
    
    const timelineEventsCount = await timelineEventsCollection.getNativeCollection().countDocuments({
      storyId: { $in: stories.map(story => story._id.toString()) }
    });
    
    // Get story status distribution
    const storyStatusPipeline = [
      { $match: timeQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ];
    
    const storyStatusDistribution = await storiesCollection.getNativeCollection().aggregate(storyStatusPipeline).toArray();
    
    // Get story genre distribution
    const storyGenrePipeline = [
      { $match: timeQuery },
      { $group: { _id: '$metadata.genre', count: { $sum: 1 } } }
    ];
    
    const storyGenreDistribution = await storiesCollection.getNativeCollection().aggregate(storyGenrePipeline).toArray();
    
    // Get story creation timeline (grouped by month)
    const storyTimelinePipeline = [
      { $match: timeQuery },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ];
    
    const storyTimelineDistribution = await storiesCollection.getNativeCollection().aggregate(storyTimelinePipeline).toArray();
    
    // Format timeline data for easier consumption
    const timelineData = storyTimelineDistribution.map(item => ({
      date: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
      count: item.count
    }));
    
    // Calculate average story length
    const avgWordCount = stories.length > 0 ? Math.round(totalWordCount / stories.length) : 0;
    
    // Calculate completion rate (published / total)
    const publishedCount = storyStatusDistribution.find(item => item._id === 'published')?.count || 0;
    const completionRate = stories.length > 0 ? Math.round((publishedCount / stories.length) * 100) : 0;
    
    // Compile final analytics data
    const analyticsData = {
      overview: {
        totalStories: stories.length,
        totalWordCount,
        totalCharacterCount,
        avgWordCount,
        completionRate,
        charactersCount,
        locationsCount,
        timelineEventsCount
      },
      distributions: {
        status: storyStatusDistribution.map(item => ({
          status: item._id || 'unknown',
          count: item.count
        })),
        genre: storyGenreDistribution.map(item => ({
          genre: item._id || 'unknown',
          count: item.count
        }))
      },
      timeline: timelineData,
      // Add story activity (last 7 days)
      recentActivity: stories
        .filter(story => {
          const updatedAt = new Date(story.updatedAt);
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return updatedAt >= sevenDaysAgo;
        })
        .map(story => ({
          id: story._id.toString(),
          title: story.title,
          updatedAt: story.updatedAt
        }))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5)
    };
    
    logger.info('Retrieved story analytics', {
      userId,
      storiesCount: stories.length,
      period
    });
    
    // Return analytics data
    return NextResponse.json({ analytics: analyticsData });
  } catch (error) {
    // Log error with detailed context
    logger.error('Error processing GET request for story analytics', error);
    
    // Return error response
    return NextResponse.json(
      { error: 'Failed to retrieve story analytics' },
      { status: 500 }
    );
  }
}

/**
 * GET handler for retrieving analytics for a specific story
 */
async function getStoryAnalytics(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  
  logger.debug(`Processing GET request for story analytics for story ${id}`);
  
  // Validate ID format
  if (!isValidObjectId(id)) {
    logger.warn(`Invalid story ID format: ${id}`);
    return NextResponse.json({ error: 'Invalid story ID format' }, { status: 400 });
  }
  
  try {
    // Get user session for authorization
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      logger.warn(`Unauthorized access attempt to story analytics for story ${id}`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get collections
    const storiesCollection = await getCollection('stories');
    const charactersCollection = await getCollection('characters');
    const locationsCollection = await getCollection('locations');
    const timelineEventsCollection = await getCollection('timelineEvents');
    
    // Get story
    const story = await storiesCollection.findOne({ _id: new ObjectId(id) });
    
    if (!story) {
      logger.warn(`Story not found with ID: ${id}`);
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    
    // Check authorization
    if (story.userId !== session.user.id) {
      logger.warn(`Unauthorized access attempt to story analytics for story ${id}`, {
        requesterId: session.user.id,
        ownerId: story.userId
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Calculate word and character count
    const content = story.content || '';
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const characterCount = content.length;
    
    // Get revision history if available
    const revisionHistory = story.revisions || [];
    const revisionCount = revisionHistory.length;
    
    // Get character, location, and timeline event counts
    const charactersCount = await charactersCollection.getNativeCollection().countDocuments({
      storyId: id
    });
    
    const locationsCount = await locationsCollection.getNativeCollection().countDocuments({
      storyId: id
    });
    
    const timelineEventsCount = await timelineEventsCollection.getNativeCollection().countDocuments({
      storyId: id
    });
    
    // Calculate time since creation and last update
    const createdAt = new Date(story.createdAt);
    const updatedAt = new Date(story.updatedAt);
    const now = new Date();
    
    const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const daysSinceUpdate = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate revision frequency if there are revisions
    const revisionFrequency = revisionCount > 0 && daysSinceCreation > 0
      ? Math.round((revisionCount / daysSinceCreation) * 7) // revisions per week
      : 0;
    
    // Compile final analytics data
    const analyticsData = {
      storyDetails: {
        id: story._id.toString(),
        title: story.title,
        status: story.status || 'draft',
        genre: story.metadata?.genre || 'unknown',
        createdAt: story.createdAt,
        updatedAt: story.updatedAt,
        daysSinceCreation,
        daysSinceUpdate
      },
      content: {
        wordCount,
        characterCount,
        revisionCount,
        revisionFrequency
      },
      elements: {
        charactersCount,
        locationsCount,
        timelineEventsCount
      },
      metadata: {
        tags: story.metadata?.tags || []
      }
    };
    
    logger.info(`Retrieved analytics for story ${id}`, {
      title: story.title,
      userId: story.userId
    });
    
    // Return analytics data
    return NextResponse.json({ analytics: analyticsData });
  } catch (error) {
    // Log error with detailed context
    logger.error(`Error retrieving analytics for story ${id}`, error);
    
    // Return error response
    return NextResponse.json(
      { error: 'Failed to retrieve story analytics' },
      { status: 500 }
    );
  }
}

// Wrap handlers with API logging middleware
export const GET_handler = withApiLogging(GET, 'GET:storyAnalytics');

// Export handlers
export { GET_handler as GET };
