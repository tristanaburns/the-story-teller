/**
 * Everart MCP Client
 * 
 * Utilities for interacting with the Everart MCP server for artwork generation.
 */

import { sendMCPRequest } from './index';
import {
  EverartMCPRequest,
  EverartMCPResponse,
  ArtPayload
} from '../../types/mcp';

/**
 * Generate artwork using the Everart MCP server
 */
export async function generateArtwork(
  userId: string,
  payload: Omit<ArtPayload, 'artId'>
): Promise<EverartMCPResponse> {
  return sendMCPRequest<EverartMCPRequest, EverartMCPResponse>(
    'everart' as 'everart',
    {
      action: 'generate',
      userId,
      payload
    }
  );
}

/**
 * Edit existing artwork
 */
export async function editArtwork(
  userId: string,
  artId: string,
  payload: Partial<ArtPayload>
): Promise<EverartMCPResponse> {
  return sendMCPRequest<EverartMCPRequest, EverartMCPResponse>(
    'everart' as 'everart',
    {
      action: 'edit',
      userId,
      payload: {
        artId,
        ...payload
      }
    }
  );
}

/**
 * Search for artwork based on query, type, and metadata
 */
export async function searchArtwork(
  userId: string,
  payload: {
    storyId?: string;
    artType?: 'character' | 'location' | 'scene' | 'item';
    query?: string;
    metadata?: Record<string, any>;
  }
): Promise<EverartMCPResponse> {
  return sendMCPRequest<EverartMCPRequest, EverartMCPResponse>(
    'everart' as 'everart',
    {
      action: 'search',
      userId,
      payload
    }
  );
}

/**
 * Delete artwork
 */
export async function deleteArtwork(
  userId: string,
  artId: string
): Promise<EverartMCPResponse> {
  return sendMCPRequest<EverartMCPRequest, EverartMCPResponse>(
    'everart' as 'everart',
    {
      action: 'delete',
      userId,
      payload: {
        artId
      }
    }
  );
}
