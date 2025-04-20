/**
 * API Route: /api/mcp/memory
 *
 * Handles memory-related operations for the MCP (Model Control Protocol)
 * including store, retrieve, update, delete, and search operations.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BaseMCPRequest, BaseMCPResponse, MemoryAction, MemoryPayload, MemoryResponsePayload } from '@/types/mcp';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST handler for memory operations
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate the user session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate the request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.serverId || !body.action) {
      return NextResponse.json(
        { error: 'Missing required fields: serverId and action are required' },
        { status: 400 }
      );
    }

    // Generate requestId and timestamp if not provided
    const requestId = body.requestId || uuidv4();
    const timestamp = body.timestamp || Date.now();

    // Build the MCP request
    const mcpRequest: BaseMCPRequest<MemoryPayload> = {
      serverId: body.serverId,
      action: body.action,
      payload: body.payload || {},
      requestId,
      timestamp
    };

    // Route to the appropriate handler based on the action
    switch (mcpRequest.action as MemoryAction) {
      case 'store_memory':
        return handleStoreMemory(mcpRequest);
      case 'retrieve_memory':
        return handleRetrieveMemory(mcpRequest);
      case 'update_memory':
        return handleUpdateMemory(mcpRequest);
      case 'delete_memory':
        return handleDeleteMemory(mcpRequest);
      case 'search_memory':
        return handleSearchMemory(mcpRequest);
      default:
        return NextResponse.json(
          { error: `Unsupported action: ${mcpRequest.action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing memory request:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * Handle storing a new memory entry
 */
async function handleStoreMemory(request: BaseMCPRequest<MemoryPayload>) {
  try {
    // Validate required payload data
    if (!request.payload.content) {
      return NextResponse.json(
        { error: 'Missing required field: content is required for store_memory' },
        { status: 400 }
      );
    }

    // Prepare MCP server request
    const serverUrl = process.env.MCP_MEMORY_SERVER_URL;
    if (!serverUrl) {
      console.error('MCP_MEMORY_SERVER_URL not defined in environment variables');
      return NextResponse.json(
        { error: 'Memory service configuration missing' },
        { status: 500 }
      );
    }

    // Make the request to the MCP server
    const response = await fetch(`${serverUrl}/memory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MCP_API_KEY || ''}`
      },
      body: JSON.stringify(request)
    });

    // Check if the request was successful
    if (!response.ok) {
      const errorData = await response.json();
      console.error('MCP server error:', errorData);
      return NextResponse.json(
        { error: 'Memory server error', details: errorData },
        { status: response.status }
      );
    }

    // Parse the response
    const mcpResponse: BaseMCPResponse<MemoryResponsePayload> = await response.json();
    
    // Return the success response
    return NextResponse.json({
      status: 'success',
      memory_id: mcpResponse.payload.memory_id,
      message: 'Memory stored successfully'
    });

  } catch (error) {
    console.error('Error storing memory:', error);
    return NextResponse.json(
      { error: 'Failed to store memory', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * Handle retrieving a memory entry by ID
 */
async function handleRetrieveMemory(request: BaseMCPRequest<MemoryPayload>) {
  try {
    // Validate required payload data
    if (!request.payload.memory_id) {
      return NextResponse.json(
        { error: 'Missing required field: memory_id is required for retrieve_memory' },
        { status: 400 }
      );
    }

    // Prepare MCP server request
    const serverUrl = process.env.MCP_MEMORY_SERVER_URL;
    if (!serverUrl) {
      console.error('MCP_MEMORY_SERVER_URL not defined in environment variables');
      return NextResponse.json(
        { error: 'Memory service configuration missing' },
        { status: 500 }
      );
    }

    // Make the request to the MCP server
    const response = await fetch(`${serverUrl}/memory/${request.payload.memory_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.MCP_API_KEY || ''}`
      }
    });

    // Check if the request was successful
    if (!response.ok) {
      const errorData = await response.json();
      console.error('MCP server error:', errorData);
      return NextResponse.json(
        { error: 'Memory server error', details: errorData },
        { status: response.status }
      );
    }

    // Parse the response
    const mcpResponse: BaseMCPResponse<MemoryResponsePayload> = await response.json();
    
    // Return the success response
    return NextResponse.json({
      status: 'success',
      memory: {
        id: mcpResponse.payload.memory_id,
        content: mcpResponse.payload.content,
        importance: mcpResponse.payload.importance,
        tags: mcpResponse.payload.tags,
        metadata: mcpResponse.payload.metadata,
        contextId: mcpResponse.payload.contextId
      }
    });

  } catch (error) {
    console.error('Error retrieving memory:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve memory', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * Handle updating an existing memory entry
 */
async function handleUpdateMemory(request: BaseMCPRequest<MemoryPayload>) {
  try {
    // Validate required payload data
    if (!request.payload.memory_id) {
      return NextResponse.json(
        { error: 'Missing required field: memory_id is required for update_memory' },
        { status: 400 }
      );
    }

    // Prepare MCP server request
    const serverUrl = process.env.MCP_MEMORY_SERVER_URL;
    if (!serverUrl) {
      console.error('MCP_MEMORY_SERVER_URL not defined in environment variables');
      return NextResponse.json(
        { error: 'Memory service configuration missing' },
        { status: 500 }
      );
    }

    // Make the request to the MCP server
    const response = await fetch(`${serverUrl}/memory/${request.payload.memory_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MCP_API_KEY || ''}`
      },
      body: JSON.stringify(request)
    });

    // Check if the request was successful
    if (!response.ok) {
      const errorData = await response.json();
      console.error('MCP server error:', errorData);
      return NextResponse.json(
        { error: 'Memory server error', details: errorData },
        { status: response.status }
      );
    }

    // Parse the response
    const mcpResponse: BaseMCPResponse<MemoryResponsePayload> = await response.json();
    
    // Return the success response
    return NextResponse.json({
      status: 'success',
      memory_id: mcpResponse.payload.memory_id,
      message: 'Memory updated successfully'
    });

  } catch (error) {
    console.error('Error updating memory:', error);
    return NextResponse.json(
      { error: 'Failed to update memory', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * Handle deleting a memory entry
 */
async function handleDeleteMemory(request: BaseMCPRequest<MemoryPayload>) {
  try {
    // Validate required payload data
    if (!request.payload.memory_id) {
      return NextResponse.json(
        { error: 'Missing required field: memory_id is required for delete_memory' },
        { status: 400 }
      );
    }

    // Prepare MCP server request
    const serverUrl = process.env.MCP_MEMORY_SERVER_URL;
    if (!serverUrl) {
      console.error('MCP_MEMORY_SERVER_URL not defined in environment variables');
      return NextResponse.json(
        { error: 'Memory service configuration missing' },
        { status: 500 }
      );
    }

    // Make the request to the MCP server
    const response = await fetch(`${serverUrl}/memory/${request.payload.memory_id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${process.env.MCP_API_KEY || ''}`
      }
    });

    // Check if the request was successful
    if (!response.ok) {
      const errorData = await response.json();
      console.error('MCP server error:', errorData);
      return NextResponse.json(
        { error: 'Memory server error', details: errorData },
        { status: response.status }
      );
    }
    
    // Return the success response
    return NextResponse.json({
      status: 'success',
      message: 'Memory deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting memory:', error);
    return NextResponse.json(
      { error: 'Failed to delete memory', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * Handle searching for memory entries
 */
async function handleSearchMemory(request: BaseMCPRequest<MemoryPayload>) {
  try {
    // Validate that either criteria or query is provided
    if (!request.payload.criteria && !request.payload.query) {
      return NextResponse.json(
        { error: 'Either criteria or query must be provided for search_memory' },
        { status: 400 }
      );
    }

    // Prepare MCP server request
    const serverUrl = process.env.MCP_MEMORY_SERVER_URL;
    if (!serverUrl) {
      console.error('MCP_MEMORY_SERVER_URL not defined in environment variables');
      return NextResponse.json(
        { error: 'Memory service configuration missing' },
        { status: 500 }
      );
    }

    // Define the search params
    const searchParams = new URLSearchParams();
    if (request.payload.query) {
      searchParams.append('query', request.payload.query);
    }
    if (request.payload.limit) {
      searchParams.append('limit', request.payload.limit.toString());
    }
    if (request.payload.offset) {
      searchParams.append('offset', request.payload.offset.toString());
    }

    // Make the request to the MCP server
    const response = await fetch(`${serverUrl}/memory/search?${searchParams.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MCP_API_KEY || ''}`
      },
      body: JSON.stringify({
        ...request,
        payload: { criteria: request.payload.criteria }
      })
    });

    // Check if the request was successful
    if (!response.ok) {
      const errorData = await response.json();
      console.error('MCP server error:', errorData);
      return NextResponse.json(
        { error: 'Memory server error', details: errorData },
        { status: response.status }
      );
    }

    // Parse the response
    const mcpResponse: BaseMCPResponse<MemoryResponsePayload> = await response.json();
    
    // Return the success response
    return NextResponse.json({
      status: 'success',
      memories: mcpResponse.payload.memories,
      total: mcpResponse.payload.total
    });

  } catch (error) {
    console.error('Error searching memories:', error);
    return NextResponse.json(
      { error: 'Failed to search memories', details: (error as Error).message },
      { status: 500 }
    );
  }
}
