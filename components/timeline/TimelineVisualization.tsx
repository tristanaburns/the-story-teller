'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, MapPin, ChevronRight, ChevronLeft, User } from 'lucide-react';

interface TimelineEvent {
  _id: string;
  storyId: string;
  name: string;
  date: string; // ISO format date string
  description?: string;
  locationIds?: string[];
  characterIds?: string[];
  importance?: 'major' | 'minor' | 'critical';
}

interface TimelineLocation {
  _id: string;
  name: string;
  description?: string;
}

interface TimelineCharacter {
  _id: string;
  name: string;
}

interface TimelineVisualizationProps {
  events: TimelineEvent[];
  locations: TimelineLocation[];
  characters: TimelineCharacter[];
  storyId: string;
}

export default function TimelineVisualization({
  events,
  locations,
  characters,
  storyId
}: TimelineVisualizationProps) {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [visibleRange, setVisibleRange] = useState<[Date, Date] | null>(null);
  const [zoomLevel, setZoomLevel] = useState<'year' | 'month' | 'day'>('year');

  // Parse dates and sort events chronologically
  const sortedEvents = useMemo(() => {
    return [...events]
      .map(event => ({
        ...event,
        parsedDate: new Date(event.date)
      }))
      .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());
  }, [events]);

  // Determine timeline range based on events
  const timelineRange = useMemo(() => {
    if (sortedEvents.length === 0) return [new Date(), new Date()];
    
    const earliestDate = sortedEvents[0].parsedDate;
    const latestDate = sortedEvents[sortedEvents.length - 1].parsedDate;
    
    // Add some padding to the range
    const start = new Date(earliestDate);
    start.setMonth(start.getMonth() - 1);
    
    const end = new Date(latestDate);
    end.setMonth(end.getMonth() + 1);
    
    return [start, end] as [Date, Date];
  }, [sortedEvents]);

  // Initialize visible range to full timeline
  useEffect(() => {
    if (!visibleRange && timelineRange) {
      setVisibleRange(timelineRange as [Date, Date]);
    }
  }, [timelineRange, visibleRange]);

  // Format date for display based on zoom level
  const formatDate = (date: Date) => {
    if (zoomLevel === 'year') {
      return date.toLocaleDateString(undefined, { year: 'numeric' });
    } else if (zoomLevel === 'month') {
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
    } else {
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }
  };

  // Group events by year/month/day depending on zoom level
  const groupedEvents = useMemo(() => {
    if (!sortedEvents.length) return new Map();
    
    const grouped = new Map();
    
    sortedEvents.forEach(event => {
      let groupKey;
      const date = event.parsedDate;
      
      if (zoomLevel === 'year') {
        groupKey = date.getFullYear().toString();
      } else if (zoomLevel === 'month') {
        groupKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      } else {
        groupKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      }
      
      if (!grouped.has(groupKey)) {
        grouped.set(groupKey, []);
      }
      
      grouped.get(groupKey).push(event);
    });
    
    return grouped;
  }, [sortedEvents, zoomLevel]);

  // Generate timeline segments based on range and zoom
  const timelineSegments = useMemo(() => {
    if (!visibleRange) return [];
    
    const [start, end] = visibleRange;
    const segments = [];
    const current = new Date(start);
    
    while (current <= end) {
      let segmentKey;
      
      if (zoomLevel === 'year') {
        segmentKey = current.getFullYear().toString();
        segments.push({
          key: segmentKey,
          date: new Date(current),
          label: current.getFullYear().toString(),
          events: groupedEvents.get(segmentKey) || []
        });
        current.setFullYear(current.getFullYear() + 1);
      } else if (zoomLevel === 'month') {
        segmentKey = `${current.getFullYear()}-${current.getMonth() + 1}`;
        segments.push({
          key: segmentKey,
          date: new Date(current),
          label: current.toLocaleDateString(undefined, { year: 'numeric', month: 'short' }),
          events: groupedEvents.get(segmentKey) || []
        });
        current.setMonth(current.getMonth() + 1);
      } else {
        segmentKey = `${current.getFullYear()}-${current.getMonth() + 1}-${current.getDate()}`;
        segments.push({
          key: segmentKey,
          date: new Date(current),
          label: current.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          events: groupedEvents.get(segmentKey) || []
        });
        current.setDate(current.getDate() + 1);
      }
    }
    
    return segments;
  }, [visibleRange, zoomLevel, groupedEvents]);

  // Zoom in/out functions
  const zoomIn = () => {
    if (zoomLevel === 'year') setZoomLevel('month');
    else if (zoomLevel === 'month') setZoomLevel('day');
  };

  const zoomOut = () => {
    if (zoomLevel === 'day') setZoomLevel('month');
    else if (zoomLevel === 'month') setZoomLevel('year');
  };

  // Navigation functions
  const moveEarlier = () => {
    if (!visibleRange) return;
    
    const [start, end] = visibleRange;
    const rangeDuration = end.getTime() - start.getTime();
    
    const newStart = new Date(start.getTime() - rangeDuration);
    const newEnd = new Date(end.getTime() - rangeDuration);
    
    setVisibleRange([newStart, newEnd]);
  };

  const moveLater = () => {
    if (!visibleRange) return;
    
    const [start, end] = visibleRange;
    const rangeDuration = end.getTime() - start.getTime();
    
    const newStart = new Date(start.getTime() + rangeDuration);
    const newEnd = new Date(end.getTime() + rangeDuration);
    
    setVisibleRange([newStart, newEnd]);
  };

  // Reset to full timeline
  const resetView = () => {
    setVisibleRange(timelineRange as [Date, Date]);
    setZoomLevel('year');
  };

  // Get event color based on importance
  const getEventColor = (importance?: 'major' | 'minor' | 'critical') => {
    switch (importance) {
      case 'critical': return 'border-red-500';
      case 'major': return 'border-yellow-500';
      case 'minor': return 'border-blue-500';
      default: return 'border-gray-500';
    }
  };

  // Handle event click
  const handleEventClick = (event: TimelineEvent) => {
    setSelectedEvent(event);
  };

  // Find location and character details for the selected event
  const eventLocations = useMemo(() => {
    if (!selectedEvent || !selectedEvent.locationIds) return [];
    
    return selectedEvent.locationIds
      .map(locId => locations.find(loc => loc._id === locId))
      .filter(Boolean) as TimelineLocation[];
  }, [selectedEvent, locations]);

  const eventCharacters = useMemo(() => {
    if (!selectedEvent || !selectedEvent.characterIds) return [];
    
    return selectedEvent.characterIds
      .map(charId => characters.find(char => char._id === charId))
      .filter(Boolean) as TimelineCharacter[];
  }, [selectedEvent, characters]);

  // If no events, show empty state
  if (events.length === 0) {
    return (
      <div className="bg-gray-800/40 rounded-xl p-8 text-center">
        <Calendar className="h-16 w-16 text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-white mb-2">No Events Yet</h3>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          Add events to your story to visualize them on a timeline. Events can be connected to characters and locations.
        </p>
        <a 
          href={`/stories/${storyId}/events/new`}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
        >
          <Calendar className="mr-2 h-5 w-5" />
          Create First Event
        </a>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/40 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Story Timeline</h2>
            <p className="text-gray-400">
              {events.length} events from {formatDate(timelineRange[0])} to {formatDate(timelineRange[1])}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={zoomOut}
              disabled={zoomLevel === 'year'}
              className={`p-2 rounded-md ${zoomLevel === 'year' ? 'text-gray-500 bg-gray-700/50' : 'text-white bg-gray-700 hover:bg-gray-600'}`}
              title="Zoom out"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </button>
            
            <button
              onClick={zoomIn}
              disabled={zoomLevel === 'day'}
              className={`p-2 rounded-md ${zoomLevel === 'day' ? 'text-gray-500 bg-gray-700/50' : 'text-white bg-gray-700 hover:bg-gray-600'}`}
              title="Zoom in"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="11" y1="8" x2="11" y2="14"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </button>
            
            <div className="h-6 border-r border-gray-600 mx-1"></div>
            
            <button
              onClick={moveEarlier}
              className="p-2 rounded-md text-white bg-gray-700 hover:bg-gray-600"
              title="Move earlier"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <button
              onClick={moveLater}
              className="p-2 rounded-md text-white bg-gray-700 hover:bg-gray-600"
              title="Move later"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            
            <div className="h-6 border-r border-gray-600 mx-1"></div>
            
            <button
              onClick={resetView}
              className="px-3 py-2 rounded-md text-white text-sm bg-gray-700 hover:bg-gray-600"
            >
              Reset View
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        {/* Timeline visualization */}
        <div className="lg:col-span-2 h-[600px] bg-gray-900/30 p-4 overflow-y-auto">
          <div className="h-full flex flex-col">
            {/* Timeline segments */}
            <div className="flex-1 overflow-y-auto">
              <div className="overflow-x-auto p-6">
                <div className="w-full min-w-[800px]">
                  <div className="grid" style={{ gridTemplateColumns: `repeat(${timelineSegments.length}, minmax(150px, 1fr))` }}>
                    {timelineSegments.map(segment => (
                      <div key={segment.key} className="border-r border-gray-700 pb-6">
                        <div className="px-4 py-2 bg-gray-700/30 border-y border-gray-700 mb-4 sticky top-0">
                          <span className="font-medium text-white">{segment.label}</span>
                          {segment.events.length > 0 && (
                            <span className="ml-2 text-sm text-gray-400">({segment.events.length})</span>
                          )}
                        </div>
                        
                        <div className="space-y-3 px-3">
                          {segment.events.map((event: TimelineEvent) => (
                            <div
                              key={event._id}
                              className={`p-3 bg-gray-700/20 hover:bg-gray-700/40 border-l-4 ${getEventColor(event.importance)} rounded cursor-pointer transition-colors`}
                              onClick={() => handleEventClick(event)}
                            >
                              <h4 className="font-medium text-white">{event.name}</h4>
                              <div className="text-xs text-gray-400 mt-1">
                                {event.locationIds?.length ? (
                                  <div className="flex items-center space-x-1 mt-1">
                                    <span className="w-3 h-3 rounded-full bg-blue-500/50"></span>
                                    <span>
                                      {event.locationIds?.slice(0, 2).map((locId: string) => {
                                        const location = locations.find(l => l._id === locId);
                                        return location ? location.name : null;
                                      }).filter(Boolean).join(', ')}
                                      {(event.locationIds?.length || 0) > 2 && '...'}
                                    </span>
                                  </div>
                                ) : null}
                                
                                {/* Rest of the event rendering */}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Event details panel */}
        <div className="p-6 bg-gray-800/60 h-[600px] overflow-y-auto">
          {selectedEvent ? (
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <h3 className="text-lg font-medium text-white">{selectedEvent.name}</h3>
              </div>
              
              <div className="mt-3 mb-5">
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                  selectedEvent.importance === 'critical' ? 'bg-red-500/20 text-red-300' :
                  selectedEvent.importance === 'major' ? 'bg-yellow-500/20 text-yellow-300' :
                  selectedEvent.importance === 'minor' ? 'bg-blue-500/20 text-blue-300' :
                  'bg-gray-500/20 text-gray-300'
                }`}>
                  {selectedEvent.importance ? `${selectedEvent.importance.charAt(0).toUpperCase()}${selectedEvent.importance.slice(1)} Event` : 'Event'}
                </span>
                
                <div className="text-white mt-4">
                  <div className="text-sm text-gray-400 mb-1">Date</div>
                  <div className="font-medium">
                    {new Date(selectedEvent.date).toLocaleDateString(undefined, 
                      { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
                    )}
                  </div>
                </div>
                
                {selectedEvent.description && (
                  <div className="mt-4">
                    <div className="text-sm text-gray-400 mb-1">Description</div>
                    <p className="text-white">{selectedEvent.description}</p>
                  </div>
                )}
              </div>
              
              {/* Location section */}
              {eventLocations.length > 0 && (
                <div className="mt-6 border-t border-gray-700 pt-4">
                  <h4 className="text-sm text-gray-400 mb-2 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Locations ({eventLocations.length})
                  </h4>
                  
                  <div className="space-y-3">
                    {eventLocations.map(location => (
                      <div key={location._id} className="bg-gray-700/50 p-3 rounded-lg">
                        <h5 className="font-medium text-white">{location.name}</h5>
                        {location.description && (
                          <p className="text-gray-300 text-sm mt-1 line-clamp-2">{location.description}</p>
                        )}
                        <a 
                          href={`/stories/${storyId}/locations/${location._id}`}
                          className="text-blue-400 text-xs mt-2 inline-block hover:underline"
                        >
                          View location
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Character section */}
              {eventCharacters.length > 0 && (
                <div className="mt-6 border-t border-gray-700 pt-4">
                  <h4 className="text-sm text-gray-400 mb-2 flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    Characters ({eventCharacters.length})
                  </h4>
                  
                  <div className="space-y-2">
                    {eventCharacters.map(character => (
                      <div key={character._id} className="flex items-center justify-between p-2 bg-gray-700/40 rounded-lg">
                        <span className="text-white">{character.name}</span>
                        <a 
                          href={`/stories/${storyId}/characters/${character._id}`}
                          className="text-blue-400 text-xs hover:underline"
                        >
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-6 flex justify-between">
                <a 
                  href={`/stories/${storyId}/events/${selectedEvent._id}`}
                  className="text-blue-400 hover:underline text-sm"
                >
                  View full details
                </a>
                
                <a 
                  href={`/stories/${storyId}/events/${selectedEvent._id}/edit`}
                  className="text-blue-400 hover:underline text-sm"
                >
                  Edit event
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Select an Event</h3>
              <p className="text-gray-400 max-w-xs">
                Click on any event in the timeline to see more details and connections.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
