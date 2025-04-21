'use client';

import React from 'react';
import { 
  Card, 
  CardContent
} from '@/components/ui/card';

interface AnalyticsOverviewProps {
  data: {
    totalStories: number;
    totalWordCount: number;
    totalCharacterCount: number;
    avgWordCount: number;
    completionRate: number;
    charactersCount: number;
    locationsCount: number;
    timelineEventsCount: number;
  };
}

const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({ data }) => {
  const metrics = [
    {
      title: 'Total Stories',
      value: data.totalStories,
      description: 'Stories created in your account',
      icon: '📚'
    },
    {
      title: 'Total Word Count',
      value: data.totalWordCount.toLocaleString(),
      description: 'Words written across all stories',
      icon: '📝'
    },
    {
      title: 'Avg. Story Length',
      value: data.avgWordCount.toLocaleString(),
      description: 'Average words per story',
      icon: '📊'
    },
    {
      title: 'Completion Rate',
      value: `${data.completionRate}%`,
      description: 'Percentage of published stories',
      icon: '✅'
    },
    {
      title: 'Characters',
      value: data.charactersCount.toLocaleString(),
      description: 'Total characters created',
      icon: '👤'
    },
    {
      title: 'Locations',
      value: data.locationsCount.toLocaleString(),
      description: 'Total locations created',
      icon: '🗺️'
    },
    {
      title: 'Timeline Events',
      value: data.timelineEventsCount.toLocaleString(),
      description: 'Total timeline events',
      icon: '⏱️'
    },
    {
      title: 'Word to Character Ratio',
      value: (data.avgWordCount / Math.max(data.charactersCount, 1)).toFixed(1),
      description: 'Average words per character',
      icon: '⚖️'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">{metric.icon}</span>
                <h3 className="text-sm font-medium text-muted-foreground">{metric.title}</h3>
              </div>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {metric.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AnalyticsOverview;
