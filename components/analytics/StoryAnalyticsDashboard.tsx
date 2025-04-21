'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { useClientLogger } from '@/lib/hooks/useClientLogger';
import AnalyticsOverview from './AnalyticsOverview';
import GenreDistribution from './GenreDistribution';
import StatusDistribution from './StatusDistribution';
import StoryTimeline from './StoryTimeline';
import RecentActivity from './RecentActivity';

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A020F0', '#FF0000'];

interface StoryAnalyticsDashboardProps {
  userId?: string;
}

const StoryAnalyticsDashboard: React.FC<StoryAnalyticsDashboardProps> = ({ 
  userId 
}) => {
  // Initialize logger
  const logger = useClientLogger('StoryAnalyticsDashboard');
  
  // State for analytics data and UI state
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  const router = useRouter();
  
  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      logger.debug('Fetching story analytics', { period });
      
      const response = await fetch(`/api/stories/analytics?period=${period}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching analytics: ${response.status}`);
      }
      
      const data = await response.json();
      setAnalyticsData(data.analytics);
      
      logger.info('Analytics data fetched successfully');
    } catch (error) {
      logger.error('Failed to fetch analytics data', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle period change
  const handlePeriodChange = (value: string) => {
    setPeriod(value);
  };
  
  // Navigate to story detail
  const handleStoryClick = (storyId: string) => {
    router.push(`/stories/${storyId}`);
  };
  
  // Navigate to story analytics detail
  const handleAnalyticsClick = (storyId: string) => {
    router.push(`/stories/${storyId}/analytics`);
  };
  
  // Fetch analytics when period changes
  useEffect(() => {
    fetchAnalytics();
  }, [period]);
  
  // No data placeholder
  if (!analyticsData && !loading && !error) {
    return (
      <Alert>
        <AlertTitle>No Stories Yet</AlertTitle>
        <AlertDescription>
          You haven't created any stories yet. Start writing to see analytics data.
        </AlertDescription>
      </Alert>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Story Analytics</CardTitle>
              <CardDescription>
                Track your writing progress and story statistics
              </CardDescription>
            </div>
            <div>
              <Select value={period} onValueChange={handlePeriodChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading analytics data...</p>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="distribution">Distribution</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-4">
                <AnalyticsOverview data={analyticsData.overview} />
              </TabsContent>
              
              <TabsContent value="distribution">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <StatusDistribution data={analyticsData.distributions.status} />
                  <GenreDistribution data={analyticsData.distributions.genre} />
                </div>
              </TabsContent>
              
              <TabsContent value="timeline">
                <StoryTimeline data={analyticsData.timeline} />
              </TabsContent>
              
              <TabsContent value="activity">
                <RecentActivity 
                  data={analyticsData.recentActivity} 
                  onStoryClick={handleStoryClick}
                  onAnalyticsClick={handleAnalyticsClick}
                />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StoryAnalyticsDashboard;
