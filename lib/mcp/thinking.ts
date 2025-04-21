/**
 * Sequential Thinking MCP Client
 * 
 * Utilities for interacting with the Sequential Thinking MCP server.
 */

import { sendMCPRequest } from './index';
import {
  ThinkingMCPRequest,
  ThinkingMCPResponse,
  ThinkingPayload
} from '../../types/mcp';

/**
 * Analyze narrative content using step-by-step reasoning
 */
export async function analyzeContent(
  userId: string,
  payload: Omit<ThinkingPayload, 'reasoning'>
): Promise<ThinkingMCPResponse> {
  return sendMCPRequest<ThinkingMCPRequest, ThinkingMCPResponse>(
    'thinking' as 'thinking',
    {
      action: 'analyze',
      userId,
      payload
    }
  );
}

/**
 * Create a structured plan for a narrative element
 */
export async function createPlan(
  userId: string,
  payload: Omit<ThinkingPayload, 'reasoning'>
): Promise<ThinkingMCPResponse> {
  return sendMCPRequest<ThinkingMCPRequest, ThinkingMCPResponse>(
    'thinking' as 'thinking',
    {
      action: 'plan',
      userId,
      payload
    }
  );
}

/**
 * Evaluate narrative content for consistency and quality
 */
export async function evaluateContent(
  userId: string,
  payload: ThinkingPayload
): Promise<ThinkingMCPResponse> {
  return sendMCPRequest<ThinkingMCPRequest, ThinkingMCPResponse>(
    'thinking' as 'thinking',
    {
      action: 'evaluate',
      userId,
      payload
    }
  );
}

/**
 * Generate content using sequential thinking process
 */
export async function generateContent(
  userId: string,
  payload: Omit<ThinkingPayload, 'reasoning'>
): Promise<ThinkingMCPResponse> {
  return sendMCPRequest<ThinkingMCPRequest, ThinkingMCPResponse>(
    'thinking' as 'thinking',
    {
      action: 'generate',
      userId,
      payload
    }
  );
}
