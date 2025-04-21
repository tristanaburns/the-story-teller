import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { createLogger } from '@/lib/logging';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import StoryAnalyticsDetail from '@/components/analytics/StoryAnalyticsDetail';

// Create a logger for this page
const logger = createLogger('StoryAnalyticsPage');

export const metadata = {
  title: 'Story Analytics | The Story Teller',
  description: 'View detailed analytics for your story'
};

/**
 * Check if a string is a valid ObjectId
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
 * Generate metadata for the page
 */
export async function generateMetadata({ params }: { params: { id: string } }) {
  const id = params.id;
  
  // Check if ID is valid
  if (!isValidObjectId(id)) {
    return {
      title: 'Invalid Story | The Story Teller',
      description: 'The requested story could not be found'
    };
  }
  
  try {
    // Get story collection
    const storiesCollection = await getCollection('stories');
    
    // Find story by ID
    const story = await storiesCollection.findOne({ _id: new ObjectId(id) });
    
    if (!story) {
      return {
        title: 'Story Not Found | The Story Teller',
        description: 'The requested story could not be found'
      };
    }
    
    return {
      title: `${story.title} - Analytics | The Story Teller`,
      description: `View detailed analytics for "${story.title}"`
    };
  } catch (error) {
    logger.error(`Error generating metadata for story ${id}`, error);
    
    return {
      title: 'Story Analytics | The Story Teller',
      description: 'View detailed analytics for your story'
    };
  }
}

/**
 * Individual story analytics page
 */
export default async function StoryAnalyticsPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const id = params.id;
  
  // Check if user is authenticated
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    logger.warn(`Unauthenticated user attempted to access analytics for story ${id}`);
    redirect(`/auth/signin?callbackUrl=/stories/${id}/analytics`);
  }
  
  const userId = session.user.id;
  
  // Check if ID is valid
  if (!isValidObjectId(id)) {
    logger.warn(`Invalid story ID format: ${id}`, { userId });
    redirect('/dashboard/stories');
  }
  
  try {
    // Get story collection
    const storiesCollection = await getCollection('stories');
    
    // Find story by ID
    const story = await storiesCollection.findOne({ _id: new ObjectId(id) });
    
    if (!story) {
      logger.warn(`Story not found with ID: ${id}`, { userId });
      redirect('/dashboard/stories');
    }
    
    // Check if user has access to this story
    if (story.userId !== userId) {
      logger.warn(`Unauthorized access attempt to story ${id}`, {
        requesterId: userId,
        ownerId: story.userId
      });
      redirect('/dashboard/stories');
    }
    
    logger.info(`User accessed analytics for story ${id}`, { 
      userId,
      storyTitle: story.title
    });
    
    return (
      <div className="container mx-auto py-6">
        <StoryAnalyticsDetail storyId={id} />
      </div>
    );
  } catch (error) {
    logger.error(`Error rendering analytics page for story ${id}`, error);
    
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Story Analytics</h1>
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          <h2 className="text-lg font-semibold">Error</h2>
          <p>There was an error loading the analytics for this story.</p>
        </div>
      </div>
    );
  }
}
