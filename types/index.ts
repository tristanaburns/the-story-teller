/**
 * Main type definitions export file
 * This file exports all types used throughout the application
 */

// Import and explicitly export model types
import type { Story, Character, RelatedCharacter } from './models';
export type { Story, Character, RelatedCharacter };

// Export remaining model types
export * from './models';

// Import all MCP types
import * as MCPTypesImport from './mcp';

// Re-export MCP types namespace
export { MCPTypesImport as MCPTypes };

// Re-export individual types from MCP that don't conflict with model types
export type { 
  BaseMCPRequest,
  BaseMCPResponse,
  ServerConfig,
  ServerConfigs,
  ServerMetadata,
  ServiceType,
  ServerStatus
} from './mcp';

// Export Next Auth types
export * from './next-auth';

// Add additional type exports here as needed 