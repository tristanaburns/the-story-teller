/**
 * @file schema-registry.js
 * @description A schema registry for managing and validating JSON schemas.
 * @module SchemaRegistry
 */
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const { glob } = require('glob');

/**
 * @class SchemaRegistry
 * @description A registry for managing and validating JSON schemas
 */
class SchemaRegistry {
  /**
   * @constructor
   * @description Create a new SchemaRegistry instance
   * @param {Object} options - Configuration options for the registry
   * @param {Object} options.logger - Logger object with debug, info, warn, and error methods
   * @param {boolean} [options.autoLoadSchemas=false] - Whether to automatically load schemas from the schemasDir
   * @param {string} [options.schemasDir] - Directory containing schema files to load
   * @param {string} [options.schemaFileExtension='.schema.json'] - File extension for schema files
   */
  constructor(options = {}) {
    this.options = {
      autoLoadSchemas: false,
      schemaFileExtension: '.schema.json',
      ...options,
    };

    this.logger = options.logger || {
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
    };

    this.ajv = new Ajv({
      allErrors: true,
      strict: true,
      strictSchema: true,
      validateFormats: true,
    });
    
    // Add string formats like date, uri, etc.
    addFormats(this.ajv);

    // Initialize schemas storage
    this.schemas = {};
    this.schemaMetadata = {};

    // Auto-load schemas if requested
    if (this.options.autoLoadSchemas && this.options.schemasDir) {
      this.loadSchemasFromDirectory();
    }
  }

  /**
   * @function loadSchemasFromDirectory
   * @description Load schemas from directory specified in options
   * @returns {Promise<number>} Number of schemas loaded
   */
  async loadSchemasFromDirectory() {
    try {
      const dir = this.options.schemasDir;
      const extension = this.options.schemaFileExtension;
      
      if (!dir || !fs.existsSync(dir)) {
        this.logger.warn(`Schema directory does not exist: ${dir}`);
        return 0;
      }
      
      this.logger.debug(`Loading schemas from: ${dir}`);
      
      const pattern = path.join(dir, `**/*${extension}`);
      const files = await glob(pattern);
      
      this.logger.debug(`Found ${files.length} schema files`);
      
      // Load and register each schema
      let loadedCount = 0;
      for (const file of files) {
        try {
          const schemaStr = fs.readFileSync(file, 'utf8');
          const schema = JSON.parse(schemaStr);
          
          if (!schema.$id) {
            this.logger.warn(`Schema in file ${file} has no $id, skipping`);
            continue;
          }
          
          this.registerSchema(schema, file);
          loadedCount++;
        } catch (err) {
          this.logger.error(`Error loading schema from ${file}: ${err.message}`);
        }
      }
      
      this.logger.info(`Successfully loaded ${loadedCount} schemas`);
      return loadedCount;
    } catch (err) {
      this.logger.error(`Failed to load schemas: ${err.message}`);
      throw err;
    }
  }

  /**
   * @function registerSchema
   * @description Register a schema with the registry
   * @param {Object} schema - The JSON schema to register
   * @param {string} [source='api'] - Source of the schema (filepath or 'api', 'memory-schema', etc.)
   * @returns {boolean} Whether the registration was successful
   */
  registerSchema(schema, source = 'api') {
    try {
      if (!schema || typeof schema !== 'object') {
        throw new Error('Schema must be an object');
      }
      
      if (!schema.$id) {
        throw new Error('Schema must have an $id property');
      }
      
      const schemaId = schema.$id;
      
      // Add the schema to Ajv
      this.ajv.addSchema(schema, schemaId);
      
      // Store schema and metadata
      this.schemas[schemaId] = schema;
      this.schemaMetadata[schemaId] = {
        id: schemaId,
        title: schema.title || 'Untitled Schema',
        description: schema.description || '',
        source: source,
        registeredAt: new Date().toISOString(),
      };
      
      this.logger.debug(`Registered schema: ${schemaId} (${source})`);
      return true;
    } catch (err) {
      this.logger.error(`Failed to register schema: ${err.message}`);
      return false;
    }
  }

  /**
   * @function unregisterSchema
   * @description Remove a schema from the registry
   * @param {string} schemaId - The ID of the schema to remove
   * @returns {boolean} Whether the schema was successfully removed
   */
  unregisterSchema(schemaId) {
    try {
      if (!this.hasSchema(schemaId)) {
        this.logger.warn(`Schema not found: ${schemaId}`);
        return false;
      }
      
      // Remove from Ajv
      this.ajv.removeSchema(schemaId);
      
      // Remove from storage
      delete this.schemas[schemaId];
      delete this.schemaMetadata[schemaId];
      
      this.logger.debug(`Unregistered schema: ${schemaId}`);
      return true;
    } catch (err) {
      this.logger.error(`Failed to unregister schema: ${err.message}`);
      return false;
    }
  }

  /**
   * @function validate
   * @description Validate data against a registered schema
   * @param {string} schemaId - The ID of the schema to validate against
   * @param {Object} data - The data to validate
   * @returns {Object} Validation result with valid flag and errors if any
   */
  validate(schemaId, data) {
    try {
      if (!this.hasSchema(schemaId)) {
        throw new Error(`Schema not found: ${schemaId}`);
      }
      
      const validate = this.ajv.getSchema(schemaId);
      const valid = validate(data);
      
      return {
        valid,
        errors: valid ? null : validate.errors,
      };
    } catch (err) {
      this.logger.error(`Validation error: ${err.message}`);
      return {
        valid: false,
        errors: [{ message: err.message }],
      };
    }
  }

  /**
   * @function hasSchema
   * @description Check if a schema with the given ID is registered
   * @param {string} schemaId - The ID of the schema to check
   * @returns {boolean} Whether the schema is registered
   */
  hasSchema(schemaId) {
    return Object.prototype.hasOwnProperty.call(this.schemas, schemaId);
  }

  /**
   * @function getSchema
   * @description Get a schema by ID
   * @param {string} schemaId - The ID of the schema to get
   * @returns {Object} The schema object
   * @throws {Error} If the schema is not found
   */
  getSchema(schemaId) {
    if (!this.hasSchema(schemaId)) {
      throw new Error(`Schema not found: ${schemaId}`);
    }
    
    return this.schemas[schemaId];
  }

  /**
   * @function getSchemaInfo
   * @description Get metadata about a schema
   * @param {string} schemaId - The ID of the schema to get metadata for
   * @returns {Object} Schema metadata
   * @throws {Error} If the schema is not found
   */
  getSchemaInfo(schemaId) {
    if (!this.hasSchema(schemaId)) {
      throw new Error(`Schema not found: ${schemaId}`);
    }
    
    return this.schemaMetadata[schemaId];
  }

  /**
   * @function getSchemaIds
   * @description Get all registered schema IDs
   * @returns {string[]} Array of schema IDs
   */
  getSchemaIds() {
    return Object.keys(this.schemas);
  }

  /**
   * @function getAllSchemas
   * @description Get all registered schemas
   * @returns {Object} Object with schema IDs as keys and schema objects as values
   */
  getAllSchemas() {
    return { ...this.schemas };
  }

  /**
   * @function getAllSchemasInfo
   * @description Get metadata for all registered schemas
   * @returns {Object} Object with schema IDs as keys and schema metadata as values
   */
  getAllSchemasInfo() {
    return { ...this.schemaMetadata };
  }
}

module.exports = { SchemaRegistry }; 