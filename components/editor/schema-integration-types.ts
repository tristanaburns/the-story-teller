/**
 * Schema Integration Types
 * 
 * This file contains types for the schema integration component
 * that are used for story editing with characters, locations, and events.
 */

// Base entity types
export interface Character {
  _id: string;
  name: string;
  type?: string;
  description?: string;
}

export interface Location {
  _id: string;
  name: string;
  description?: string;
}

export interface TimelineEvent {
  _id: string;
  name: string;
  date?: string;
  description?: string;
}

export interface SchemaEntityReference {
  type: 'character' | 'location' | 'event';
  id: string;
  name: string;
  displayMode?: 'mention' | 'detail' | 'summary';
}

// Base schema integration props
export interface SchemaIntegrationProps {
  storyId?: string;
  initialSchema?: Schema;
  onSchemaChange?: (schema: Schema) => void;
  readOnly?: boolean;
}

// Extended schema integration props that include entity data
export interface EnhancedSchemaIntegrationProps extends SchemaIntegrationProps {
  storyId: string;
  characters?: Character[];
  locations?: Location[];
  events?: TimelineEvent[];
  onInsertEntity: (reference: SchemaEntityReference) => void;
  onLoadEntities: (type: string) => Promise<Character[] | Location[] | TimelineEvent[]>;
}

// Schema model
export interface EntityField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  description?: string;
  options?: string[];
}

export interface Entity {
  id: string;
  name: string;
  description: string;
  fields: EntityField[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Schema {
  id: string;
  name: string;
  description: string;
  entities: Entity[];
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
} 