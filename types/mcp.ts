/**
 * Model Control Protocol (MCP) Types
 * 
 * This file contains type definitions for the MCP system which enables 
 * communication between the client application and AI service microservices.
 */

// Service Types
export type ServiceType = 'story-generation' | 'character-creation' | 'memory' | 'reasoning' | 'planning' | 'database' | 'everart' | 'thinking';

// Server Status Types
export type ServerStatus = 'online' | 'offline' | 'error' | 'busy' | 'maintenance';

/**
 * Base configuration for an MCP server
 */
export interface ServerConfig {
  id: string;
  name: string;
  url: string;
  type: ServiceType;
  status: ServerStatus;
  version: string;
  capabilities: string[];
  priority: number;
  apiKey?: string;
  metadata: ServerMetadata;
}

/**
 * Extended Server Configuration with endpoints
 */
export interface MCPServerConfig {
  id: string;
  name: string;
  description?: string;
  version: string;
  baseUrl: string;
  endpoints: Record<string, string>; 
  timeout: number;
  retryCount: number;
  retryDelay: number;
  apiKey?: string;
}

/**
 * Collection of server configurations by ID
 */
export type ServerConfigs = Record<string, ServerConfig>;

/**
 * Metadata for server configuration
 */
export interface ServerMetadata {
  description?: string;
  provider?: string;
  model?: string;
  maxTokens?: number;
  costPerToken?: number;
  latency?: number;
  lastChecked?: number;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Base MCP request structure
 */
export interface BaseMCPRequest<T = unknown> {
  serverId: string;
  action: string;
  payload: T;
  userId?: string;
  requestId: string;
  timestamp: number;
}

/**
 * Base MCP response structure
 */
export interface BaseMCPResponse<T = unknown> {
  serverId: string;
  action: string;
  payload: T;
  status: 'success' | 'error' | 'pending';
  error?: string;
  requestId: string;
  responseId: string;
  timestamp: number;
}

// =========================
// Memory Service Types
// =========================

/**
 * Available memory actions
 */
export type MemoryAction = 
  | 'store_memory'
  | 'retrieve_memory' 
  | 'update_memory'
  | 'delete_memory'
  | 'search_memory';

/**
 * Memory entry structure
 */
export interface Memory {
  id: string;
  content: string;
  importance: number;
  tags: string[];
  metadata: MemoryMetadata;
  timestamp: number;
  contextId: string;
}

/**
 * Memory metadata
 */
export interface MemoryMetadata {
  storyId?: string;
  characterId?: string;
  locationId?: string;
  eventId?: string;
  type?: string;
  source?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Memory search criteria
 */
export interface MemoryCriteria {
  storyId?: string;
  contextId?: string;
  tags?: string[];
  timeframe?: {
    start?: string | number;
    end?: string | number;
  };
  importance?: {
    min?: number;
    max?: number;
  };
  [key: string]: string | string[] | number | boolean | undefined | Record<string, string | number | undefined>;
}

/**
 * Memory request payload
 */
export interface MemoryPayload {
  memory_id?: string;
  content?: string;
  importance?: number;
  tags?: string[];
  metadata?: MemoryMetadata;
  contextId?: string;
  criteria?: MemoryCriteria;
  query?: string;
  limit?: number;
  offset?: number;
}

/**
 * Memory response payload
 */
export interface MemoryResponsePayload {
  memory_id?: string;
  memories?: Memory[];
  content?: string;
  importance?: number;
  tags?: string[];
  metadata?: MemoryMetadata;
  contextId?: string;
  total?: number;
}

// =========================
// Story Generation Types
// =========================

/**
 * Available story generation actions
 */
export type StoryGenerationAction = 
  | 'generate_story'
  | 'continue_story'
  | 'edit_story'
  | 'summarize_story';

/**
 * Story generation request payload
 */
export interface StoryGenerationPayload {
  storyId?: string;
  content?: string;
  prompt?: string;
  characters?: CharacterReference[];
  locations?: LocationReference[];
  style?: string;
  tone?: string;
  genre?: string;
  length?: number;
  continuationPoint?: string;
  editInstructions?: string;
  metadata?: StoryMetadata;
  options?: GenerationOptions;
}

/**
 * Story generation response payload
 */
export interface StoryGenerationResponsePayload {
  storyId?: string;
  content?: string;
  summary?: string;
  metadata?: StoryMetadata;
}

/**
 * Story metadata
 */
export interface StoryMetadata {
  title?: string;
  author?: string;
  createdAt?: number;
  updatedAt?: number;
  wordCount?: number;
  characterCount?: number;
  chapterCount?: number;
  genre?: string;
  tags?: string[];
  status?: string;
  [key: string]: string | string[] | number | boolean | undefined;
}

/**
 * Generation options
 */
export interface GenerationOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  [key: string]: string | string[] | number | boolean | undefined;
}

/**
 * Character reference for story generation
 */
export interface CharacterReference {
  id: string;
  name: string;
  role?: string;
  description?: string;
  relations?: CharacterRelation[];
}

/**
 * Location reference for story generation
 */
export interface LocationReference {
  id: string;
  name: string;
  description?: string;
  type?: string;
}

/**
 * Character relation
 */
export interface CharacterRelation {
  characterId: string;
  type: string;
  description?: string;
}

// =========================
// Character Creation Types
// =========================

/**
 * Available character creation actions
 */
export type CharacterCreationAction = 
  | 'create_character'
  | 'update_character'
  | 'generate_backstory'
  | 'generate_dialogue';

/**
 * Character creation request payload
 */
export interface CharacterCreationPayload {
  characterId?: string;
  name?: string;
  description?: string;
  backstory?: string;
  personality?: string[];
  goals?: string[];
  fears?: string[];
  relationships?: CharacterRelation[];
  storyId?: string;
  prompt?: string;
  dialogueContext?: string;
  options?: GenerationOptions;
}

/**
 * Character creation response payload
 */
export interface CharacterCreationResponsePayload {
  characterId?: string;
  name?: string;
  description?: string;
  backstory?: string;
  personality?: string[];
  goals?: string[];
  fears?: string[];
  dialogue?: string;
  metadata?: {
    age?: number;
    gender?: string;
    occupation?: string;
    [key: string]: string | number | boolean | undefined;
  };
}

// =========================
// Reasoning Service Types
// =========================

/**
 * Available reasoning actions
 */
export type ReasoningAction = 
  | 'analyze_plot'
  | 'analyze_character'
  | 'predict_outcomes'
  | 'evaluate_consistency';

/**
 * Reasoning request payload
 */
export interface ReasoningPayload {
  storyId?: string;
  content?: string;
  characterId?: string;
  plotPoints?: string[];
  question?: string;
  context?: string;
  options?: GenerationOptions;
}

/**
 * Reasoning response payload
 */
export interface ReasoningResponsePayload {
  analysis?: string;
  predictions?: string[];
  consistencyScore?: number;
  issues?: {
    description: string;
    severity: 'low' | 'medium' | 'high';
    location?: string;
  }[];
  suggestions?: string[];
}

// =========================
// Planning Service Types
// =========================

/**
 * Available planning actions
 */
export type PlanningAction = 
  | 'create_outline'
  | 'generate_plot_points'
  | 'suggest_twists'
  | 'plan_characters';

/**
 * Planning request payload
 */
export interface PlanningPayload {
  storyId?: string;
  title?: string;
  premise?: string;
  genre?: string;
  characters?: CharacterReference[];
  existingOutline?: string;
  targetLength?: number;
  complexity?: 'simple' | 'moderate' | 'complex';
  options?: GenerationOptions;
}

/**
 * Planning response payload
 */
export interface PlanningResponsePayload {
  outline?: {
    title: string;
    chapters: {
      title: string;
      summary: string;
      scenes?: {
        setting: string;
        action: string;
        characters: string[];
      }[];
    }[];
  };
  plotPoints?: string[];
  twists?: string[];
  characterSuggestions?: CharacterCreationResponsePayload[];
}

// Type aliases for specific service requests and responses
export type MCPRequest<T = unknown> = BaseMCPRequest<T>;
export type MCPResponse<T = unknown> = BaseMCPResponse<T>;

// Memory service types
export type MemoryMCPRequest = BaseMCPRequest<MemoryPayload>;
export type MemoryMCPResponse = BaseMCPResponse<MemoryResponsePayload>;

// Database service types
export type DatabaseMCPRequest = BaseMCPRequest<DatabasePayload>;
export type DatabaseMCPResponse = BaseMCPResponse<DatabaseResponsePayload>;

// Thinking service types
export type ThinkingMCPRequest = BaseMCPRequest<ThinkingPayload>;
export type ThinkingMCPResponse = BaseMCPResponse<ThinkingResponsePayload>;

// Art service types
export type EverartMCPRequest = BaseMCPRequest<ArtPayload>;
export type EverartMCPResponse = BaseMCPResponse<ArtResponsePayload>;

// Simple database payload type
export interface DatabasePayload {
  collection?: string;
  operation?: 'find' | 'findOne' | 'insertOne' | 'updateOne' | 'deleteOne';
  query?: Record<string, any>;
  update?: Record<string, any>;
  options?: Record<string, any>;
  document?: Record<string, any>;
}

// Database response payload
export interface DatabaseResponsePayload {
  result?: any;
  count?: number;
  error?: string;
}

// Thinking payload
export interface ThinkingPayload {
  prompt?: string;
  context?: string;
  options?: GenerationOptions;
}

// Thinking response payload
export interface ThinkingResponsePayload {
  thought?: string;
  analysis?: string;
  reasoning?: string[];
}

/**
 * Art payload interface for Everart MCP server
 */
export interface ArtPayload {
  prompt?: string;
  style?: string;
  size?: string;
  artId?: string;
  storyId?: string;
  artType?: 'character' | 'location' | 'scene' | 'item';
  query?: string;
  metadata?: Record<string, any>;
  negative_prompt?: string;
  options?: Record<string, any>;
}

// Art generation response payload
export interface ArtResponsePayload {
  imageUrl?: string;
  alt?: string;
  metadata?: Record<string, any>;
}

/**
 * MCP Server Registry
 */
export interface MCPServerRegistry {
  memory?: MCPServerConfig;
  everart?: MCPServerConfig;
  thinking?: MCPServerConfig;
  database?: MCPServerConfig;
  [key: string]: MCPServerConfig | undefined;
}

// Re-export MCPServerConfig as ServerConfig alias for backward compatibility
// export type MCPServerConfig = ServerConfig;
