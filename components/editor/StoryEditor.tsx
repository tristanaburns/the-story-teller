'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import ContentEditor from './ContentEditor';
import EnhancedSchemaIntegration from './EnhancedSchemaIntegration';
import { 
  Character, 
  Location, 
  TimelineEvent, 
  SchemaEntityReference, 
  EnhancedSchemaIntegrationProps 
} from './schema-integration-types';

interface ContentSection {
  id: string;
  title: string;
  content: string;
  type: 'chapter' | 'scene' | 'note' | 'description';
  metadata?: {
    [key: string]: any;
  };
}

interface StoryMetadata {
  title: string;
  genre?: string;
  setting?: string;
  themes?: string[];
  timeframe?: string;
  pov?: 'first_person' | 'second_person' | 'third_person_limited' | 'third_person_omniscient';
  [key: string]: any;
}

interface StoryEditorProps {
  storyId: string;
  initialSections?: ContentSection[];
  initialMetadata?: StoryMetadata;
  onSave?: (sections: ContentSection[], metadata: StoryMetadata) => void;
  onError?: (error: string) => void;
  readOnly?: boolean;
}

export default function StoryEditor({
  storyId,
  initialSections = [],
  initialMetadata = { title: '' },
  onSave,
  onError,
  readOnly = false
}: StoryEditorProps) {
  const [sections, setSections] = useState<ContentSection[]>(initialSections);
  const [metadata, setMetadata] = useState<StoryMetadata>(initialMetadata);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [activeContentEditor, setActiveContentEditor] = useState<{ insertRef: (text: string) => void } | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info' | null; message: string }>({ type: null, message: '' });
  const [isLoading, setIsLoading] = useState(false);
  
  // Register the active content editor component
  const registerContentEditor = (editor: { insertRef: (text: string) => void }) => {
    setActiveContentEditor(editor);
  };
  
  // Format entity reference for insertion in the content
  const formatEntityReference = (reference: SchemaEntityReference): string => {
    if (reference.displayMode === 'mention') {
      return `[[${reference.type}:${reference.id}|${reference.name}]]`;
    } else if (reference.displayMode === 'summary') {
      return `:::${reference.type}:${reference.id}:summary\n${reference.name}\n:::`;
    } else {
      return `:::${reference.type}:${reference.id}:detail\n${reference.name}\n:::`;
    }
  };
  
  // Handle entity insertion
  const handleInsertEntity = (reference: SchemaEntityReference) => {
    if (activeContentEditor) {
      const formattedRef = formatEntityReference(reference);
      activeContentEditor.insertRef(formattedRef);
    }
  };
  
  /**
   * Load entities (characters, locations, events) for the schema integration panel
   */
  const loadEntities = async (type: string): Promise<Character[] | Location[] | TimelineEvent[]> => {
    try {
      let endpoint = '';
      
      switch (type) {
        case 'character':
          endpoint = `/api/stories/${storyId}/characters`;
          
          if (characters.length > 0) {
            return characters;
          }
          break;
        case 'location':
          endpoint = `/api/stories/${storyId}/locations`;
          
          if (locations.length > 0) {
            return locations;
          }
          break;
        case 'event':
          endpoint = `/api/stories/${storyId}/timeline`;
          
          if (events.length > 0) {
            return events;
          }
          break;
        default:
          console.error(`Unknown entity type: ${type}`);
          return [];
      }
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`Failed to load ${type}s`);
      }
      
      const data = await response.json();
      
      // Update the appropriate state
      if (type === 'character') {
        setCharacters(data.characters || []);
        return data.characters || [];
      } else if (type === 'location') {
        setLocations(data.locations || []);
        return data.locations || [];
      } else if (type === 'event') {
        setEvents(data.events || []);
        return data.events || [];
      }
      
      return [];
    } catch (error) {
      console.error(`Error loading ${type}s:`, error);
      return [];
    }
  };
  
  // Handle saving content and metadata
  const handleSave = async (updatedSections: ContentSection[], updatedMetadata: StoryMetadata) => {
    setIsLoading(true);
    setStatus({ type: 'info', message: 'Saving...' });
    
    try {
      if (onSave) {
        await onSave(updatedSections, updatedMetadata);
      }
      
      setSections(updatedSections);
      setMetadata(updatedMetadata);
      
      setStatus({ type: 'success', message: 'Content saved successfully!' });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setStatus({ type: null, message: '' });
      }, 3000);
    } catch (error) {
      console.error('Error saving content:', error);
      setStatus({
        type: 'error',
        message: `Failed to save content: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      
      if (onError) {
        onError(`Failed to save content: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Process content to render entity references
  const processContent = (content: string): string => {
    // Replace [[character:id|name]] with appropriate styled text
    let processed = content.replace(
      /\[\[(character|location|event):([^\|]+)\|([^\]]+)\]\]/g,
      (match, type, id, name) => {
        if (type === 'character') {
          return `**${name}**`;
        } else if (type === 'location') {
          return `*${name}*`;
        } else {
          return `_${name}_`;
        }
      }
    );
    
    // Process :::type:id:mode blocks
    processed = processed.replace(
      /:::(character|location|event):([^:]+):(summary|detail)\n([\s\S]*?):::/g,
      (match, type, id, mode, content) => {
        // Find the actual entity
        let entity = null;
        
        if (type === 'character') {
          entity = characters.find(c => c._id === id);
        } else if (type === 'location') {
          entity = locations.find(l => l._id === id);
        } else if (type === 'event') {
          entity = events.find(e => e._id === id);
        }
        
        if (!entity) {
          return `[${type.toUpperCase()}: ${content.trim()}]`;
        }
        
        if (mode === 'summary') {
          return `> **${entity.name}**: ${entity.description || 'No description available'}`;
        } else {
          // Detail mode
          let result = `### ${entity.name}\n\n${entity.description || 'No description available'}\n\n`;
          
          if ('type' in entity && entity.type) {
            result += `**Type**: ${entity.type}\n\n`;
          }
          
          if ('date' in entity && entity.date) {
            result += `**Date**: ${entity.date}\n\n`;
          }
          
          return result;
        }
      }
    );
    
    return processed;
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Status Message */}
      {status.type && (
        <div 
          className={`mb-4 p-3 rounded-lg flex items-start ${
            status.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500' :
            status.type === 'error' ? 'bg-red-500/20 text-red-300 border border-red-500' :
            'bg-blue-500/20 text-blue-300 border border-blue-500'
          }`}
        >
          {status.type === 'error' && <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />}
          {status.type === 'success' && <Save className="h-5 w-5 mr-2 flex-shrink-0" />}
          <div>
            <p>{status.message}</p>
          </div>
        </div>
      )}
      
      {/* Main Editor */}
      <div className="mb-4 flex-grow">
        <ContentEditor
          storyId={storyId}
          initialSections={sections}
          initialMetadata={metadata}
          onSave={handleSave}
          readOnly={readOnly || isLoading}
        />
      </div>
      
      {/* Schema Integration */}
      {!readOnly && (
        <div>
          <EnhancedSchemaIntegration
            storyId={storyId}
            characters={characters}
            locations={locations}
            events={events}
            onInsertEntity={handleInsertEntity}
            onLoadEntities={loadEntities}
          />
        </div>
      )}
    </div>
  );
}
