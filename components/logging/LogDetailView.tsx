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
import { LogEntry } from '@/lib/logging/types';
import { createLogger } from '@/lib/logging';

// Initialize logger
const logger = createLogger('LogDetailView');

interface LogDetailViewProps {
  log: LogEntry;
  onClose: () => void;
}

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
      return timestamp;
    }
  };
  
  // Handle follow correlation ID
  const handleFollowCorrelation = () => {
    // Navigate to logs with this correlation ID
    if (log.correlationId) {
      // This would typically update the filters in the parent component
      logger.debug('Following correlation ID', { correlationId: log.correlationId });
      // For now, we'll just close this view since we don't have direct access to the filters
      onClose();
    }
  };
  
  // Safely stringify object for display
  const safeStringify = (obj: any): string => {
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
                <p className="text-sm font-mono">{log.method || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1">Path</h3>
                <p className="text-sm font-mono">{log.path || 'N/A'}</p>
              </div>
              {log.statusCode && (
                <div>
                  <h3 className="text-sm font-semibold mb-1">Status Code</h3>
                  <p className="text-sm">{log.statusCode}</p>
                </div>
              )}
              {log.duration && (
                <div>
                  <h3 className="text-sm font-semibold mb-1">Duration</h3>
                  <p className="text-sm">{log.duration.toFixed(2)} ms</p>
                </div>
              )}
            </div>
            
            {log.error && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-1">Error Details</h3>
                <div className="bg-red-50 dark:bg-red-950 p-4 rounded border border-red-200 dark:border-red-800">
                  <p className="font-semibold text-red-600 dark:text-red-400">{log.error.name || 'Error'}</p>
                  <p className="text-sm text-red-600 dark:text-red-400">{log.error.message}</p>
                  {log.error.stack && (
                    <pre className="mt-2 text-xs font-mono overflow-auto p-2 bg-red-100 dark:bg-red-900 rounded">
                      {log.error.stack}
                    </pre>
                  )}
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
                <h3 className="text-sm font-semibold mb-1">MCP Server</h3>
                <p className="text-sm">{log.mcpServer || 'N/A'}</p>
              </div>
            </div>
            
            {log.clientInfo && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-1">Client Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold">IP Address</p>
                    <p className="text-sm">{log.clientInfo.ip || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold">User Agent</p>
                    <p className="text-sm">{log.clientInfo.userAgent || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Browser</p>
                    <p className="text-sm">{log.clientInfo.browser || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Operating System</p>
                    <p className="text-sm">{log.clientInfo.os || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="data">
            {log.data ? (
              <pre className="overflow-auto p-4 bg-muted rounded-md text-xs font-mono">
                {safeStringify(log.data)}
              </pre>
            ) : (
              <p className="text-center py-4 text-muted-foreground">No data available</p>
            )}
          </TabsContent>
          
          <TabsContent value="metadata">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-1">Log ID</h3>
                <p className="text-sm font-mono">{log._id || 'N/A'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold mb-1">Environment</h3>
                <p className="text-sm">{log.environment || 'N/A'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold mb-1">Application Version</h3>
                <p className="text-sm">{log.appVersion || 'N/A'}</p>
              </div>
              
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
