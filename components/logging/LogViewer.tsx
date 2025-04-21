'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { LogLevel } from '@/lib/logging/logger';
import { clientLogger } from '@/lib/logging/client/clientLogger';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  Bug, 
  Info, 
  Search, 
  Terminal, 
  AlertTriangle,
  RefreshCw,
  Download,
  Filter,
  X 
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';

// Log entry interface
interface LogEntry {
  _id: string;
  timestamp: string;
  level: string;
  message: string;
  component?: string;
  correlationId?: string;
  userId?: string;
  requestId?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  duration?: number;
  mcpServer?: string;
  clientInfo?: {
    ip?: string;
    userAgent?: string;
    browser?: string;
    os?: string;
  };
  metadata?: Record<string, any>;
  data?: any;
  stackTrace?: string;
  environment?: string;
  appVersion?: string;
}

// Filter interface
interface LogFilter {
  level?: string;
  component?: string;
  correlationId?: string;
  userId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  mcpServer?: string;
  environment?: string;
}

// Props for the log viewer component
interface LogViewerProps {
  initialLogs?: LogEntry[];
  loadLogsFromServer?: boolean;
  autoRefresh?: boolean;
  autoRefreshInterval?: number;
  defaultLevel?: string;
  defaultPageSize?: number;
  componentFilters?: string[];
  logPath?: string;
  allowExport?: boolean;
  maxHeight?: string;
  title?: string;
  description?: string;
}

// Icons for log levels
const LogLevelIcons: Record<string, React.ReactNode> = {
  'TRACE': <Terminal className="h-4 w-4 text-gray-400" />,
  'DEBUG': <Bug className="h-4 w-4 text-blue-400" />,
  'INFO': <Info className="h-4 w-4 text-green-400" />,
  'WARN': <AlertTriangle className="h-4 w-4 text-yellow-400" />,
  'ERROR': <AlertCircle className="h-4 w-4 text-red-400" />,
  'FATAL': <AlertCircle className="h-4 w-4 text-purple-400" />
};

// Color classes for log levels
const LogLevelClasses: Record<string, string> = {
  'TRACE': 'bg-gray-100 text-gray-800',
  'DEBUG': 'bg-blue-100 text-blue-800',
  'INFO': 'bg-green-100 text-green-800',
  'WARN': 'bg-yellow-100 text-yellow-800',
  'ERROR': 'bg-red-100 text-red-800',
  'FATAL': 'bg-purple-100 text-purple-800'
};

/**
 * Format a date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date);
}

/**
 * Format milliseconds as a human-readable duration
 */
function formatDuration(ms: number): string {
  if (ms < 1) {
    return `${(ms * 1000).toFixed(2)}µs`;
  }
  if (ms < 1000) {
    return `${ms.toFixed(2)}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Format JSON data for display
 */
function formatJSON(data: any): string {
  try {
    return JSON.stringify(data, null, 2);
  } catch (error) {
    return String(data);
  }
}

/**
 * Log viewer component
 */
export function LogViewer({
  initialLogs = [],
  loadLogsFromServer = true,
  autoRefresh = false,
  autoRefreshInterval = 30000,
  defaultLevel = 'INFO',
  defaultPageSize = 20,
  componentFilters = [],
  logPath = '/api/logging/logs',
  allowExport = true,
  maxHeight = '600px',
  title = 'Log Viewer',
  description = 'View and analyze application logs'
}: LogViewerProps) {
  // State for logs data
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [totalLogs, setTotalLogs] = useState(initialLogs.length);
  
  // Filter state
  const [filter, setFilter] = useState<LogFilter>({
    level: defaultLevel
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [showJsonDialog, setShowJsonDialog] = useState(false);
  const [selectedLogData, setSelectedLogData] = useState<any>(null);
  
  // Available components for filtering
  const [availableComponents, setAvailableComponents] = useState<string[]>(componentFilters);
  
  // Logger for component
  const logger = useMemo(() => clientLogger.createChildLogger('LogViewer'), []);
  
  // Fetch logs from server
  const fetchLogs = async (page = 1, refreshing = false) => {
    if (!loadLogsFromServer) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString()
      });
      
      // Add filters
      if (filter.level) params.append('level', filter.level);
      if (filter.component) params.append('component', filter.component);
      if (filter.correlationId) params.append('correlationId', filter.correlationId);
      if (filter.userId) params.append('userId', filter.userId);
      if (filter.search) params.append('search', filter.search);
      if (filter.startDate) params.append('startDate', filter.startDate);
      if (filter.endDate) params.append('endDate', filter.endDate);
      if (filter.mcpServer) params.append('mcpServer', filter.mcpServer);
      if (filter.environment) params.append('environment', filter.environment);
      
      // Fetch logs
      const response = await fetch(`${logPath}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update state
      setLogs(data.logs);
      setTotalLogs(data.total);
      setCurrentPage(page);
      
      // Update available components
      if (data.availableComponents && data.availableComponents.length > 0) {
        setAvailableComponents(data.availableComponents);
      }
      
      // Log success
      if (!refreshing) {
        logger.debug('Fetched logs', {
          page,
          pageSize,
          filter,
          total: data.total
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to fetch logs: ${errorMessage}`);
      logger.error('Failed to fetch logs', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Auto-refresh logs
  useEffect(() => {
    if (!autoRefresh || !loadLogsFromServer) return;
    
    const intervalId = setInterval(() => {
      fetchLogs(currentPage, true);
    }, autoRefreshInterval);
    
    return () => clearInterval(intervalId);
  }, [autoRefresh, autoRefreshInterval, currentPage, pageSize, filter]);
  
  // Initial load
  useEffect(() => {
    if (loadLogsFromServer) {
      fetchLogs(1);
    }
  }, []);
  
  // Handle filter change
  const handleFilterChange = (key: keyof LogFilter, value: string) => {
    setFilter(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page
  };
  
  // Apply filters
  const handleApplyFilters = () => {
    fetchLogs(1);
  };
  
  // Reset filters
  const handleResetFilters = () => {
    setFilter({ level: defaultLevel });
    setCurrentPage(1);
    fetchLogs(1);
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchLogs(page);
  };
  
  // Calculate total pages
  const totalPages = Math.ceil(totalLogs / pageSize);
  
  // View log details
  const handleViewDetails = (log: LogEntry) => {
    if (expandedLogId === log._id) {
      setExpandedLogId(null);
    } else {
      setExpandedLogId(log._id);
      logger.debug('Viewing log details', { logId: log._id });
    }
  };
  
  // View log data in JSON viewer
  const handleViewJson = (data: any) => {
    setSelectedLogData(data);
    setShowJsonDialog(true);
  };
  
  // Export logs to JSON file
  const handleExportLogs = () => {
    try {
      const dataStr = JSON.stringify(logs, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportFilename = `logs-export-${new Date().toISOString()}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFilename);
      linkElement.click();
      
      logger.info('Exported logs', { count: logs.length });
    } catch (err) {
      setError('Failed to export logs');
      logger.error('Failed to export logs', err);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        
        {/* Filter controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Log Level</label>
            <Select
              value={filter.level || ''}
              onValueChange={(value) => handleFilterChange('level', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Levels</SelectItem>
                <SelectItem value="TRACE">Trace</SelectItem>
                <SelectItem value="DEBUG">Debug</SelectItem>
                <SelectItem value="INFO">Info</SelectItem>
                <SelectItem value="WARN">Warning</SelectItem>
                <SelectItem value="ERROR">Error</SelectItem>
                <SelectItem value="FATAL">Fatal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Component</label>
            <Select
              value={filter.component || ''}
              onValueChange={(value) => handleFilterChange('component', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select component" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Components</SelectItem>
                {availableComponents.map((component) => (
                  <SelectItem key={component} value={component}>
                    {component}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Search</label>
            <div className="flex">
              <Input
                type="text"
                placeholder="Search logs..."
                value={filter.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="flex-grow"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Correlation ID</label>
            <Input
              type="text"
              placeholder="Filter by correlation ID"
              value={filter.correlationId || ''}
              onChange={(e) => handleFilterChange('correlationId', e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <div className="flex space-x-2">
            <Button onClick={handleApplyFilters} size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
            <Button onClick={handleResetFilters} variant="outline" size="sm">
              <X className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
          
          <div className="flex space-x-2">
            {loadLogsFromServer && (
              <Button 
                onClick={() => fetchLogs(currentPage)} 
                variant="outline" 
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )}
            
            {allowExport && logs.length > 0 && (
              <Button onClick={handleExportLogs} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {/* Logs table */}
        <div className="overflow-auto" style={{ maxHeight }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Component</TableHead>
                <TableHead className="w-full">Message</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    {loading ? 'Loading logs...' : 'No logs found'}
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <React.Fragment key={log._id}>
                    <TableRow 
                      className={`cursor-pointer ${expandedLogId === log._id ? 'bg-gray-50' : ''}`}
                      onClick={() => handleViewDetails(log)}
                    >
                      <TableCell className="whitespace-nowrap">
                        {formatDate(log.timestamp)}
                      </TableCell>
                      <TableCell>
                        <Badge className={LogLevelClasses[log.level] || ''}>
                          {LogLevelIcons[log.level] || null}
                          <span className="ml-1">{log.level}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {log.component || '-'}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.message}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(log);
                          }}
                        >
                          {expandedLogId === log._id ? 'Hide' : 'View'}
                        </Button>
                      </TableCell>
                    </TableRow>
                    
                    {/* Expanded details */}
                    {expandedLogId === log._id && (
                      <TableRow className="bg-gray-50">
                        <TableCell colSpan={5} className="p-0">
                          <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <h4 className="text-sm font-medium mb-1">Correlation ID</h4>
                                <p className="text-sm font-mono">{log.correlationId || '-'}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-1">User ID</h4>
                                <p className="text-sm font-mono">{log.userId || '-'}</p>
                              </div>
                              {log.requestId && (
                                <div>
                                  <h4 className="text-sm font-medium mb-1">Request ID</h4>
                                  <p className="text-sm font-mono">{log.requestId}</p>
                                </div>
                              )}
                              {log.method && (
                                <div>
                                  <h4 className="text-sm font-medium mb-1">Method</h4>
                                  <p className="text-sm">{log.method}</p>
                                </div>
                              )}
                              {log.path && (
                                <div>
                                  <h4 className="text-sm font-medium mb-1">Path</h4>
                                  <p className="text-sm font-mono">{log.path}</p>
                                </div>
                              )}
                              {log.statusCode !== undefined && (
                                <div>
                                  <h4 className="text-sm font-medium mb-1">Status Code</h4>
                                  <p className="text-sm">{log.statusCode}</p>
                                </div>
                              )}
                              {log.duration !== undefined && (
                                <div>
                                  <h4 className="text-sm font-medium mb-1">Duration</h4>
                                  <p className="text-sm">{formatDuration(log.duration)}</p>
                                </div>
                              )}
                              {log.mcpServer && (
                                <div>
                                  <h4 className="text-sm font-medium mb-1">MCP Server</h4>
                                  <p className="text-sm">{log.mcpServer}</p>
                                </div>
                              )}
                            </div>
                            
                            <Accordion type="single" collapsible>
                              {log.clientInfo && (
                                <AccordionItem value="clientInfo">
                                  <AccordionTrigger>Client Information</AccordionTrigger>
                                  <AccordionContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {log.clientInfo.ip && (
                                        <div>
                                          <h4 className="text-sm font-medium mb-1">IP Address</h4>
                                          <p className="text-sm font-mono">{log.clientInfo.ip}</p>
                                        </div>
                                      )}
                                      {log.clientInfo.userAgent && (
                                        <div>
                                          <h4 className="text-sm font-medium mb-1">User Agent</h4>
                                          <p className="text-sm">{log.clientInfo.userAgent}</p>
                                        </div>
                                      )}
                                      {log.clientInfo.browser && (
                                        <div>
                                          <h4 className="text-sm font-medium mb-1">Browser</h4>
                                          <p className="text-sm">{log.clientInfo.browser}</p>
                                        </div>
                                      )}
                                      {log.clientInfo.os && (
                                        <div>
                                          <h4 className="text-sm font-medium mb-1">Operating System</h4>
                                          <p className="text-sm">{log.clientInfo.os}</p>
                                        </div>
                                      )}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              )}
                              
                              {log.metadata && Object.keys(log.metadata).length > 0 && (
                                <AccordionItem value="metadata">
                                  <AccordionTrigger>Metadata</AccordionTrigger>
                                  <AccordionContent>
                                    <div className="bg-gray-100 p-3 rounded">
                                      <pre className="text-xs overflow-auto max-h-60 whitespace-pre-wrap">
                                        {formatJSON(log.metadata)}
                                      </pre>
                                    </div>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      className="mt-2"
                                      onClick={() => handleViewJson(log.metadata)}
                                    >
                                      View in JSON Viewer
                                    </Button>
                                  </AccordionContent>
                                </AccordionItem>
                              )}
                              
                              {log.data && (
                                <AccordionItem value="data">
                                  <AccordionTrigger>Data</AccordionTrigger>
                                  <AccordionContent>
                                    <div className="bg-gray-100 p-3 rounded">
                                      <pre className="text-xs overflow-auto max-h-60 whitespace-pre-wrap">
                                        {formatJSON(log.data)}
                                      </pre>
                                    </div>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      className="mt-2"
                                      onClick={() => handleViewJson(log.data)}
                                    >
                                      View in JSON Viewer
                                    </Button>
                                  </AccordionContent>
                                </AccordionItem>
                              )}
                              
                              {log.stackTrace && (
                                <AccordionItem value="stackTrace">
                                  <AccordionTrigger>Stack Trace</AccordionTrigger>
                                  <AccordionContent>
                                    <div className="bg-gray-100 p-3 rounded">
                                      <pre className="text-xs overflow-auto max-h-60 whitespace-pre-wrap">
                                        {log.stackTrace}
                                      </pre>
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              )}
                            </Accordion>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      
      {/* Pagination */}
      {loadLogsFromServer && totalPages > 1 && (
        <CardFooter>
          <div className="w-full flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {logs.length} of {totalLogs} logs
              {logs.length > 0 && ` (Page ${currentPage} of ${totalPages})`}
            </div>
            
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = currentPage;
                  if (totalPages <= 5) {
                    // Show all pages if 5 or fewer
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    // At the beginning
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    // At the end
                    pageNum = totalPages - 4 + i;
                  } else {
                    // In the middle
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => handlePageChange(pageNum)}
                        isActive={pageNum === currentPage}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} 
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardFooter>
      )}
      
      {/* JSON Viewer Dialog */}
      <Dialog open={showJsonDialog} onOpenChange={setShowJsonDialog}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>JSON Viewer</DialogTitle>
            <DialogDescription>Detailed view of log data</DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 bg-gray-50 p-4 rounded border">
            <pre className="text-xs overflow-auto max-h-96 whitespace-pre-wrap">
              {formatJSON(selectedLogData)}
            </pre>
          </div>
          
          <div className="flex justify-end mt-4">
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default LogViewer;
