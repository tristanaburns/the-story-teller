/**
 * MCP Server Status Component
 * 
 * Displays the status of all connected MCP servers.
 */

"use client";

import { useState, useEffect } from 'react';
import { MCPServerRegistry } from '@/types/mcp';
import { defaultMCPServers } from '@/lib/mcp';

interface MCPServerStatusProps {
  className?: string;
}

interface ServerStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'error' | 'unknown';
  message?: string;
  latency?: number;
}

export default function MCPServerStatus({ className = '' }: MCPServerStatusProps) {
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
      name: 'MongoDB Atlas MCP',
      status: 'unknown'
    }
  ]);

  useEffect(() => {
    const checkServerStatus = async () => {
      const servers = Object.values(defaultMCPServers);
      const statusPromises = servers.map(async (server) => {
        const startTime = performance.now();
        try {
          const response = await fetch(`${server.baseUrl}/health`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            },
            cache: 'no-store'
          });

          const endTime = performance.now();
          const latency = Math.round(endTime - startTime);

          if (response.ok) {
            return {
              id: server.id,
              name: server.name.replace(' Server', ''),
              status: 'online' as const,
              latency
            };
          } else {
            return {
              id: server.id,
              name: server.name.replace(' Server', ''),
              status: 'error' as const,
              message: `HTTP ${response.status}: ${response.statusText}`,
              latency
            };
          }
        } catch (error) {
          console.error(`Error connecting to MCP server: ${server.id}`, error);
          
          return {
            id: server.id,
            name: server.name.replace(' Server', ''),
            status: 'error' as const,
            message: error instanceof Error ? error.message : String(error)
          };
        }
      });

      const statuses = await Promise.all(statusPromises);
      setServerStatuses(statuses);
    };

    checkServerStatus();
    const interval = setInterval(checkServerStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
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

  return (
    <div className={`rounded-lg border p-4 ${className}`}>
      <h2 className="text-lg font-semibold mb-4">MCP Server Status</h2>
      
      <div className="space-y-3">
        {serverStatuses.map((server) => (
          <div key={server.id} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(server.status)}`}></div>
              <span className="font-medium">{server.name}</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">
                {server.status === 'online' 
                  ? `${server.latency}ms` 
                  : server.status.charAt(0).toUpperCase() + server.status.slice(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
