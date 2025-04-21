'use client';

import React from 'react';
import { 
  EnhancedSchemaIntegrationProps,
  SchemaEntityReference
} from './schema-integration-types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Enhanced Schema Integration Component
 * 
 * This component extends the base SchemaIntegration component to include
 * story-specific entities like characters, locations, and events that
 * can be inserted into the editor.
 */
export default function EnhancedSchemaIntegration({
  storyId,
  characters = [],
  locations = [],
  events = [],
  onInsertEntity,
  onLoadEntities
}: EnhancedSchemaIntegrationProps) {

  const handleInsert = (type: 'character' | 'location' | 'event', id: string, name: string) => {
    const reference: SchemaEntityReference = {
      type,
      id,
      name,
      displayMode: 'mention'
    };
    
    onInsertEntity(reference);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base">Story Elements</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="characters" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="characters">Characters</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>
          
          <TabsContent value="characters">
            <div className="max-h-40 overflow-y-auto">
              {characters.length === 0 ? (
                <p className="text-sm text-muted-foreground">No characters yet</p>
              ) : (
                <ul className="space-y-1">
                  {characters.map((character) => (
                    <li key={character._id} className="flex justify-between items-center text-sm">
                      <span>{character.name}</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleInsert('character', character._id, character.name)}
                      >
                        Insert
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="locations">
            <div className="max-h-40 overflow-y-auto">
              {locations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No locations yet</p>
              ) : (
                <ul className="space-y-1">
                  {locations.map((location) => (
                    <li key={location._id} className="flex justify-between items-center text-sm">
                      <span>{location.name}</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleInsert('location', location._id, location.name)}
                      >
                        Insert
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="events">
            <div className="max-h-40 overflow-y-auto">
              {events.length === 0 ? (
                <p className="text-sm text-muted-foreground">No events yet</p>
              ) : (
                <ul className="space-y-1">
                  {events.map((event) => (
                    <li key={event._id} className="flex justify-between items-center text-sm">
                      <span>{event.name}</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleInsert('event', event._id, event.name)}
                      >
                        Insert
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 