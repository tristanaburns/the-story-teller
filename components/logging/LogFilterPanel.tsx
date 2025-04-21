'use client';

import React from 'react';
import { 
  Card, 
  CardContent
} from '@/components/ui/card';
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
import { LogQueryParams } from '@/lib/logging/types';
import { LogLevel } from '@/lib/logging/logger';

interface LogFilterPanelProps {
  filters: LogQueryParams;
  onFilterChange: (filters: Partial<LogQueryParams>) => void;
  onSearch: () => void;
}

const LogFilterPanel: React.FC<LogFilterPanelProps> = ({ 
  filters, 
  onFilterChange, 
  onSearch 
}) => {
  // Handle level change
  const handleLevelChange = (value: string) => {
    onFilterChange({ level: value === 'ALL' ? undefined : value });
  };
  
  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ search: e.target.value });
  };
  
  // Handle component input
  const handleComponentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ component: e.target.value });
  };
  
  // Handle correlation ID input
  const handleCorrelationIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ correlationId: e.target.value });
  };
  
  // Handle user ID input
  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ userId: e.target.value });
  };
  
  // Handle start date change
  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      onFilterChange({ startDate: date });
    }
  };
  
  // Handle end date change
  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      onFilterChange({ endDate: date });
    }
  };
  
  // Handle limit change
  const handleLimitChange = (value: string) => {
    onFilterChange({ limit: parseInt(value, 10) });
  };
  
  // Handle search button click
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };
  
  // Handle form reset
  const handleReset = () => {
    onFilterChange({
      level: undefined,
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      endDate: new Date(),
      search: '',
      component: '',
      correlationId: '',
      userId: '',
      limit: 100,
      skip: 0
    });
  };
  
  return (
    <Card className="bg-muted/50">
      <CardContent className="pt-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Log Level Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Log Level</label>
              <Select
                value={filters.level || 'ALL'}
                onValueChange={handleLevelChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Levels</SelectItem>
                  <SelectItem value="TRACE">Trace</SelectItem>
                  <SelectItem value="DEBUG">Debug</SelectItem>
                  <SelectItem value="INFO">Info</SelectItem>
                  <SelectItem value="WARN">Warning</SelectItem>
                  <SelectItem value="ERROR">Error</SelectItem>
                  <SelectItem value="FATAL">Fatal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Date Range Filters */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <DatePicker
                date={filters.startDate}
                onSelect={handleStartDateChange}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <DatePicker
                date={filters.endDate}
                onSelect={handleEndDateChange}
              />
            </div>
            
            {/* Limit Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Results Limit</label>
              <Select
                value={String(filters.limit || 100)}
                onValueChange={handleLimitChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Limit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="250">250</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                  <SelectItem value="1000">1000</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Search Text */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Text</label>
              <Input
                placeholder="Search in message"
                value={filters.search || ''}
                onChange={handleSearchChange}
              />
            </div>
            
            {/* Component Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Component</label>
              <Input
                placeholder="Component name"
                value={filters.component || ''}
                onChange={handleComponentChange}
              />
            </div>
            
            {/* Correlation ID Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Correlation ID</label>
              <Input
                placeholder="Correlation ID"
                value={filters.correlationId || ''}
                onChange={handleCorrelationIdChange}
              />
            </div>
            
            {/* User ID Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">User ID</label>
              <Input
                placeholder="User ID"
                value={filters.userId || ''}
                onChange={handleUserIdChange}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset Filters
            </Button>
            <Button type="submit">
              Apply Filters
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LogFilterPanel;
