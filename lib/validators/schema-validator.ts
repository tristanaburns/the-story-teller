/**
 * @file schema-validator.ts
 * @description JSON Schema validation utilities using Ajv
 * @module validators/SchemaValidator
 * @exports SchemaValidator class for JSON data validation
 */

import Ajv, { ErrorObject, ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { Logger } from '../logging/logger';

/**
 * Result of schema validation
 */
export interface ValidationResult {
  valid: boolean;
  errors?: ErrorObject[] | null;
  errorMessage?: string;
}

/**
 * Schema validator options
 */
export interface SchemaValidatorOptions {
  /**
   * Whether to use strict mode (default: true)
   */
  strict?: boolean;
  
  /**
   * Whether to allow additional properties not defined in schema (default: false)
   */
  allowAdditionalProperties?: boolean;
  
  /**
   * Whether to remove additional properties when validating (default: false)
   */
  removeAdditional?: boolean | 'all' | 'failing';
  
  /**
   * Whether to use default values from schema (default: true)
   */
  useDefaults?: boolean;
  
  /**
   * Whether to coerce types (default: true)
   */
  coerceTypes?: boolean;
}

/**
 * JSON Schema validator using Ajv
 */
export class SchemaValidator {
  private ajv: Ajv;
  private logger: Logger;
  private validators: Map<string, ValidateFunction> = new Map();
  private errorMessages: Map<string, string[]> = new Map();

  /**
   * Create a new SchemaValidator instance
   * @param options - Configuration options for the validator
   */
  constructor(options?: SchemaValidatorOptions) {
    this.logger = new Logger('SchemaValidator');
    
    // Default options
    const defaultOptions: SchemaValidatorOptions = {
      strict: true,
      allowAdditionalProperties: false,
      removeAdditional: false,
      useDefaults: true,
      coerceTypes: true,
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Initialize Ajv instance with options
    this.ajv = new Ajv({
      strict: mergedOptions.strict,
      removeAdditional: mergedOptions.removeAdditional,
      useDefaults: mergedOptions.useDefaults,
      coerceTypes: mergedOptions.coerceTypes,
      allErrors: true,
    });
    
    // Add formats like date, time, email, etc.
    addFormats(this.ajv);
    
    this.logger.debug('SchemaValidator initialized', { options: mergedOptions });
  }

  /**
   * Add a schema for validation
   * @param schema - JSON Schema to add
   * @param schemaId - Optional schema ID (if not provided, uses $id from schema)
   * @returns Boolean indicating success
   */
  addSchema(schema: object, schemaId?: string): boolean {
    try {
      const id = schemaId || (schema as any).$id;
      
      if (!id) {
        this.logger.error('Schema must have an ID property or provide a schemaId parameter');
        return false;
      }
      
      this.ajv.addSchema(schema, id);
      this.logger.debug('Schema added', { schemaId: id });
      return true;
    } catch (error) {
      this.logger.error('Failed to add schema', error);
      return false;
    }
  }

  /**
   * Remove a schema from the validator
   * @param schemaId - Schema ID to remove
   */
  removeSchema(schemaId: string): void {
    try {
      this.ajv.removeSchema(schemaId);
      this.validators.delete(schemaId);
      this.errorMessages.delete(schemaId);
      this.logger.debug('Schema removed', { schemaId });
    } catch (error) {
      this.logger.error('Failed to remove schema', error);
    }
  }

  /**
   * Validate data against a schema
   * @param schemaId - ID of the schema to validate against
   * @param data - Data to validate
   * @returns Validation result with details
   */
  validate(schemaId: string, data: unknown): ValidationResult {
    try {
      // Get or compile validator function
      let validate = this.validators.get(schemaId);
      
      if (!validate) {
        validate = this.ajv.getSchema(schemaId);
        
        if (!validate) {
          return {
            valid: false,
            errorMessage: `Schema with ID '${schemaId}' not found`
          };
        }
        
        this.validators.set(schemaId, validate);
      }
      
      // Perform validation
      const valid = validate(data) as boolean;
      
      if (!valid) {
        const errors = validate.errors;
        const errorMessages = this.formatErrors(errors);
        
        // Store error messages for later retrieval
        this.errorMessages.set(schemaId, errorMessages);
        
        this.logger.debug('Validation failed', { 
          schemaId, 
          errors, 
          data
        });
        
        return {
          valid: false,
          errors,
          errorMessage: errorMessages.join('; ')
        };
      }
      
      // Clear any stored error messages
      this.errorMessages.delete(schemaId);
      
      return { valid: true };
    } catch (error) {
      this.logger.error('Validation error', error);
      
      const errorMessage = error instanceof Error 
        ? `Validation error: ${error.message}` 
        : 'Unknown validation error';
      
      // Store error message
      this.errorMessages.set(schemaId, [errorMessage]);
      
      return {
        valid: false,
        errorMessage
      };
    }
  }

  /**
   * Format validation errors into an array of readable strings
   * @param errors - Validation errors from Ajv
   * @returns Array of formatted error messages
   */
  private formatErrors(errors: ErrorObject[] | null | undefined): string[] {
    if (!errors || errors.length === 0) {
      return ['Validation failed without specific errors'];
    }
    
    return errors.map(error => {
      const { instancePath, keyword, message, params } = error;
      const path = instancePath || 'input';
      
      switch (keyword) {
        case 'required':
          return `Missing required property: ${(params as any).missingProperty}`;
        
        case 'type':
          return `${path} should be ${params.type}`;
        
        case 'additionalProperties':
          return `Additional property not allowed: ${(params as any).additionalProperty}`;
        
        default:
          return `${path} ${message}`;
      }
    });
  }
  
  /**
   * Get error messages for the most recent validation
   * @param schemaId - Schema ID to get error messages for
   * @returns Array of error messages or null if no errors
   */
  getErrorMessages(schemaId: string): string[] | null {
    return this.errorMessages.get(schemaId) || null;
  }
  
  /**
   * Check if a schema exists in the validator
   * @param schemaId - Schema ID to check
   * @returns Boolean indicating if schema exists
   */
  hasSchema(schemaId: string): boolean {
    return this.ajv.getSchema(schemaId) !== undefined;
  }
  
  /**
   * Get the list of all registered schema IDs
   * @returns Array of schema IDs
   */
  getSchemaIds(): string[] {
    return Object.keys(this.ajv.schemas || {}).filter(id => id !== '');
  }
}

// Create and export default instance
export const schemaValidator = new SchemaValidator();
