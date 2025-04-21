/**
 * Memory MCP Utility
 * 
 * Functions for interacting with the Memory MCP Service.
 */
import { 
  MemoryMCPRequest,
  MemoryMCPResponse,
  Memory,
  MemoryCriteria
} from '../../types/mcp';
import { sendMCPRequest } from './index';

/**
 * Store a new memory
 */
export async function storeMemory(
  content: string,
  contextId: string,
  importance: number = 1,
  tags: string[] = [],
  metadata: Record<string, string | number | boolean> = {}
): Promise<MemoryMCPResponse> {
  return sendMCPRequest<MemoryMCPRequest, MemoryMCPResponse>(
    'memory' as 'memory', // Type assertion to match keyof MCPServerRegistry
    {
      action: 'store_memory',
      payload: {
        content,
        importance,
        tags,
        metadata,
        contextId
      }
    }
  );
}

/**
 * Retrieve a specific memory by ID
 */
export async function retrieveMemory(
  memoryId: string
): Promise<MemoryMCPResponse> {
  return sendMCPRequest<MemoryMCPRequest, MemoryMCPResponse>(
    'memory' as 'memory', // Type assertion to match keyof MCPServerRegistry
    {
      action: 'retrieve_memory',
      payload: {
        memory_id: memoryId
      }
    }
  );
}

/**
 * Search for memories based on criteria
 */
export async function searchMemories(
  criteria: MemoryCriteria,
  limit: number = 10,
  offset: number = 0
): Promise<MemoryMCPResponse> {
  return sendMCPRequest<MemoryMCPRequest, MemoryMCPResponse>(
    'memory' as 'memory', // Type assertion to match keyof MCPServerRegistry
    {
      action: 'search_memory',
      payload: {
        criteria,
        limit,
        offset
      }
    }
  );
}

/**
 * Update an existing memory
 */
export async function updateMemory(
  memoryId: string,
  updates: Partial<Memory>
): Promise<MemoryMCPResponse> {
  return sendMCPRequest<MemoryMCPRequest, MemoryMCPResponse>(
    'memory' as 'memory', // Type assertion to match keyof MCPServerRegistry
    {
      action: 'update_memory',
      payload: {
        memory_id: memoryId,
        ...updates
      }
    }
  );
}

/**
 * Delete a memory
 */
export async function deleteMemory(
  memoryId: string
): Promise<MemoryMCPResponse> {
  return sendMCPRequest<MemoryMCPRequest, MemoryMCPResponse>(
    'memory' as 'memory', // Type assertion to match keyof MCPServerRegistry
    {
      action: 'delete_memory',
      payload: {
        memory_id: memoryId
      }
    }
  );
}

/**
 * Consolidate memories into a summary
 */
export async function consolidateMemories(
  contextId: string,
  tags?: string[]
): Promise<MemoryMCPResponse> {
  return sendMCPRequest<MemoryMCPRequest, MemoryMCPResponse>(
    'memory' as 'memory', // Type assertion to match keyof MCPServerRegistry
    {
      action: 'consolidate_memory',
      payload: {
        contextId,
        tags
      }
    }
  );
}
