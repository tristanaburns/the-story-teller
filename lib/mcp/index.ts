/**
 * MCP Client
 * 
 * Central utility for communicating with MCP servers.
 */

import { 
  MCPRequest, 
  MCPResponse, 
  MCPServerConfig,
  MCPServerRegistry
} from '../../types/mcp';

// Default MCP Server configurations
export const defaultMCPServers: MCPServerRegistry = {
  memory: {
    id: 'memory-mcp',
    name: 'Memory MCP Server',
    description: 'Provides memory storage and retrieval for narrative context',
    version: '1.0.0',
    baseUrl: process.env.MEMORY_MCP_URL || 'http://localhost:3001',
    endpoints: {
      store: '/store',
      retrieve: '/retrieve',
      search: '/search',
      consolidate: '/consolidate',
      rank: '/rank',
      delete: '/delete'
    },
    timeout: 10000,
    retryCount: 3,
    retryDelay: 1000
  },
  everart: {
    id: 'everart-mcp',
    name: 'Everart MCP Server',
    description: 'Generates and manages artwork for the narrative',
    version: '1.0.0',
    baseUrl: process.env.EVERART_MCP_URL || 'http://localhost:3002',
    endpoints: {
      generate: '/generate',
      edit: '/edit',
      search: '/search',
      delete: '/delete'
    },
    timeout: 30000, // Longer timeout for art generation
    retryCount: 2,
    retryDelay: 2000
  },
  thinking: {
    id: 'thinking-mcp',
    name: 'Sequential Thinking MCP Server',
    description: 'Provides step-by-step reasoning for narrative development',
    version: '1.0.0',
    baseUrl: process.env.THINKING_MCP_URL || 'http://localhost:3003',
    endpoints: {
      analyze: '/analyze',
      plan: '/plan',
      evaluate: '/evaluate',
      generate: '/generate'
    },
    timeout: 15000,
    retryCount: 3,
    retryDelay: 1000
  },
  database: {
    id: 'database-mcp',
    name: 'MongoDB Atlas MCP Server',
    description: 'Provides schema-aware database operations',
    version: '1.0.0',
    baseUrl: process.env.DATABASE_MCP_URL || 'http://localhost:3004',
    endpoints: {
      query: '/query',
      update: '/update',
      create: '/create',
      delete: '/delete',
      validate: '/validate'
    },
    timeout: 5000,
    retryCount: 3,
    retryDelay: 1000
  }
};

// Current MCP server configurations
let mcpServers: MCPServerRegistry = { ...defaultMCPServers };

/**
 * Configure MCP servers
 */
export function configureMCPServers(config: Partial<MCPServerRegistry>): void {
  mcpServers = {
    ...mcpServers,
    ...config
  };
}

/**
 * Get MCP server configuration
 */
export function getMCPServerConfig(serverId: keyof MCPServerRegistry): MCPServerConfig {
  const server = mcpServers[serverId];
  if (!server) {
    throw new Error(`Unknown MCP server "${String(serverId)}"`);
  }
  return server;
}

/**
 * Send request to MCP server
 */
export async function sendMCPRequest<T extends MCPRequest, R extends MCPResponse>(
  serverId: keyof MCPServerRegistry,
  request: Omit<T, 'serverId' | 'requestId' | 'timestamp'>
): Promise<R> {
  const server = getMCPServerConfig(serverId);
  const endpoint = server.endpoints[request.action];

  if (!endpoint) {
    throw new Error(`Unknown action "${request.action}" for server "${String(serverId)}"`);
  }

  const url = `${server.baseUrl}${endpoint}`;
  const requestId = generateRequestId();
  
  const fullRequest: MCPRequest = {
    ...request,
    serverId: server.id,
    requestId,
    timestamp: Date.now()
  };

  // Configure fetch options with retry logic
  const fetchWithRetry = async (attempt = 0): Promise<R> => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': server.apiKey ? `Bearer ${server.apiKey}` : '',
          'X-Request-ID': requestId
        },
        body: JSON.stringify(fullRequest),
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          `MCP server returned ${response.status}: ${response.statusText}` +
          (errorData ? ` - ${JSON.stringify(errorData)}` : '')
        );
      }

      return await response.json() as R;
    } catch (error) {
      if (attempt < server.retryCount) {
        // Wait for the specified delay before retrying
        await new Promise(resolve => setTimeout(resolve, server.retryDelay));
        return fetchWithRetry(attempt + 1);
      }
      
      // Retry exhausted, return error
      console.error(`Failed to communicate with MCP server after ${server.retryCount} attempts: ${error instanceof Error ? error.message : String(error)}`);
      
      // Return a properly typed error response
      const errorResponse = {
        serverId: server.id,
        action: request.action,
        payload: null,
        status: 'error' as const,
        data: null,
        error: `Failed to communicate with MCP server after ${server.retryCount} attempts: ${error instanceof Error ? error.message : String(error)}`,
        requestId,
        responseId: generateRequestId(),
        timestamp: Date.now()
      };
      
      // Type cast through unknown to ensure compatibility
      return errorResponse as unknown as R;
    }
  };

  // Set up timeout
  const timeoutPromise = new Promise<R>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request to MCP server "${String(serverId)}" timed out after ${server.timeout}ms`));
    }, server.timeout);
  });

  // Race between the fetch with retry and the timeout
  return Promise.race([
    fetchWithRetry(),
    timeoutPromise
  ]);
}

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}
