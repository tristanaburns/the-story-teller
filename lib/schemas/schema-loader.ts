/**
 * @file schema-loader.ts
 * @description Utility for loading schemas from the database_schemas directory
 * @module schemas/SchemaLoader
 * @exports SchemaLoader class for loading and processing JSON schemas
 */

import fs from 'fs';
import path from 'path';
import { Logger } from '../logging/logger';
import { schemaRegistry } from './schema-registry';

/**
 * Schema loader options
 */
export interface SchemaLoaderOptions {
  /**
   * Root directory containing schema files
   */
  schemasRootDir: string;
  
  /**
   * Whether to register schemas automatically (default: true)
   */
  autoRegister?: boolean;
  
  /**
   * Whether to resolve references (default: true)
   */
  resolveRefs?: boolean;
  
  /**
   * File extension for schema files (default: .json)
   */
  schemaFileExtension?: string;
}

/**
 * Class for loading and processing JSON schemas
 */
export class SchemaLoader {
  private logger: Logger;
  private options: SchemaLoaderOptions;
  private schemaCache: Map<string, any> = new Map();
  
  /**
   * Create a new SchemaLoader instance
   * @param options - Configuration options
   */
  constructor(options: SchemaLoaderOptions) {
    this.logger = new Logger('SchemaLoader');
    
    this.options = {
      autoRegister: true,
      resolveRefs: true,
      schemaFileExtension: '.json',
      ...options
    };
    
    if (!fs.existsSync(options.schemasRootDir)) {
      throw new Error(`Schema root directory does not exist: ${options.schemasRootDir}`);
    }
    
    this.logger.debug('SchemaLoader initialized', { options: this.options });
  }
  
  /**
   * Load all schemas from the root directory
   * @returns Number of schemas loaded
   */
  loadAllSchemas(): number {
    try {
      const rootDir = this.options.schemasRootDir;
      let loadedCount = 0;
      
      // Process schema files in the root directory
      const files = this.getJsonFiles(rootDir);
      for (const file of files) {
        const filePath = path.join(rootDir, file);
        const schema = this.loadSchemaFile(filePath);
        
        if (schema && schema.$id) {
          this.schemaCache.set(schema.$id, schema);
          
          if (this.options.autoRegister) {
            schemaRegistry.registerSchema(schema);
          }
          
          loadedCount++;
          this.logger.debug(`Loaded schema: ${schema.$id}`, { filePath });
        } else {
          this.logger.warn(`Schema file has no $id, skipping: ${filePath}`);
        }
      }
      
      // Process subdirectories
      const subdirs = fs.readdirSync(rootDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      for (const subdir of subdirs) {
        loadedCount += this.loadSchemasFromDirectory(path.join(rootDir, subdir));
      }
      
      this.logger.info(`Loaded ${loadedCount} schemas from ${rootDir}`);
      
      // Resolve references if needed
      if (this.options.resolveRefs && loadedCount > 0) {
        this.resolveReferences();
      }
      
      return loadedCount;
    } catch (error) {
      this.logger.error('Failed to load schemas', error);
      return 0;
    }
  }
  
  /**
   * Load schemas from a specific directory
   * @param directory - Directory path
   * @returns Number of schemas loaded
   */
  private loadSchemasFromDirectory(directory: string): number {
    try {
      let loadedCount = 0;
      
      // Process schema files in this directory
      const files = this.getJsonFiles(directory);
      for (const file of files) {
        const filePath = path.join(directory, file);
        const schema = this.loadSchemaFile(filePath);
        
        if (schema && schema.$id) {
          this.schemaCache.set(schema.$id, schema);
          
          if (this.options.autoRegister) {
            schemaRegistry.registerSchema(schema);
          }
          
          loadedCount++;
          this.logger.debug(`Loaded schema: ${schema.$id}`, { filePath });
        } else {
          this.logger.warn(`Schema file has no $id, skipping: ${filePath}`);
        }
      }
      
      // Process subdirectories
      const subdirs = fs.readdirSync(directory, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      for (const subdir of subdirs) {
        loadedCount += this.loadSchemasFromDirectory(path.join(directory, subdir));
      }
      
      return loadedCount;
    } catch (error) {
      this.logger.error(`Failed to load schemas from directory: ${directory}`, error);
      return 0;
    }
  }
  
  /**
   * Get JSON files in a directory
   * @param directory - Directory to scan
   * @returns Array of file names
   */
  private getJsonFiles(directory: string): string[] {
    return fs.readdirSync(directory, { withFileTypes: true })
      .filter(dirent => !dirent.isDirectory() && dirent.name.endsWith(this.options.schemaFileExtension || '.json'))
      .map(dirent => dirent.name);
  }
  
  /**
   * Load a schema file
   * @param filePath - Path to schema file
   * @returns Parsed schema or null on error
   */
  private loadSchemaFile(filePath: string): any {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      this.logger.error(`Failed to load schema file: ${filePath}`, error);
      return null;
    }
  }
  
  /**
   * Resolve references between schemas
   */
  private resolveReferences(): void {
    try {
      // This is a simplified implementation
      // For full $ref resolution, you might need a more sophisticated approach
      
      // For each schema in the cache
      for (const [id, schema] of this.schemaCache.entries()) {
        // Recursively process schema to resolve references
        this.processSchema(schema);
        
        // Re-register the schema with resolved references
        if (this.options.autoRegister) {
          schemaRegistry.registerSchema(schema);
        }
      }
      
      this.logger.info('Resolved references between schemas');
    } catch (error) {
      this.logger.error('Failed to resolve references', error);
    }
  }
  
  /**
   * Process a schema to resolve references
   * @param obj - Schema or schema part to process
   */
  private processSchema(obj: any): void {
    if (!obj || typeof obj !== 'object') {
      return;
    }
    
    // Process arrays
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        this.processSchema(obj[i]);
      }
      return;
    }
    
    // Process $ref properties
    if (obj.$ref && typeof obj.$ref === 'string' && obj.$ref.startsWith('#')) {
      // Local reference - not handling these for now
      return;
    }
    
    // Process other properties
    for (const key in obj) {
      // Skip prototype properties
      if (!Object.prototype.hasOwnProperty.call(obj, key)) {
        continue;
      }
      
      // Process nested objects
      this.processSchema(obj[key]);
    }
  }
  
  /**
   * Get a loaded schema by ID
   * @param schemaId - Schema ID
   * @returns Schema or undefined if not found
   */
  getSchema(schemaId: string): any {
    return this.schemaCache.get(schemaId);
  }
  
  /**
   * Get all loaded schema IDs
   * @returns Array of schema IDs
   */
  getSchemaIds(): string[] {
    return Array.from(this.schemaCache.keys());
  }
}

// Create and export default instances
export const schemaLoader = new SchemaLoader({
  schemasRootDir: path.join(process.cwd(), 'database_schemas')
});
