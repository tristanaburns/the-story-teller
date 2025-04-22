'use client';

import React, { useState } from 'react';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/ui/tabs';
import { LogEntry, createLogger } from '@/lib/logging';

// Initialize logger
const logger = createLogger('LogDetailView');

interface LogDetailViewProps {
  log: LogEntry;
  onClose: () => void;
}

/**
 * Component for displaying detailed log information
 * Provides a tabbed interface to view different aspects of a log entry
 */
const LogDetailView: React.FC<LogDetailViewProps> = ({ log, onClose }) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // Function to get badge variant based on log level
  const getLevelVariant = (level?: string) => {
    switch (level?.toUpperCase()) {
      case 'TRACE': return 'outline';
      case 'DEBUG': return 'secondary';
      case 'INFO': return 'default';
      case 'WARN': return 'warning';
      case 'ERROR': return 'destructive';
      case 'FATAL': return 'destructive';
      default: return 'outline';
    }
  };

  // Format date
  const formatDate = (timestamp?: string) => {
    if (!timestamp) return 'N/A';
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (error) {
      logger.error('Error formatting date', { error, timestamp });
      return timestamp;
    }
  };
  
  // Handle follow correlation ID
  const handleFollowCorrelation = () => {
    try {
      // Navigate to logs with this correlation ID
      if (log.correlationId) {
        // This would typically update the filters in the parent component
        logger.debug('Following correlation ID', { correlationId: log.correlationId });
        // For now, we'll just close this view since we don't have direct access to the filters
        onClose();
      }
    } catch (error) {
      logger.error('Error following correlation ID', { error, correlationId: log.correlationId });
    }
  };
  
  // Safely stringify object for display
  const safeStringify = (obj: unknown): string => {
    if (!obj) return 'null';
    
    try {
      return JSON.stringify(obj, null, 2);
    } catch (error) {
      return `Error stringifying object: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  };
  
  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              Log Details
              <Badge variant={getLevelVariant(log.level)}>
                {log.level || 'UNKNOWN'}
              </Badge>
            </CardTitle>
            <CardDescription>
              {formatDate(log.timestamp)}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="context">Context</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold mb-1">Message</h3>
                <p className="text-sm">{log.message || 'No message'}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1">Component</h3>
                <p className="text-sm font-mono">{log.component || 'Unknown'}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1">Method</h3>
                <p className="text-sm font-mono">{log.context?.method || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1">Path</h3>
                <p className="text-sm font-mono">{log.context?.path || 'N/A'}</p>
              </div>
              {log.context?.statusCode && (
                <div>
                  <h3 className="text-sm font-semibold mb-1">Status Code</h3>
                  <p className="text-sm">{log.context.statusCode}</p>
                </div>
              )}
              {log.context?.duration && (
                <div>
                  <h3 className="text-sm font-semibold mb-1">Duration</h3>
                  <p className="text-sm">{log.context.duration.toFixed(2)} ms</p>
                </div>
              )}
            </div>
            
            {log.stackTrace && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-1">Error Details</h3>
                <div className="bg-red-50 dark:bg-red-950 p-4 rounded border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400">Error Details</p>
                  <pre className="mt-2 text-xs font-mono overflow-auto p-2 bg-red-100 dark:bg-red-900 rounded">
                    {log.stackTrace}
                  </pre>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="context" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold mb-1">Correlation ID</h3>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono">{log.correlationId || 'N/A'}</p>
                  {log.correlationId && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleFollowCorrelation}
                    >
                      Follow
                    </Button>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1">User ID</h3>
                <p className="text-sm font-mono">{log.userId || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1">Request ID</h3>
                <p className="text-sm font-mono">{log.requestId || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1">Source</h3>
                <p className="text-sm">{log.source || 'N/A'}</p>
              </div>
            </div>
            
            {log.context?.params && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-1">Request Parameters</h3>
                <pre className="overflow-auto p-4 bg-muted rounded-md text-xs font-mono">
                  {safeStringify(log.context.params)}
                </pre>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="data">
            <pre className="overflow-auto p-4 bg-muted rounded-md text-xs font-mono">
              {log.context ? safeStringify(log.context) : 'No context data available'}
            </pre>
          </TabsContent>
          
          <TabsContent value="metadata">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-1">Environment</h3>
                <p className="text-sm">{log.environment || 'N/A'}</p>
              </div>
              
              {log.tags && log.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-1">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {log.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {log.metadata && (
                <div>
                  <h3 className="text-sm font-semibold mb-1">Additional Metadata</h3>
                  <pre className="overflow-auto p-4 bg-muted rounded-md text-xs font-mono">
                    {safeStringify(log.metadata)}
                  </pre>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="text-xs text-muted-foreground">
          Log recorded at {formatDate(log.timestamp)}
        </div>
        
        {log.correlationId && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleFollowCorrelation}
          >
            View related logs
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default LogDetailView;
