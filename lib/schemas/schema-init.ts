/**
 * @file schema-init.ts
 * @description Initialization script for loading and registering schemas
 * @module schemas/SchemaInit
 * @exports initializeSchemas function to set up schema validation
 */

import { Logger } from '../logging/logger';
import { schemaLoader } from './schema-loader';
import { schemaRegistry } from './schema-registry';

// Create a logger for initialization
const logger = new Logger('SchemaInit');

/**
 * Initialize schemas for the application
 * 
 * This function loads all schemas from the database_schemas directory,
 * registers them with the schema registry, and ensures they're available
 * for validation.
 * 
 * @returns Promise that resolves when schemas are loaded
 */
export async function initializeSchemas(): Promise<void> {
  try {
    logger.info('Initializing schemas...');
    
    // Load all schemas from the database_schemas directory
    const loadedCount = schemaLoader.loadAllSchemas();
    
    if (loadedCount === 0) {
      logger.warn('No schemas were loaded from the database_schemas directory');
    } else {
      logger.info(`Successfully loaded ${loadedCount} schemas`);
    }

    // Register additional MongoDB-specific schemas that might not have $id
    registerMongoDBSchemas();
    
    // Verify schema registration
    const registeredSchemaIds = schemaRegistry.getSchemaIds();
    logger.info(`Schema registry contains ${registeredSchemaIds.length} schemas`);
    
    // Log registered schema IDs at debug level
    logger.debug('Registered schemas', { schemaIds: registeredSchemaIds });
  } catch (error) {
    logger.error('Failed to initialize schemas', error);
    throw error;
  }
}

/**
 * Register MongoDB-specific schemas
 */
function registerMongoDBSchemas(): void {
  try {
    // Import MongoDB schemas
    const {
      storySchema,
      characterSchema,
      locationSchema,
      timelineEventSchema,
      metadataSchema
    } = require('./story-schema');
    
    // Register with schema registry
    const mongoSchemas = [
      { id: 'mongodb:story', schema: storySchema, name: 'MongoDB Story Schema' },
      { id: 'mongodb:character', schema: characterSchema, name: 'MongoDB Character Schema' },
      { id: 'mongodb:location', schema: locationSchema, name: 'MongoDB Location Schema' },
      { id: 'mongodb:timelineEvent', schema: timelineEventSchema, name: 'MongoDB Timeline Event Schema' },
      { id: 'mongodb:metadata', schema: metadataSchema, name: 'MongoDB Metadata Schema' }
    ];
    
    for (const { id, schema, name } of mongoSchemas) {
      schemaRegistry.registerSchema(schema, {
        id,
        name,
        version: '1.0.0',
        description: `MongoDB schema for ${name}`
      });
      
      logger.debug(`Registered MongoDB schema: ${id}`);
    }
    
    logger.info('Registered MongoDB-specific schemas');
  } catch (error) {
    logger.error('Failed to register MongoDB schemas', error);
  }
}

/**
 * Get a schema by ID
 * @param schemaId - Schema ID to retrieve
 * @returns Schema object or null if not found
 */
export function getSchema(schemaId: string): any {
  // First try the schema registry
  if (schemaRegistry.hasSchema(schemaId)) {
    return schemaRegistry.getSchemaInfo(schemaId);
  }
  
  // Then try the schema loader cache
  return schemaLoader.getSchema(schemaId) || null;
}

/**
 * Validate data against a schema
 * @param schemaId - Schema ID to validate against
 * @param data - Data to validate
 * @returns Validation result
 */
export function validateAgainstSchema(schemaId: string, data: any): boolean {
  const { schemaValidator } = require('../validators/schema-validator');
  const result = schemaValidator.validate(schemaId, data);
  return result.valid;
}
