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
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Chart colors
const STATUS_COLORS = {
  draft: '#FF8042',
  published: '#00C49F',
  archived: '#0088FE',
  unknown: '#AAAAAA'
};

// Status display names
const STATUS_LABELS = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
  unknown: 'Unknown'
};

interface StatusDistributionProps {
  data: Array<{
    status: string;
    count: number;
  }>;
}

const StatusDistribution: React.FC<StatusDistributionProps> = ({ data }) => {
  // Ensure all statuses have a color
  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#AAAAAA';
  };
  
  // Get display label for each status
  const getStatusLabel = (status: string) => {
    return STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status;
  };
  
  // Format data for the chart
  const chartData = data.map(item => ({
    name: getStatusLabel(item.status),
    value: item.count,
    originalStatus: item.status
  }));
  
  // Calculate total for percentage
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  
  // Custom tooltip formatter
  const tooltipFormatter = (value: number, name: string, props: any) => {
    const percentage = ((value / total) * 100).toFixed(1);
    return [`${value} (${percentage}%)`, name];
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Story Status Distribution</CardTitle>
        <CardDescription>
          Distribution of stories by current status
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getStatusColor(entry.originalStatus)}
                  />
                ))}
              </Pie>
              <Tooltip formatter={tooltipFormatter} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: getStatusColor(item.originalStatus) }}
              ></div>
              <div className="text-sm">
                <span className="font-medium">{item.name}:</span> {item.value}
                {total > 0 && (
                  <span className="text-muted-foreground ml-1">
                    ({((item.value / total) * 100).toFixed(1)}%)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusDistribution;
