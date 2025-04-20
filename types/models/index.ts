import { ObjectId } from 'mongodb';

/**
 * Common model types for the application
 * 
 * This file contains shared type definitions for use throughout the application
 */

// Story model
export interface Story {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  genre?: string;
  setting?: string;
  themes?: string[];
  created_at?: Date;
  updated_at?: Date;
  user_id?: string;
  characters?: Character[];
  locations?: Location[];
  contents?: StoryContent[];
  contentVersion?: number;
  contentLastUpdated?: Date;
  cover_image?: string;
  isPublic?: boolean;
}

// Character model
export interface Character {
  _id?: string;
  id?: string;
  storyId: string;
  name: string;
  full_name?: string;
  type?: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  status?: 'alive' | 'deceased' | 'unknown';
  description?: string;
  physical_appearance?: {
    height?: string;
    build?: string;
    distinctive_features?: string[];
    typical_attire?: string;
  };
  personality?: {
    traits?: string[];
    values?: string[];
    motivations?: string[];
  };
  background?: {
    birthplace?: string;
    occupation?: string;
    significant_events?: string[];
  };
  relationships?: Array<{
    character_id: string;
    relationship_type: string;
    dynamics: string;
  }>;
  story_role?: string;
}

// Location model
export interface Location {
  _id?: string;
  id?: string;
  storyId: string;
  name: string;
  description?: string;
  type?: string;
  geographical_data?: {
    coordinates?: {
      latitude?: number;
      longitude?: number;
      elevation?: string;
      planar_coordinates?: string;
    };
    area?: {
      value?: number;
      unit?: 'square meters' | 'square kilometers' | 'hectares' | 'square miles' | 'acres';
    };
    terrain?: {
      dominant_features?: string[];
      biome?: string;
      notable_topography?: string;
    };
  };
  environment?: {
    natural_elements?: {
      integration?: string;
      flora?: Array<{
        species: string;
        prevalence?: 'dominant' | 'common' | 'scattered' | 'rare' | 'unique';
        significance?: string;
      }>;
      fauna?: Array<{
        species: string;
        behavior?: string;
        relationship_to_inhabitants?: string;
      }>;
    };
  };
  features?: {
    landmarks?: Array<{
      name: string;
      description: string;
      significance?: string;
    }>;
    districts?: Array<{
      name: string;
      character?: string;
      primary_function?: string;
    }>;
    infrastructure?: {
      transportation?: Array<{
        system_name: string;
        description: string;
      }>;
    };
  };
  // Additional properties used in the LocationForm component
  related_locations?: Array<{
    location_id: string;
    relationship_type: string;
    description: string;
  }>;
  climate?: Array<{
    season: string;
    description: string;
  }>;
  map_features?: Array<{
    feature_type: string;
    description: string;
  }>;
}

// Timeline Event model
export interface TimelineEvent {
  _id?: ObjectId;
  id: string;
  storyId: string;
  title: string;
  description: string;
  date: string;
  chronology_date?: Date | null;
  significance: string;
  characters_involved?: string[];
  locations_involved?: string[];
  preceding_events?: string[];
  following_events?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// User metadata model
export interface UserMetadata {
  _id?: ObjectId;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  plan: 'free' | 'premium';
  storiesCount: number;
}

// Relationship types
export enum RelationshipType {
  FAMILY = 'family',
  FRIEND = 'friend',
  ENEMY = 'enemy',
  ALLY = 'ally',
  RIVAL = 'rival',
  ROMANTIC = 'romantic',
  PROFESSIONAL = 'professional',
  ACQUAINTANCE = 'acquaintance',
  OTHER = 'other'
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RelatedCharacter {
  _id: string;
  id: string;
  name: string;
}

// Story content model
export interface ContentSection {
  id: string;
  title: string;
  content: string;
  type: 'chapter' | 'scene' | 'note' | 'description';
  metadata?: {
    [key: string]: any;
  };
}

export interface StoryMetadata {
  title: string;
  genre?: string;
  setting?: string;
  themes?: string[];
  timeframe?: string;
  pov?: 'first_person' | 'second_person' | 'third_person_limited' | 'third_person_omniscient';
  [key: string]: any;
}

export interface StoryContent {
  sections: ContentSection[];
  metadata: StoryMetadata;
  lastUpdated: Date;
  version: number;
}
