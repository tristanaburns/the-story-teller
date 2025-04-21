/**
 * MongoDB Atlas MCP Client
 * 
 * Utilities for interacting with the MongoDB Atlas MCP server.
 */

import { sendMCPRequest } from './index';
import {
  DatabaseMCPRequest,
  DatabaseMCPResponse,
  DatabasePayload
} from '../../types/mcp';

/**
 * Query documents from MongoDB
 */
export async function queryDocuments(
  userId: string,
  payload: {
    storyId: string;
    collection: string;
    filter?: Record<string, any>;
    projection?: Record<string, any>;
    options?: Record<string, any>;
  }
): Promise<DatabaseMCPResponse> {
  return sendMCPRequest<DatabaseMCPRequest, DatabaseMCPResponse>(
    'database' as 'database',
    {
      action: 'query',
      userId,
      payload
    }
  );
}

/**
 * Update documents in MongoDB
 */
export async function updateDocuments(
  userId: string,
  payload: {
    storyId: string;
    collection: string;
    filter: Record<string, any>;
    update: Record<string, any>;
    options?: Record<string, any>;
  }
): Promise<DatabaseMCPResponse> {
  return sendMCPRequest<DatabaseMCPRequest, DatabaseMCPResponse>(
    'database' as 'database',
    {
      action: 'update',
      userId,
      payload
    }
  );
}

/**
 * Create a document in MongoDB
 */
export async function createDocument(
  userId: string,
  payload: {
    storyId: string;
    collection: string;
    document: Record<string, any>;
  }
): Promise<DatabaseMCPResponse> {
  return sendMCPRequest<DatabaseMCPRequest, DatabaseMCPResponse>(
    'database' as 'database',
    {
      action: 'create',
      userId,
      payload
    }
  );
}

/**
 * Delete documents from MongoDB
 */
export async function deleteDocuments(
  userId: string,
  payload: {
    storyId: string;
    collection: string;
    filter: Record<string, any>;
    options?: Record<string, any>;
  }
): Promise<DatabaseMCPResponse> {
  return sendMCPRequest<DatabaseMCPRequest, DatabaseMCPResponse>(
    'database' as 'database',
    {
      action: 'delete',
      userId,
      payload
    }
  );
}

/**
 * Validate a document against a schema
 */
export async function validateDocument(
  userId: string,
  payload: {
    collection: string;
    document: Record<string, any>;
    schema?: Record<string, any>;
  }
): Promise<DatabaseMCPResponse> {
  return sendMCPRequest<DatabaseMCPRequest, DatabaseMCPResponse>(
    'database' as 'database',
    {
      action: 'validate',
      userId,
      payload
    }
  );
}
