'use client';

import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// Genre display colors
const GENRE_COLORS = {
  'fantasy': '#8884d8',
  'science-fiction': '#82ca9d',
  'mystery': '#ffc658',
  'romance': '#ff8042',
  'thriller': '#a4de6c',
  'horror': '#d0ed57',
  'historical': '#83a6ed',
  'western': '#8dd1e1',
  'general': '#82ca9d',
  'unknown': '#AAAAAA'
};

// Genre display names
const GENRE_LABELS = {
  'fantasy': 'Fantasy',
  'science-fiction': 'Science Fiction',
  'mystery': 'Mystery',
  'romance': 'Romance',
  'thriller': 'Thriller',
  'horror': 'Horror',
  'historical': 'Historical',
  'western': 'Western',
  'general': 'General',
  'unknown': 'Unknown'
};

interface GenreDistributionProps {
  data: Array<{
    genre: string;
    count: number;
  }>;
}

const GenreDistribution: React.FC<GenreDistributionProps> = ({ data }) => {
  // Ensure all genres have a color and label
  const getGenreColor = (genre: string) => {
    return GENRE_COLORS[genre as keyof typeof GENRE_COLORS] || '#AAAAAA';
  };
  
  const getGenreLabel = (genre: string) => {
    return GENRE_LABELS[genre as keyof typeof GENRE_LABELS] || genre;
  };
  
  // Format data for the chart (sort by count descending)
  const chartData = data
    .map(item => ({
      name: getGenreLabel(item.genre),
      value: item.count,
      originalGenre: item.genre
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6); // Limit to top 6 for visibility
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Genre Distribution</CardTitle>
        <CardDescription>
          Distribution of stories by genre
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 5, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={100}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value) => [`${value} stories`, 'Count']}
                labelFormatter={(label) => `Genre: ${label}`}
              />
              <Bar 
                dataKey="value" 
                name="Stories" 
                fill="#8884d8"
                radius={[0, 4, 4, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getGenreColor(entry.originalGenre)} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Show "Other" category if there are more genres than shown */}
        {data.length > chartData.length && (
          <div className="mt-2 text-sm text-center text-muted-foreground">
            <p>
              {data.length - chartData.length} more genres not shown
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GenreDistribution;
