/**
 * API Helper Utilities
 * 
 * Common utilities for API endpoints to ensure consistent responses,
 * error handling, validation, and rate limiting.
 */

import { NextResponse } from 'next/server';

/**
 * Rate limiting state
 */
interface RateLimitState {
  requests: number;
  timestamp: number;
}

/**
 * Creates a consistent API response
 */
export function createApiResponse<T = any>(
  data: T | null, 
  status: number = 200, 
  headers: Record<string, string> = {}
): NextResponse {
  // Standard success response
  if (status >= 200 && status < 300) {
    return NextResponse.json(
      data ? { success: true, data } : { success: true },
      { 
        status,
        headers 
      }
    );
  }
  
  // Error response
  return NextResponse.json(
    {
      success: false,
      error: data,
      timestamp: new Date().toISOString()
    },
    { 
      status,
      headers 
    }
  );
}

/**
 * Check if a request is rate limited
 */
export function isRateLimited(
  identifier: string,
  rateLimitMap: Map<string, RateLimitState>,
  maxRequests: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const state = rateLimitMap.get(identifier) || { requests: 0, timestamp: now };
  
  // Reset if outside window
  if (now - state.timestamp > windowMs) {
    state.requests = 1;
    state.timestamp = now;
    rateLimitMap.set(identifier, state);
    return false;
  }
  
  // Increment request count
  state.requests++;
  rateLimitMap.set(identifier, state);
  
  // Check if rate limited
  return state.requests > maxRequests;
}

/**
 * Validate client log request
 */
export function validateLogRequest(data: unknown): boolean {
  // Must be an array
  if (!Array.isArray(data)) {
    return false;
  }
  
  // Empty array is valid
  if (data.length === 0) {
    return true;
  }
  
  // Check first few items to ensure they look like log entries
  // Without being too restrictive
  const sampleSize = Math.min(data.length, 3);
  for (let i = 0; i < sampleSize; i++) {
    const item = data[i];
    if (!item || typeof item !== 'object') {
      return false;
    }
    
    // Should have at least a message or level property
    if (!('message' in item) && !('level' in item)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Format error for API response
 */
export function formatError(error: unknown): Record<string, any> {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
  }
  
  return {
    message: String(error)
  };
} 