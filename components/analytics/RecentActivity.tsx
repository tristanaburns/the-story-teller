'use client';

import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChartIcon, 
  ExternalLinkIcon 
} from 'lucide-react';

interface RecentActivityProps {
  data: Array<{
    id: string;
    title: string;
    updatedAt: string;
  }>;
  onStoryClick: (storyId: string) => void;
  onAnalyticsClick: (storyId: string) => void;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ 
  data,
  onStoryClick,
  onAnalyticsClick 
}) => {
  // Format relative time (e.g., "2 days ago")
  const getRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
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
  
  // If no data, show placeholder
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your recently updated stories
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center p-6 text-muted-foreground">
            <p>No recent activity found</p>
            <p className="text-sm mt-1">
              Start writing or update your stories to see them here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Your recently updated stories
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="divide-y">
          {data.map((story) => (
            <div 
              key={story.id} 
              className="py-4 first:pt-0 last:pb-0"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 
                    className="text-base font-medium hover:underline cursor-pointer"
                    onClick={() => onStoryClick(story.id)}
                  >
                    {story.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Updated {getRelativeTime(story.updatedAt)}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStoryClick(story.id)}
                  >
                    <ExternalLinkIcon className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAnalyticsClick(story.id)}
                  >
                    <ChartIcon className="h-4 w-4 mr-1" />
                    Analytics
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {data.length > 0 && (
          <div className="mt-4 text-center">
            <Button variant="ghost" size="sm">
              View All Activity
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
