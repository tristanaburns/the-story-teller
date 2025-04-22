/**
 * @file schema-registry.ts
 * @description Schema registry for The Story Teller application
 * @module validators/SchemaRegistry
 * @exports SchemaRegistry class for managing and accessing JSON schemas
 */

import { schemaValidator } from './schema-validator';
import { Logger } from '@/lib/logging/logger';

// Create a logger for the schema registry
const logger = new Logger('SchemaRegistry');

/**
 * Schema Registry class to manage application schemas
 */
export class SchemaRegistry {
  private schemas: Map<string, object>;
  
  /**
   * Create a new schema registry instance
   */
  constructor() {
    this.schemas = new Map();
    logger.debug('Schema registry initialized');
  }
  
  /**
   * Register a schema with the registry and validator
   * @param id - Unique ID for the schema
   * @param schema - JSON schema object
   */
  registerSchema(id: string, schema: object): void {
    // Store schema in registry
    this.schemas.set(id, schema);
    
    // Register with validator
    schemaValidator.addSchema(id, schema);
    
    logger.debug(`Schema registered: ${id}`);
  }
  
  /**
   * Get a schema by ID
   * @param id - Schema ID to retrieve
   * @returns Schema object or undefined if not found
   */
  getSchema(id: string): object | undefined {
    return this.schemas.get(id);
  }
  
  /**
   * Check if a schema exists
   * @param id - Schema ID to check
   * @returns Boolean indicating if schema exists
   */
  hasSchema(id: string): boolean {
    return this.schemas.has(id);
  }
  
  /**
   * Remove a schema from registry and validator
   * @param id - Schema ID to remove
   */
  removeSchema(id: string): void {
    this.schemas.delete(id);
    schemaValidator.removeSchema(id);
    logger.debug(`Schema removed: ${id}`);
  }
  
  /**
   * Get all registered schema IDs
   * @returns Array of schema IDs
   */
  getSchemaIds(): string[] {
    return Array.from(this.schemas.keys());
  }
  
  /**
   * Bulk register multiple schemas
   * @param schemas - Object mapping schema IDs to schema objects
   */
  registerSchemas(schemas: Record<string, object>): void {
    Object.entries(schemas).forEach(([id, schema]) => {
      this.registerSchema(id, schema);
    });
    logger.debug(`Registered ${Object.keys(schemas).length} schemas`);
  }
}

// Create and export singleton instance
export const schemaRegistry = new SchemaRegistry();

// Register core application schemas
export function registerApplicationSchemas(): void {
  // API request schemas for story operations
  schemaRegistry.registerSchema('createStory', {
    type: 'object',
    required: ['title'],
    properties: {
      title: { type: 'string', minLength: 1 },
      description: { type: 'string' },
      genre: { type: 'string' },
      setting: { type: 'string' },
      themes: { 
        type: 'array',
        items: { type: 'string' }
      }
    }
  });
  
  // API request schema for updating stories
  schemaRegistry.registerSchema('updateStory', {
    type: 'object',
    properties: {
      title: { type: 'string', minLength: 1 },
      description: { type: 'string' },
      genre: { type: 'string' },
      setting: { type: 'string' },
      themes: { 
        type: 'array',
        items: { type: 'string' }
      },
      status: { 
        type: 'string',
        enum: ['draft', 'published', 'archived']
      },
      metadata: { type: 'object' }
    }
  });
  
  // API request schema for creating characters
  schemaRegistry.registerSchema('createCharacter', {
    type: 'object',
    required: ['name', 'storyId'],
    properties: {
      name: { type: 'string', minLength: 1 },
      storyId: { type: 'string' },
      full_name: { type: 'string' },
      type: { 
        type: 'string',
        enum: ['protagonist', 'antagonist', 'supporting', 'minor']
      },
      status: {
        type: 'string',
        enum: ['alive', 'deceased', 'unknown']
      },
      description: { type: 'string' },
      physical_appearance: {
        type: 'object',
        properties: {
          height: { type: 'string' },
          build: { type: 'string' },
          distinctive_features: {
            type: 'array',
            items: { type: 'string' }
          },
          typical_attire: { type: 'string' }
        }
      },
      personality: {
        type: 'object',
        properties: {
          traits: {
            type: 'array',
            items: { type: 'string' }
          },
          values: {
            type: 'array',
            items: { type: 'string' }
          },
          motivations: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      },
      background: {
        type: 'object',
        properties: {
          birthplace: { type: 'string' },
          occupation: { type: 'string' },
          significant_events: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    }
  });
  
  // API request schema for AI-generated content
  schemaRegistry.registerSchema('generateContent', {
    type: 'object',
    required: ['storyId', 'prompt'],
    properties: {
      storyId: { type: 'string' },
      prompt: { type: 'string', minLength: 1 },
      sectionId: { type: 'string' },
      characters: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' }
          }
        }
      },
      locations: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' }
          }
        }
      },
      tone: { type: 'string' },
      style: { type: 'string' },
      length: { type: 'string' },
      temperature: { 
        type: 'number',
        minimum: 0,
        maximum: 1
      }
    }
  });
  
  logger.info('Application schemas registered');
} 