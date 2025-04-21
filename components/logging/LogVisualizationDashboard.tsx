'use client';

import React, { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
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
import { createLogger } from '@/lib/logging';
import { LogLevel } from '@/lib/logging/logger';
import { LogEntry, LogQueryParams } from '@/lib/logging/types';
import LogTable from './LogTable';
import LogFilterPanel from './LogFilterPanel';
import LogDetailView from './LogDetailView';

// Initialize logger
const logger = createLogger('LogVisualizationDashboard');

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A020F0', '#FF0000'];

interface LogVisualizationDashboardProps {
  initialLogs?: LogEntry[];
  isAdmin?: boolean;
}

const LogVisualizationDashboard: React.FC<LogVisualizationDashboardProps> = ({ 
  initialLogs = [],
  isAdmin = false 
}) => {
  // State for logs and selected log
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for filters
  const [filters, setFilters] = useState<LogQueryParams>({
    level: undefined,
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
    endDate: new Date(),
    search: '',
    context: '',
    component: '',
    correlationId: '',
    userId: '',
    limit: 500,
    skip: 0
  });
  
  // State for active tab
  const [activeTab, setActiveTab] = useState<string>('table');
  
  // State for chart data
  const [logsByLevel, setLogsByLevel] = useState<any[]>([]);
  const [logsByComponent, setLogsByComponent] = useState<any[]>([]);
  const [logsTimeline, setLogsTimeline] = useState<any[]>([]);
  
  // Fetch logs based on filters
  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Only proceed if user is admin
      if (!isAdmin) {
        setError('Only administrators can access log data');
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/logs/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(filters)
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching logs: ${response.status}`);
      }
      
      const data = await response.json();
      setLogs(data.logs || []);
      
      // Process data for visualizations
      processLogsForCharts(data.logs || []);
      
      logger.info('Logs fetched successfully', { count: data.logs.length });
    } catch (error) {
      logger.error('Failed to fetch logs', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };
  
  // Process logs for chart visualizations
  const processLogsForCharts = (logData: LogEntry[]) => {
    // Process logs by level
    const levelCounts: Record<string, number> = {};
    logData.forEach(log => {
      const level = log.level || 'unknown';
      levelCounts[level] = (levelCounts[level] || 0) + 1;
    });
    
    const levelChartData = Object.keys(levelCounts).map(level => ({
      name: level,
      value: levelCounts[level]
    }));
    setLogsByLevel(levelChartData);
    
    // Process logs by component
    const componentCounts: Record<string, number> = {};
    logData.forEach(log => {
      const component = log.component || 'unknown';
      componentCounts[component] = (componentCounts[component] || 0) + 1;
    });
    
    // Sort by count and take top 10
    const componentChartData = Object.keys(componentCounts)
      .map(component => ({
        name: component,
        value: componentCounts[component]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
    setLogsByComponent(componentChartData);
    
    // Process logs timeline (by hour)
    const timelineCounts: Record<string, Record<string, number>> = {};
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Initialize timeline with 24 hours
    for (let i = 0; i < 24; i++) {
      const hour = new Date(twentyFourHoursAgo.getTime() + i * 60 * 60 * 1000);
      const hourKey = hour.toISOString().substring(0, 13);
      timelineCounts[hourKey] = {
        'INFO': 0,
        'DEBUG': 0,
        'WARN': 0,
        'ERROR': 0,
        'FATAL': 0
      };
    }
    
    // Fill timeline with log data
    logData.forEach(log => {
      if (!log.timestamp) return;
      
      const timestamp = new Date(log.timestamp);
      const hourKey = timestamp.toISOString().substring(0, 13);
      const level = log.level || 'unknown';
      
      // Skip if outside the 24 hour window
      if (!timelineCounts[hourKey]) return;
      
      if (['INFO', 'DEBUG', 'WARN', 'ERROR', 'FATAL'].includes(level)) {
        timelineCounts[hourKey][level] = (timelineCounts[hourKey][level] || 0) + 1;
      }
    });
    
    // Convert to chart data format
    const timelineChartData = Object.keys(timelineCounts)
      .sort()
      .map(hourKey => ({
        hour: new Date(hourKey).toLocaleTimeString([], { hour: '2-digit' }),
        ...timelineCounts[hourKey]
      }));
    
    setLogsTimeline(timelineChartData);
  };
  
  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<LogQueryParams>) => {
    setFilters({
      ...filters,
      ...newFilters,
      // Reset pagination when filters change
      skip: 0
    });
  };
  
  // Handle log selection
  const handleLogSelect = (log: LogEntry) => {
    setSelectedLog(log);
  };
  
  // Handle pagination
  const handleNextPage = () => {
    setFilters({
      ...filters,
      skip: (filters.skip || 0) + (filters.limit || 100)
    });
  };
  
  const handlePreviousPage = () => {
    const newSkip = Math.max(0, (filters.skip || 0) - (filters.limit || 100));
    setFilters({
      ...filters,
      skip: newSkip
    });
  };
  
  // Load logs on initial render and when filters change
  useEffect(() => {
    if (isAdmin) {
      fetchLogs();
    }
  }, [filters.level, filters.startDate, filters.endDate, filters.skip, filters.limit, isAdmin]);
  
  // Handle search (debounced)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (isAdmin) {
        fetchLogs();
      }
    }, 500);
    
    return () => {
      clearTimeout(handler);
    };
  }, [filters.search, filters.correlationId, filters.userId, filters.component, filters.context]);
  
  // Don't render anything for non-admins
  if (!isAdmin) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You do not have permission to view the logging dashboard.
          Please contact an administrator if you require access.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Log Visualization Dashboard</CardTitle>
          <CardDescription>
            Monitor and analyze application logs across all components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LogFilterPanel 
            filters={filters} 
            onFilterChange={handleFilterChange}
            onSearch={() => fetchLogs()} 
          />
          
          {error && (
            <Alert variant="destructive" className="my-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="table">Log Table</TabsTrigger>
              <TabsTrigger value="charts">Log Charts</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              {selectedLog && <TabsTrigger value="detail">Log Detail</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="table" className="mt-4">
              <LogTable 
                logs={logs} 
                loading={loading} 
                onLogSelect={handleLogSelect}
              />
              <div className="flex justify-between mt-4">
                <Button
                  variant="outline"
                  onClick={handlePreviousPage}
                  disabled={!filters.skip || filters.skip <= 0 || loading}
                >
                  Previous
                </Button>
                <span className="py-2">
                  Showing {filters.skip || 0} - {(filters.skip || 0) + logs.length} logs
                </span>
                <Button
                  variant="outline"
                  onClick={handleNextPage}
                  disabled={logs.length < (filters.limit || 100) || loading}
                >
                  Next
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="charts">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logs by Level Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Logs by Level</CardTitle>
                    <CardDescription>Distribution of logs across severity levels</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={logsByLevel}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {logsByLevel.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [value, 'Count']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                {/* Logs by Component Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Components</CardTitle>
                    <CardDescription>Components with most log entries</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={logsByComponent}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={150} />
                        <Tooltip formatter={(value) => [value, 'Count']} />
                        <Legend />
                        <Bar dataKey="value" fill="#8884d8" name="Log Count" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle>Log Timeline (Last 24 Hours)</CardTitle>
                  <CardDescription>Distribution of logs over time by level</CardDescription>
                </CardHeader>
                <CardContent className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={logsTimeline}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="INFO" stackId="a" fill="#0088FE" />
                      <Bar dataKey="DEBUG" stackId="a" fill="#00C49F" />
                      <Bar dataKey="WARN" stackId="a" fill="#FFBB28" />
                      <Bar dataKey="ERROR" stackId="a" fill="#FF8042" />
                      <Bar dataKey="FATAL" stackId="a" fill="#FF0000" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            
            {selectedLog && (
              <TabsContent value="detail">
                <LogDetailView log={selectedLog} onClose={() => setSelectedLog(null)} />
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogVisualizationDashboard;
