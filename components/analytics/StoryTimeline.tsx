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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

// Month names for formatting
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

interface StoryTimelineProps {
  data: Array<{
    date: string; // format: YYYY-MM
    count: number;
  }>;
}

const StoryTimeline: React.FC<StoryTimelineProps> = ({ data }) => {
  // Format dates for display
  const formattedData = data.map(item => {
    const [year, month] = item.date.split('-');
    return {
      ...item,
      formattedDate: `${MONTH_NAMES[parseInt(month, 10) - 1]} ${year}`
    };
  });
  
  // Fill in missing months with zero counts
  const filledData = React.useMemo(() => {
    if (formattedData.length <= 1) return formattedData;
    
    const result = [...formattedData];
    
    // Sort by date
    result.sort((a, b) => a.date.localeCompare(b.date));
    
    // Fill missing months
    const startDate = new Date(result[0].date + '-01');
    const endDate = new Date(result[result.length - 1].date + '-01');
    
    const filledResult = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      
      const existingEntry = result.find(item => item.date === yearMonth);
      
      if (existingEntry) {
        filledResult.push(existingEntry);
      } else {
        filledResult.push({
          date: yearMonth,
          count: 0,
          formattedDate: `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`
        });
      }
      
      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return filledResult;
  }, [formattedData]);
  
  // If no data, show placeholder
  if (filledData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Story Creation Timeline</CardTitle>
          <CardDescription>
            Timeline of story creation activity
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 flex justify-center items-center h-[300px]">
          <p className="text-muted-foreground">No timeline data available</p>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate average stories per month
  const average = filledData.reduce((sum, item) => sum + item.count, 0) / filledData.length;
  
  // Calculate trend (positive or negative)
  const trend = filledData.length > 6 
    ? (filledData.slice(-3).reduce((sum, item) => sum + item.count, 0) / 3) - 
      (filledData.slice(-6, -3).reduce((sum, item) => sum + item.count, 0) / 3)
    : 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Story Creation Timeline</CardTitle>
        <CardDescription className="flex justify-between">
          <span>Timeline of story creation activity</span>
          <span>
            Avg: {average.toFixed(1)}/month
            {trend !== 0 && (
              <span className={trend > 0 ? "text-green-500 ml-2" : "text-red-500 ml-2"}>
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}
              </span>
            )}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filledData}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="formattedDate" 
                interval={Math.ceil(filledData.length / 12)} 
                tick={{ fontSize: 12 }}
              />
              <YAxis allowDecimals={false} />
              <Tooltip 
                formatter={(value) => [`${value} stories`, 'Created']}
                labelFormatter={(label) => `Period: ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                name="Stories Created"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default StoryTimeline;
