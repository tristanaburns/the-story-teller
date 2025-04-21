'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import StoriesGrid from '@/components/dashboard/StoriesGrid';
import StorySearch from '@/components/dashboard/StorySearch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface Story {
  _id: string;
  title: string;
  description: string;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
  status?: 'draft' | 'published' | 'archived';
}

interface Analytics {
  totalStories: number;
  statusDistribution: { status: string; count: number }[];
  recentActivity: { date: string; count: number }[];
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to signin if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }

    // Fetch user's stories when authenticated
    if (status === 'authenticated') {
      fetchStories();
    }
  }, [status, router]);

  const fetchStories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/stories');
      
      if (!response.ok) {
        throw new Error('Failed to fetch stories');
      }
      
      const data = await response.json();
      setStories(data.stories);
      setFilteredStories(data.stories);
      
      // Generate simple analytics from the fetched stories
      generateAnalytics(data.stories);
    } catch (error) {
      console.error('Error fetching stories:', error);
      setError('Failed to load stories. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateAnalytics = (stories: Story[]) => {
    // Count stories by status
    const statusCounts: Record<string, number> = {};
    stories.forEach(story => {
      const status = story.status || 'draft';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count
    }));
    
    // Generate recent activity (last 7 days)
    const activityData: Record<string, number> = {};
    const now = new Date();
    const last7Days = [];
    
    // Initialize dates for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      activityData[dateStr] = 0;
      last7Days.push(dateStr);
    }
    
    // Count stories updated on each day
    stories.forEach(story => {
      const updateDate = new Date(story.updatedAt).toISOString().split('T')[0];
      if (activityData[updateDate] !== undefined) {
        activityData[updateDate] += 1;
      }
    });
    
    const recentActivity = last7Days.map(date => ({
      date: date.split('-').slice(1).join('/'), // Format as MM/DD
      count: activityData[date]
    }));
    
    setAnalytics({
      totalStories: stories.length,
      statusDistribution,
      recentActivity
    });
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredStories(stories);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const results = stories.filter(
      story => 
        story.title.toLowerCase().includes(lowerQuery) || 
        (story.description && story.description.toLowerCase().includes(lowerQuery))
    );
    setFilteredStories(results);
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your stories and creative content
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Link
            href="/dashboard/analytics"
            className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors duration-200 font-medium flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Analytics
          </Link>
          
          <Link
            href="/stories/new"
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors duration-200 font-medium flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create New Story
          </Link>
        </div>
      </div>

      {/* Analytics Overview Section */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Story Status</CardTitle>
              <CardDescription>Distribution of story status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="status"
                      label={({ name, percent }) => 
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {analytics.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Stories updated in the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.recentActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar 
                      dataKey="count" 
                      name="Stories Updated" 
                      fill="#8884d8"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Analytics Overview</CardTitle>
              <CardDescription>Story statistics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-4xl font-bold">{analytics.totalStories}</p>
                  <p className="text-sm text-muted-foreground">Total Stories</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Draft</span>
                    <span className="font-semibold">
                      {analytics.statusDistribution.find(s => s.status === 'draft')?.count || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Published</span>
                    <span className="font-semibold">
                      {analytics.statusDistribution.find(s => s.status === 'published')?.count || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Archived</span>
                    <span className="font-semibold">
                      {analytics.statusDistribution.find(s => s.status === 'archived')?.count || 0}
                    </span>
                  </div>
                </div>
                
                <Link 
                  href="/dashboard/analytics" 
                  className="block text-center text-sm text-primary hover:underline mt-4"
                >
                  View detailed analytics →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mb-8">
        <StorySearch onSearch={handleSearch} />
      </div>

      {error && (
        <div className="bg-destructive/20 border border-destructive/50 text-destructive p-4 rounded-lg mb-8">
          {error}
          <button 
            onClick={fetchStories} 
            className="ml-4 underline text-destructive hover:text-destructive/80"
          >
            Try again
          </button>
        </div>
      )}

      <StoriesGrid stories={filteredStories} />
    </div>
  );
}