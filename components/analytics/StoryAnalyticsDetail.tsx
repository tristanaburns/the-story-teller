'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
  Cell
} from 'recharts';
import { useClientLogger } from '@/lib/hooks/useClientLogger';
import { useRouter } from 'next/navigation';

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A020F0', '#FF0000'];

interface StoryAnalyticsDetailProps {
  storyId: string;
}

const StoryAnalyticsDetail: React.FC<StoryAnalyticsDetailProps> = ({ 
  storyId 
}) => {
  // Initialize logger
  const logger = useClientLogger('StoryAnalyticsDetail');
  
  // State for analytics data and UI state
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  const router = useRouter();
  
  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      logger.debug('Fetching story analytics details', { storyId });
      
      const response = await fetch(`/api/stories/${storyId}/analytics`);
      
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
  
  // Navigate to story page
  const handleNavigateToStory = () => {
    router.push(`/stories/${storyId}`);
  };
  
  // Format relative time (e.g., "2 days ago")
  const getRelativeTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
    }
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
  };
  
  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Fetch analytics when component mounts
  useEffect(() => {
    fetchAnalytics();
  }, [storyId]);
  
  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading analytics data...</p>
      </div>
    );
  }
  
  // No data state
  if (!analyticsData) {
    return (
      <Alert>
        <AlertTitle>No Analytics Available</AlertTitle>
        <AlertDescription>
          Analytics data could not be retrieved for this story.
        </AlertDescription>
      </Alert>
    );
  }
  
  // Prepare character data for chart
  const characterData = analyticsData.elements.characters.typeDistribution.map((item: any) => ({
    name: item.type.charAt(0).toUpperCase() + item.type.slice(1),
    value: item.count
  }));
  
  // Prepare location data for chart
  const locationData = analyticsData.elements.locations.typeDistribution.map((item: any) => ({
    name: item.type.charAt(0).toUpperCase() + item.type.slice(1),
    value: item.count
  }));
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">{analyticsData.storyDetails.title}</CardTitle>
              <CardDescription>
                Analytics and statistics
              </CardDescription>
            </div>
            <Button onClick={handleNavigateToStory}>
              Go to Story
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="content">Content Stats</TabsTrigger>
              <TabsTrigger value="elements">Story Elements</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-2 md:col-span-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-muted-foreground">Status</span>
                          <span className="text-lg font-semibold">
                            {analyticsData.storyDetails.status.charAt(0).toUpperCase() + analyticsData.storyDetails.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-muted-foreground">Genre</span>
                          <span className="text-lg font-semibold">
                            {analyticsData.storyDetails.genre.charAt(0).toUpperCase() + analyticsData.storyDetails.genre.slice(1)}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-muted-foreground">Created</span>
                          <span className="text-lg font-semibold">
                            {formatDate(analyticsData.storyDetails.createdAt)}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-muted-foreground">Last Updated</span>
                          <span className="text-lg font-semibold">
                            {getRelativeTime(analyticsData.storyDetails.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold">
                        {analyticsData.content.wordCount.toLocaleString()}
                      </span>
                      <span className="text-sm font-medium text-muted-foreground">
                        Words
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold">
                        {analyticsData.elements.characters.count}
                      </span>
                      <span className="text-sm font-medium text-muted-foreground">
                        Characters
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold">
                        {analyticsData.elements.locations.count}
                      </span>
                      <span className="text-sm font-medium text-muted-foreground">
                        Locations
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold">
                        {analyticsData.elements.timelineEvents.count}
                      </span>
                      <span className="text-sm font-medium text-muted-foreground">
                        Timeline Events
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Content Statistics</CardTitle>
                    <CardDescription>
                      Word count and reading metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Word Count</span>
                        <span className="font-semibold">{analyticsData.content.wordCount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Character Count</span>
                        <span className="font-semibold">{analyticsData.content.characterCount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Reading Time</span>
                        <span className="font-semibold">{analyticsData.content.estimatedReadingTime} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Avg Word Length</span>
                        <span className="font-semibold">
                          {analyticsData.content.wordCount > 0 
                            ? (analyticsData.content.characterCount / analyticsData.content.wordCount).toFixed(1) 
                            : '0'} chars
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Writing Metrics</CardTitle>
                    <CardDescription>
                      Writing pace and revision statistics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Days Since Creation</span>
                        <span className="font-semibold">{analyticsData.storyDetails.daysSinceCreation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Days Since Update</span>
                        <span className="font-semibold">{analyticsData.storyDetails.daysSinceUpdate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Writing Pace</span>
                        <span className="font-semibold">{analyticsData.content.writingPace} words/day</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Revision Count</span>
                        <span className="font-semibold">{analyticsData.content.revisionCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Revision Frequency</span>
                        <span className="font-semibold">{analyticsData.content.revisionFrequency} per week</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="elements">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Character Distribution</CardTitle>
                    <CardDescription>
                      Characters by type
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {characterData.length > 0 ? (
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={characterData}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {characterData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [value, 'Count']} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center h-[300px]">
                        <p className="text-muted-foreground">No character data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Location Distribution</CardTitle>
                    <CardDescription>
                      Locations by type
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {locationData.length > 0 ? (
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={locationData}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {locationData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [value, 'Count']} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center h-[300px]">
                        <p className="text-muted-foreground">No location data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Characters by Appearances</CardTitle>
                    <CardDescription>
                      Character frequency in your story
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analyticsData.characterDetails && analyticsData.characterDetails.length > 0 ? (
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={analyticsData.characterDetails
                              .sort((a: any, b: any) => b.appearances - a.appearances)
                              .slice(0, 10)
                              .map((character: any) => ({
                                name: character.name,
                                appearances: character.appearances,
                                type: character.type
                              }))}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            layout="vertical"
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis 
                              dataKey="name"
                              type="category" 
                              width={100}
                              tick={{ fontSize: 12 }}
                            />
                            <Tooltip />
                            <Legend />
                            <Bar 
                              dataKey="appearances" 
                              name="Appearances" 
                              fill="#8884d8"
                              radius={[0, 4, 4, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center h-[300px]">
                        <p className="text-muted-foreground">No character appearance data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="metadata">
              <div className="grid grid-cols-1 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Story Tags</CardTitle>
                    <CardDescription>
                      Tags associated with your story
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analyticsData.metadata.tags && analyticsData.metadata.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {analyticsData.metadata.tags.map((tag: string, index: number) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No tags have been added to this story</p>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Potential Improvements</CardTitle>
                    <CardDescription>
                      Suggestions based on analytics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analyticsData.elements.characters.count === 0 && (
                        <li className="flex items-center gap-2">
                          <span className="text-amber-500">⚠️</span>
                          <span>Consider adding characters to your story</span>
                        </li>
                      )}
                      
                      {analyticsData.elements.locations.count === 0 && (
                        <li className="flex items-center gap-2">
                          <span className="text-amber-500">⚠️</span>
                          <span>Consider adding locations to your story</span>
                        </li>
                      )}
                      
                      {analyticsData.content.wordCount < 1000 && (
                        <li className="flex items-center gap-2">
                          <span className="text-amber-500">⚠️</span>
                          <span>Your story is quite short ({analyticsData.content.wordCount} words)</span>
                        </li>
                      )}
                      
                      {analyticsData.storyDetails.daysSinceUpdate > 30 && (
                        <li className="flex items-center gap-2">
                          <span className="text-amber-500">⚠️</span>
                          <span>Story hasn't been updated in {analyticsData.storyDetails.daysSinceUpdate} days</span>
                        </li>
                      )}
                      
                      {analyticsData.content.potentialPlotHoles > 0 && (
                        <li className="flex items-center gap-2">
                          <span className="text-amber-500">⚠️</span>
                          <span>Detected {analyticsData.content.potentialPlotHoles} potential plot inconsistencies</span>
                        </li>
                      )}
                      
                      {/* Show a positive message if no issues detected */}
                      {analyticsData.elements.characters.count > 0 &&
                       analyticsData.elements.locations.count > 0 &&
                       analyticsData.content.wordCount >= 1000 &&
                       analyticsData.storyDetails.daysSinceUpdate <= 30 &&
                       analyticsData.content.potentialPlotHoles === 0 && (
                        <li className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          <span>Your story structure looks good! Keep writing!</span>
                        </li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <span className="text-xs text-muted-foreground">
            Last updated: {formatDate(analyticsData.storyDetails.updatedAt)}
          </span>
          <Button variant="outline" size="sm" onClick={fetchAnalytics}>
            Refresh Analytics
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default StoryAnalyticsDetail;
