/**
 * MCP Status Card Component
 * 
 * Displays a summary of MCP server status on the dashboard.
 */

"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ServerStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'error' | 'unknown';
}

export default function MCPStatusCard() {
  const [serverStatuses, setServerStatuses] = useState<ServerStatus[]>([
    {
      id: 'memory-mcp',
      name: 'Memory MCP',
      status: 'unknown'
    },
    {
      id: 'everart-mcp',
      name: 'Everart MCP',
      status: 'unknown'
    },
    {
      id: 'thinking-mcp',
      name: 'Sequential Thinking MCP',
      status: 'unknown'
    },
    {
      id: 'database-mcp',
      name: 'Database MCP',
      status: 'unknown'
    }
  ]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkServerStatus = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, we would call an API endpoint to check server status
        // For now, we'll simulate a response
        const simulatedResponse = [
          {
            id: 'memory-mcp',
            name: 'Memory MCP',
            status: 'online' as const
          },
          {
            id: 'everart-mcp',
            name: 'Everart MCP',
            status: 'offline' as const
          },
          {
            id: 'thinking-mcp',
            name: 'Sequential Thinking MCP',
            status: 'offline' as const
          },
          {
            id: 'database-mcp',
            name: 'Database MCP',
            status: 'offline' as const
          }
        ];
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setServerStatuses(simulatedResponse);
      } catch (error) {
        console.error('Failed to fetch MCP server status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkServerStatus();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-red-500';
      case 'error':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusCount = () => {
    return serverStatuses.reduce((count, server) => {
      if (server.status === 'online') {
        return count + 1;
      }
      return count;
    }, 0);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">MCP Servers</h3>
        <Link
          href="/dashboard/mcp"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Manage
        </Link>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <span className="text-2xl font-bold">{getStatusCount()}</span>
            <span className="text-gray-500 ml-1">/ {serverStatuses.length} online</span>
          </div>
          
          <div className="space-y-2">
            {serverStatuses.map((server) => (
              <div key={server.id} className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(server.status)}`}></div>
                <span className="text-sm">{server.name}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            {getStatusCount() === 0 
              ? "No MCP servers are currently online. Some advanced features may be unavailable."
              : getStatusCount() === serverStatuses.length 
                ? "All MCP servers are online. All features are available."
                : "Some MCP servers are offline. Certain features may be limited."}
          </div>
        </>
      )}
    </div>
  );
}
