/**
 * API route for individual story analytics with comprehensive logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { createLogger, withApiLogging } from '@/lib/logging';
import { getCollection } from '@/lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Create a logger specifically for the individual story analytics API
const logger = createLogger('API:StoryAnalyticsIndividual');

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
 * GET handler for retrieving analytics for a specific story
 */
async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  
  logger.debug(`Processing GET request for analytics of story ${id}`);
  
  // Validate ID format
  if (!isValidObjectId(id)) {
    logger.warn(`Invalid story ID format: ${id}`);
    return NextResponse.json({ error: 'Invalid story ID format' }, { status: 400 });
  }
  
  try {
    // Get user session for authorization
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      logger.warn(`Unauthorized access attempt to analytics for story ${id}`);
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
    
    // Get characters with details
    const characters = await charactersCollection.find({ storyId: id });
    
    // Get locations with details
    const locations = await locationsCollection.find({ storyId: id });
    
    // Get timeline events with details
    const timelineEvents = await timelineEventsCollection.find({ storyId: id });
    
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
    
    // Calculate character type distribution
    const characterTypeDistribution = characters.reduce((acc, char) => {
      const type = char.type || 'unspecified';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Calculate location type distribution
    const locationTypeDistribution = locations.reduce((acc, loc) => {
      const type = loc.type || 'unspecified';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Generate a writing pace calculation (words per day)
    const writingPace = daysSinceCreation > 0 ? Math.round(wordCount / daysSinceCreation) : wordCount;
    
    // Analyze consistency of writing (if revision dates are available)
    let writingConsistency = 'unknown';
    if (revisionHistory.length > 1) {
      // Implementation would depend on how revisions are stored
      // This is a placeholder for how it might be calculated
      writingConsistency = 'regular'; // Could be 'sporadic', 'regular', or 'intense'
    }
    
    // Estimate reading time (based on average reading speed of 250 words per minute)
    const estimatedReadingTime = Math.ceil(wordCount / 250);
    
    // Check for plot holes or inconsistencies (placeholder for more complex implementation)
    const potentialPlotHoles = 0; // Would require more complex analysis
    
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
        revisionFrequency,
        estimatedReadingTime,
        writingPace,
        writingConsistency,
        potentialPlotHoles
      },
      elements: {
        characters: {
          count: characters.length,
          typeDistribution: Object.entries(characterTypeDistribution).map(([type, count]) => ({
            type,
            count
          }))
        },
        locations: {
          count: locations.length,
          typeDistribution: Object.entries(locationTypeDistribution).map(([type, count]) => ({
            type,
            count
          }))
        },
        timelineEvents: {
          count: timelineEvents.length
        }
      },
      characterDetails: characters.map(char => ({
        id: char._id.toString(),
        name: char.name,
        type: char.type || 'unspecified',
        appearances: char.appeared_in?.length || 0
      })),
      locationDetails: locations.map(loc => ({
        id: loc._id.toString(),
        name: loc.name,
        type: loc.type || 'unspecified',
        appearances: loc.appeared_in?.length || 0
      })),
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
export const GET_handler = withApiLogging(GET, 'GET:storyAnalyticsIndividual');

// Export handlers
export { GET_handler as GET };
