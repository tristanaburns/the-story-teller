/**
 * @file validation-middleware.ts
 * @description API validation middleware for The Story Teller application
 * @module validators/ValidationMiddleware
 * @exports Functions for validating API requests against JSON schemas
 */

import { NextRequest, NextResponse } from 'next/server';
import { schemaValidator } from './schema-validator';
import { Logger } from '@/lib/logging/logger';

// Create a logger for validation middleware
const logger = new Logger('ValidationMiddleware');

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  data?: any;
  errors?: string[];
  response?: NextResponse;
}

/**
 * Create a consistent API response
 */
function createApiResponse<T = any>(
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
 * Validate request body against a schema
 * @param req - Next.js request object
 * @param schemaId - ID of the schema to validate against
 * @returns Validation result with data or error response
 */
export async function validateRequest(
  req: NextRequest, 
  schemaId: string
): Promise<ValidationResult> {
  try {
    // Parse request body as JSON
    const body = await req.json();
    
    // Validate against schema
    const isValid = schemaValidator.validate(schemaId, body);
    
    if (!isValid) {
      // Get validation errors
      const errors = schemaValidator.getErrorMessages(schemaId);
      
      logger.debug(`Request validation failed for schema ${schemaId}`, {
        errors,
        path: req.nextUrl.pathname
      });
      
      // Return error response
      return {
        valid: false,
        errors: errors || ['Invalid request data'],
        response: createApiResponse(
          { 
            message: 'Validation failed',
            errors: errors
          }, 
          400
        )
      };
    }
    
    // Return successful validation result with parsed data
    return {
      valid: true,
      data: body
    };
  } catch (error) {
    // Handle JSON parsing errors or other exceptions
    logger.error(`Request validation error for schema ${schemaId}`, {
      error,
      path: req.nextUrl.pathname
    });
    
    return {
      valid: false,
      errors: ['Invalid JSON format'],
      response: createApiResponse(
        { 
          message: 'Invalid request format',
          error: error instanceof Error ? error.message : 'Unknown error'
        }, 
        400
      )
    };
  }
}

/**
 * Validate query parameters against a schema
 * @param req - Next.js request object
 * @param schemaId - ID of the schema to validate against
 * @returns Validation result with data or error response
 */
export function validateQueryParams(
  req: NextRequest, 
  schemaId: string
): ValidationResult {
  try {
    // Convert URL search params to object
    const params: Record<string, any> = {};
    for (const [key, value] of req.nextUrl.searchParams.entries()) {
      params[key] = value;
    }
    
    // Validate against schema
    const isValid = schemaValidator.validate(schemaId, params);
    
    if (!isValid) {
      // Get validation errors
      const errors = schemaValidator.getErrorMessages(schemaId);
      
      logger.debug(`Query validation failed for schema ${schemaId}`, {
        errors,
        path: req.nextUrl.pathname
      });
      
      // Return error response
      return {
        valid: false,
        errors: errors || ['Invalid query parameters'],
        response: createApiResponse(
          { 
            message: 'Validation failed',
            errors: errors
          }, 
          400
        )
      };
    }
    
    // Return successful validation result with parsed data
    return {
      valid: true,
      data: params
    };
  } catch (error) {
    // Handle other exceptions
    logger.error(`Query validation error for schema ${schemaId}`, {
      error,
      path: req.nextUrl.pathname
    });
    
    return {
      valid: false,
      errors: ['Invalid query parameters'],
      response: createApiResponse(
        { 
          message: 'Invalid query parameters',
          error: error instanceof Error ? error.message : 'Unknown error'
        }, 
        400
      )
    };
  }
} 