/**
 * @file schema-registry.ts
 * @description Registry for managing JSON schemas with support for validation and references
 * @module schemas/SchemaRegistry
 * @exports SchemaRegistry class for managing application schemas
 */

import { Logger } from '../logging/logger';
import { schemaValidator, ValidationResult } from '../validators/schema-validator';
import path from 'path';
import fs from 'fs';

/**
 * Schema metadata interface
 */
export interface SchemaInfo {
  id: string;
  name: string;
  version: string;
  description: string;
  filePath?: string;
  lastUpdated: Date;
}

/**
 * Schema registry options
 */
export interface SchemaRegistryOptions {
  /**
   * Auto-load schemas from specified directory (default: false)
   */
  autoLoadSchemas?: boolean;
  
  /**
   * Directory containing schema files (required if autoLoadSchemas is true)
   */
  schemasDirectory?: string;
  
  /**
   * File extension for schema files (default: .schema.json)
   */
  schemaFileExtension?: string;
}

/**
 * Registry for managing JSON schemas
 */
export class SchemaRegistry {
  private logger: Logger;
  private schemas: Map<string, SchemaInfo>;
  private options: SchemaRegistryOptions;
  
  /**
   * Create a new SchemaRegistry instance
   * @param options - Configuration options
   */
  constructor(options?: SchemaRegistryOptions) {
    this.logger = new Logger('SchemaRegistry');
    this.schemas = new Map();
    
    this.options = {
      autoLoadSchemas: false,
      schemaFileExtension: '.schema.json',
      ...options
    };
    
    this.logger.debug('SchemaRegistry initialized', { options: this.options });
    
    // Auto-load schemas if enabled
    if (this.options.autoLoadSchemas && this.options.schemasDirectory) {
      this.loadSchemasFromDirectory(this.options.schemasDirectory);
    }
  }

  /**
   * Register a schema with the registry
   * @param schema - JSON Schema to register
   * @param metadata - Additional schema metadata
   * @returns Boolean indicating success
   */
  registerSchema(
    schema: object,
    metadata?: Partial<SchemaInfo>
  ): boolean {
    try {
      // Extract schema ID
      const schemaId = (schema as any).$id;
      
      if (!schemaId) {
        this.logger.error('Schema must have an $id property');
        return false;
      }
      
      // Create schema info
      const schemaInfo: SchemaInfo = {
        id: schemaId,
        name: metadata?.name || schemaId.split('/').pop() || schemaId,
        version: metadata?.version || '1.0.0',
        description: metadata?.description || '',
        filePath: metadata?.filePath,
        lastUpdated: new Date(),
      };
      
      // Add schema to validator
      const success = schemaValidator.addSchema(schema);
      
      if (!success) {
        return false;
      }
      
      // Store schema info
      this.schemas.set(schemaId, schemaInfo);
      
      this.logger.info('Schema registered', { 
        schemaId,
        name: schemaInfo.name,
        version: schemaInfo.version 
      });
      
      return true;
    } catch (error) {
      this.logger.error('Failed to register schema', error);
      return false;
    }
  }

  /**
   * Unregister a schema from the registry
   * @param schemaId - ID of the schema to unregister
   * @returns Boolean indicating success
   */
  unregisterSchema(schemaId: string): boolean {
    try {
      if (!this.schemas.has(schemaId)) {
        this.logger.warn('Schema not found in registry', { schemaId });
        return false;
      }
      
      // Remove from validator
      schemaValidator.removeSchema(schemaId);
      
      // Remove from registry
      this.schemas.delete(schemaId);
      
      this.logger.info('Schema unregistered', { schemaId });
      return true;
    } catch (error) {
      this.logger.error('Failed to unregister schema', error);
      return false;
    }
  }

  /**
   * Validate data against a registered schema
   * @param schemaId - ID of the schema to validate against
   * @param data - Data to validate
   * @returns Validation result
   */
  validate(schemaId: string, data: unknown): ValidationResult {
    if (!this.hasSchema(schemaId)) {
      this.logger.warn('Schema not found in registry', { schemaId });
      return {
        valid: false,
        errorMessage: `Schema not found: ${schemaId}`
      };
    }
    
    return schemaValidator.validate(schemaId, data);
  }

  /**
   * Check if a schema is registered
   * @param schemaId - Schema ID to check
   * @returns Boolean indicating if schema is registered
   */
  hasSchema(schemaId: string): boolean {
    return this.schemas.has(schemaId);
  }

  /**
   * Get schema info by ID
   * @param schemaId - Schema ID
   * @returns Schema info or undefined if not found
   */
  getSchemaInfo(schemaId: string): SchemaInfo | undefined {
    return this.schemas.get(schemaId);
  }

  /**
   * Get all registered schemas info
   * @returns Array of schema info objects
   */
  getAllSchemas(): SchemaInfo[] {
    return Array.from(this.schemas.values());
  }

  /**
   * Load schemas from directory
   * @param directory - Directory path containing schema files
   * @returns Number of schemas loaded
   */
  loadSchemasFromDirectory(directory: string): number {
    try {
      if (!fs.existsSync(directory)) {
        this.logger.error('Schema directory not found', { directory });
        return 0;
      }
      
      const extension = this.options.schemaFileExtension || '.schema.json';
      let loadedCount = 0;
      
      // Read all files in directory
      const files = fs.readdirSync(directory);
      
      for (const file of files) {
        // Process only files with the specified extension
        if (file.endsWith(extension)) {
          const filePath = path.join(directory, file);
          
          try {
            // Read and parse schema file
            const schemaContent = fs.readFileSync(filePath, 'utf8');
            const schema = JSON.parse(schemaContent);
            
            // Register schema with file path in metadata
            const success = this.registerSchema(schema, {
              filePath: filePath,
              name: file.replace(extension, '')
            });
            
            if (success) {
              loadedCount++;
            }
          } catch (error) {
            this.logger.error('Failed to load schema file', { 
              file: filePath,
              error
            });
          }
        }
      }
      
      this.logger.info('Schemas loaded from directory', { 
        directory,
        count: loadedCount
      });
      
      return loadedCount;
    } catch (error) {
      this.logger.error('Failed to load schemas from directory', { 
        directory,
        error
      });
      return 0;
    }
  }
  
  /**
   * Get a list of schema IDs
   * @returns Array of schema IDs
   */
  getSchemaIds(): string[] {
    return Array.from(this.schemas.keys());
  }
  
  /**
   * Reload schema from its file
   * @param schemaId - ID of schema to reload
   * @returns Boolean indicating success
   */
  reloadSchema(schemaId: string): boolean {
    try {
      const schemaInfo = this.getSchemaInfo(schemaId);
      
      if (!schemaInfo || !schemaInfo.filePath) {
        this.logger.warn('Cannot reload schema: No file path', { schemaId });
        return false;
      }
      
      if (!fs.existsSync(schemaInfo.filePath)) {
        this.logger.error('Schema file not found', { 
          schemaId,
          filePath: schemaInfo.filePath
        });
        return false;
      }
      
      // Read schema file
      const schemaContent = fs.readFileSync(schemaInfo.filePath, 'utf8');
      const schema = JSON.parse(schemaContent);
      
      // Verify schema ID matches
      if ((schema as any).$id !== schemaId) {
        this.logger.error('Schema ID mismatch', {
          expectedId: schemaId,
          actualId: (schema as any).$id
        });
        return false;
      }
      
      // Unregister old schema
      this.unregisterSchema(schemaId);
      
      // Register updated schema with original metadata
      return this.registerSchema(schema, {
        ...schemaInfo,
        lastUpdated: new Date()
      });
    } catch (error) {
      this.logger.error('Failed to reload schema', { schemaId, error });
      return false;
    }
  }
}

// Create and export default instance
export const schemaRegistry = new SchemaRegistry(); 