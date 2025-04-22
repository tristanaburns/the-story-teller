/**
 * @file passage-validator.ts
 * @description Validator for passage content and metadata
 * @module validators/PassageValidator
 * @exports Functions for validating passages in The Story Teller
 */

import { NextRequest, NextResponse } from 'next/server';
import { schemaValidator } from './schema-validator';
import { Logger } from '../logging/logger';

// Create a logger for the passage validator
const logger = new Logger('PassageValidator');

// Schema IDs for passage validation
const PASSAGE_SCHEMA_ID = 'https://storyteller.app/schemas/passage';

/**
 * Passage validation result interface
 */
export interface PassageValidationResult {
  valid: boolean;
  content?: {
    valid: boolean;
    errors?: string[];
  };
  metadata?: {
    valid: boolean;
    errors?: string[];
  };
  errors?: string[];
  errorResponse?: NextResponse;
}

/**
 * Passage data structure
 */
export interface PassageData {
  id?: string;
  storyId: string;
  title?: string;
  content: string;
  metadata: {
    status: 'concept' | 'draft' | 'final';
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Create an API error response
 */
function createErrorResponse(message: string, errors?: string[], status: number = 400): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        errors
      },
      timestamp: new Date().toISOString()
    },
    { status }
  );
}

/**
 * Validate a passage against the schema
 * @param passage - Passage data to validate
 * @returns Validation result
 */
export function validatePassage(passage: PassageData): PassageValidationResult {
  try {
    logger.debug('Validating passage', { 
      passageId: passage.id, 
      storyId: passage.storyId
    });
    
    // Ensure we have the minimum required fields
    if (!passage.storyId) {
      logger.warn('Passage validation failed: Missing storyId');
      return {
        valid: false,
        errors: ['Missing required field: storyId']
      };
    }
    
    if (!passage.content) {
      logger.warn('Passage validation failed: Missing content');
      return {
        valid: false,
        errors: ['Missing required field: content']
      };
    }
    
    if (!passage.metadata || !passage.metadata.status) {
      logger.warn('Passage validation failed: Missing metadata.status');
      return {
        valid: false,
        errors: ['Missing required field: metadata.status']
      };
    }
    
    // Validate against schema
    const validationResult = schemaValidator.validate(PASSAGE_SCHEMA_ID, passage);
    
    if (!validationResult.valid) {
      logger.warn('Passage schema validation failed', {
        errors: validationResult.errors,
        passageId: passage.id,
        storyId: passage.storyId
      });
      
      return {
        valid: false,
        errors: schemaValidator.getErrorMessages(PASSAGE_SCHEMA_ID) || 
          [validationResult.errorMessage || 'Passage validation failed'],
        errorResponse: createErrorResponse(
          'Passage validation failed',
          schemaValidator.getErrorMessages(PASSAGE_SCHEMA_ID)
        )
      };
    }
    
    logger.debug('Passage validation succeeded', {
      passageId: passage.id,
      storyId: passage.storyId
    });
    
    return { valid: true };
  } catch (error) {
    logger.error('Passage validation error', error);
    
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : 'Unknown validation error'],
      errorResponse: createErrorResponse(
        'Passage validation error',
        [error instanceof Error ? error.message : 'Unknown validation error']
      )
    };
  }
}

/**
 * Validate a passage from a request
 * @param req - Next.js request object
 * @returns Validation result with passage data or error response
 */
export async function validatePassageRequest(req: NextRequest): Promise<PassageValidationResult & { passage?: PassageData }> {
  try {
    // Parse request body
    const body = await req.json();
    
    // Validate passage
    const validationResult = validatePassage(body);
    
    // Return result with passage data if valid
    if (validationResult.valid) {
      return {
        ...validationResult,
        passage: body as PassageData
      };
    }
    
    return validationResult;
  } catch (error) {
    logger.error('Failed to validate passage request', error);
    
    return {
      valid: false,
      errors: ['Invalid request format'],
      errorResponse: createErrorResponse(
        'Invalid request format',
        [error instanceof Error ? error.message : 'Unknown error']
      )
    };
  }
}

/**
 * Validate AI-generated passage content
 * @param content - Passage content to validate
 * @param metadata - Passage metadata to validate
 * @returns Validation result
 */
export function validateAIGeneratedPassage(
  content: string,
  metadata: any
): PassageValidationResult {
  try {
    logger.debug('Validating AI-generated passage');
    
    const errors: string[] = [];
    let contentValid = true;
    let metadataValid = true;
    
    // Validate content
    if (!content || content.trim().length === 0) {
      contentValid = false;
      errors.push('AI-generated content is empty or missing');
    }
    
    // Validate metadata
    if (!metadata) {
      metadataValid = false;
      errors.push('AI-generated metadata is missing');
    } else if (!metadata.status) {
      metadataValid = false;
      errors.push('AI-generated metadata is missing required field: status');
    }
    
    // Check content length
    if (content && content.length > 50000) {
      contentValid = false;
      errors.push('AI-generated content exceeds maximum length (50,000 characters)');
    }
    
    // Check for valid metadata.status
    if (metadata && metadata.status && !['concept', 'draft', 'final'].includes(metadata.status)) {
      metadataValid = false;
      errors.push(`Invalid metadata.status: ${metadata.status}. Must be one of: concept, draft, final`);
    }
    
    const valid = contentValid && metadataValid;
    
    if (!valid) {
      logger.warn('AI-generated passage validation failed', { errors });
      
      return {
        valid,
        content: { valid: contentValid, errors: contentValid ? undefined : errors.filter(e => e.includes('content')) },
        metadata: { valid: metadataValid, errors: metadataValid ? undefined : errors.filter(e => e.includes('metadata')) },
        errors,
        errorResponse: createErrorResponse('AI-generated passage validation failed', errors)
      };
    }
    
    logger.debug('AI-generated passage validation succeeded');
    
    return {
      valid: true,
      content: { valid: true },
      metadata: { valid: true }
    };
  } catch (error) {
    logger.error('AI-generated passage validation error', error);
    
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : 'Unknown validation error'],
      errorResponse: createErrorResponse(
        'AI-generated passage validation error',
        [error instanceof Error ? error.message : 'Unknown validation error']
      )
    };
  }
}
