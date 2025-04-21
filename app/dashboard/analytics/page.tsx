import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { createLogger } from '@/lib/logging';
import StoryAnalyticsDashboard from '@/components/analytics/StoryAnalyticsDashboard';

// Create a logger for this page
const logger = createLogger('AnalyticsDashboardPage');

export const metadata = {
  title: 'Story Analytics | The Story Teller',
  description: 'View analytics and statistics for your stories'
};

/**
 * Story analytics dashboard page
 */
export default async function AnalyticsPage() {
  // Check if user is authenticated
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    logger.warn('Unauthenticated user attempted to access analytics dashboard');
    redirect('/auth/signin?callbackUrl=/dashboard/analytics');
  }
  
  const userId = session.user.id;
  
  logger.info('User accessed analytics dashboard', { userId });
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Story Analytics</h1>
      
      <StoryAnalyticsDashboard userId={userId} />
    </div>
  );
}
