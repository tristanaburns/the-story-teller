/**
 * MCP Server Management Page
 * 
 * Provides interface for managing and monitoring MCP servers.
 */

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import MCPServerStatus from '@/components/mcp/MCPServerStatus';
import MCPServerConfig from '@/components/mcp/MCPServerConfig';

export const metadata = {
  title: 'MCP Server Management - The Story Teller',
  description: 'Manage and monitor Model Context Protocol (MCP) servers'
};

export default async function MCPServerPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/auth/signin');
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">MCP Server Management</h1>
      
      <div className="mb-8">
        <p className="text-gray-700">
          Model Context Protocol (MCP) servers provide specialized AI functionality to enhance
          your storytelling experience. These servers handle memory management, artwork generation,
          sequential thinking, and database operations.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">MCP Server Configuration</h2>
            <MCPServerConfig />
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">MCP Server Status</h2>
            <MCPServerStatus />
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">MCP Integration Help</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Memory MCP</h3>
                <p className="text-sm text-gray-600">
                  Provides context storage and retrieval for maintaining narrative continuity.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">Everart MCP</h3>
                <p className="text-sm text-gray-600">
                  Generates and manages artwork for your narrative elements.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">Sequential Thinking MCP</h3>
                <p className="text-sm text-gray-600">
                  Provides step-by-step reasoning for plot development and character analysis.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">MongoDB Atlas MCP</h3>
                <p className="text-sm text-gray-600">
                  Provides schema-aware database operations for narrative data.
                </p>
              </div>
              
              <div className="pt-2">
                <a
                  href="/documentation/mcp-integration"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View MCP Integration Documentation →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
