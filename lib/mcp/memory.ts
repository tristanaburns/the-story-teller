/**
 * Memory MCP Client
 * 
 * Utilities for interacting with the Memory MCP server.
 */

import { sendMCPRequest } from './index';
import { 
  MemoryMCPRequest,
  MemoryMCPResponse,
  MemoryPayload,
  Memory
} from '../../types/mcp';

/**
 * Store a memory in the Memory MCP server
 */
export async function storeMemory(
  userId: string,
  payload: Omit<MemoryPayload, 'memoryId'>
): Promise<MemoryMCPResponse> {
  return sendMCPRequest<MemoryMCPRequest, MemoryMCPResponse>(
    'memory',
    {
      action: 'store',
      userId,
      payload
    }
  );
}

/**
 * Retrieve a specific memory by ID
 */
export async function retrieveMemory(
  userId: string,
  memoryId: string
): Promise<MemoryMCPResponse> {
  return sendMCPRequest<MemoryMCPRequest, MemoryMCPResponse>(
    'memory',
    {
      action: 'retrieve',
      userId,
      payload: {
        memoryId
      }
    }
  );
}

/**
 * Search for memories based on query, tags, and timeframe
 */
export async function searchMemories(
  userId: string,
  payload: {
    storyId?: string;
    contextId?: string;
    query?: string;
    tags?: string[];
    timeframe?: {
      start?: string;
      end?: string;
    };
  }
): Promise<MemoryMCPResponse> {
  return sendMCPRequest<MemoryMCPRequest, MemoryMCPResponse>(
    'memory',
    {
      action: 'search',
      userId,
      payload
    }
  );
}

/**
 * Consolidate related memories to create a summary
 */
export async function consolidateMemories(
  userId: string,
  payload: {
    storyId?: string;
    contextId?: string;
    memoryIds?: string[];
    query?: string;
  }
): Promise<MemoryMCPResponse> {
  return sendMCPRequest<MemoryMCPRequest, MemoryMCPResponse>(
    'memory',
    {
      action: 'consolidate',
      userId,
      payload
    }
  );
}

/**
 * Rank memories by importance
 */
export async function rankMemories(
  userId: string,
  payload: {
    storyId?: string;
    contextId?: string;
    memoryIds?: string[];
    query?: string;
  }
): Promise<MemoryMCPResponse> {
  return sendMCPRequest<MemoryMCPRequest, MemoryMCPResponse>(
    'memory',
    {
      action: 'rank',
      userId,
      payload
    }
  );
}

/**
 * Delete a memory
 */
export async function deleteMemory(
  userId: string,
  memoryId: string
): Promise<MemoryMCPResponse> {
  return sendMCPRequest<MemoryMCPRequest, MemoryMCPResponse>(
    'memory',
    {
      action: 'delete',
      userId,
      payload: {
        memoryId
      }
    }
  );
}
