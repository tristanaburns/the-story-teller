'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogEntry } from '@/lib/logging/types';

interface LogTableProps {
  logs: LogEntry[];
  loading?: boolean;
  onLogSelect: (log: LogEntry) => void;
}

const LogTable: React.FC<LogTableProps> = ({ logs, loading = false, onLogSelect }) => {
  // Function to get badge variant based on log level
  const getLevelVariant = (level?: string) => {
    switch (level?.toUpperCase()) {
      case 'TRACE':
        return 'outline';
      case 'DEBUG':
        return 'secondary';
      case 'INFO':
        return 'default';
      case 'WARN':
        return 'warning';
      case 'ERROR':
        return 'destructive';
      case 'FATAL':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return 'N/A';
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (error) {
      return timestamp;
    }
  };

  // Truncate long messages
  const truncateMessage = (message?: string, maxLength = 100) => {
    if (!message) return 'No message';
    if (message.length <= maxLength) return message;
    return `${message.substring(0, maxLength)}...`;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Level</TableHead>
            <TableHead className="w-[180px]">Timestamp</TableHead>
            <TableHead className="w-[150px]">Component</TableHead>
            <TableHead>Message</TableHead>
            <TableHead className="w-[80px] text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                Loading logs...
              </TableCell>
            </TableRow>
          ) : logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No logs found with current filters
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log, index) => (
              <TableRow key={log._id || index} className="group">
                <TableCell>
                  <Badge variant={getLevelVariant(log.level)}>
                    {log.level || 'UNKNOWN'}
                  </Badge>
                </TableCell>
                <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                <TableCell className="font-mono text-xs">
                  {log.component || 'Unknown'}
                </TableCell>
                <TableCell className="max-w-md">
                  {truncateMessage(log.message)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onLogSelect(log)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default LogTable;
