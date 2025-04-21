/**
 * Location Types
 * 
 * Type definitions for locations in the story-teller application.
 */

// Type of location
export enum LocationType {
  City = 'city',
  Town = 'town',
  Village = 'village',
  Forest = 'forest',
  Mountain = 'mountain',
  Desert = 'desert',
  Ocean = 'ocean',
  Lake = 'lake',
  River = 'river',
  Island = 'island',
  Castle = 'castle',
  Building = 'building',
  Cave = 'cave',
  Other = 'other'
}

// Location interface
export interface Location {
  _id?: string;
  name: string;
  description: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  type: LocationType;
  storyId: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

// Location Form Props
export interface LocationFormProps {
  initialData?: Partial<Location>;
  storyId: string;
  onSuccess: (location: Location) => void;
  onCancel: () => void;
}

// Map Selector Props
export interface MapSelectorProps {
  initialPosition?: [number, number];
  onPositionChange: (position: [number, number]) => void;
} 