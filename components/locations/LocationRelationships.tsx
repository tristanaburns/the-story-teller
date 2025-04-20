'use client';

import React, { useRef, useEffect, useState } from 'react';
import { User, MapPin, Calendar, Building } from 'lucide-react';

interface Character {
  _id: string;
  id?: string;
  name: string;
  type?: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
}

interface Location {
  _id: string;
  id?: string;
  name: string;
}

interface Event {
  _id: string;
  id?: string;
  name: string;
  date?: string;
  description?: string;
}

interface Organization {
  _id: string;
  id?: string;
  name: string;
  type?: string;
}

interface Relationship {
  source: string;
  target: string;
  type: string;
  description?: string;
}

interface EntityNode {
  id: string;
  name: string;
  type: 'character' | 'location' | 'event' | 'organization';
  data: Character | Location | Event | Organization;
}

interface LocationRelationshipsProps {
  locationId: string;
  characters: Character[];
  locations: Location[];
  events: Event[];
  organizations: Organization[];
  relationships: Relationship[];
}

export default function LocationRelationships({
  locationId,
  characters,
  locations,
  events,
  organizations,
  relationships
}: LocationRelationshipsProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedEntity, setSelectedEntity] = useState<EntityNode | null>(null);
  
  // Prepare data for visualization
  const nodes: EntityNode[] = [
    ...characters.map(char => ({
      id: char._id,
      name: char.name,
      type: 'character' as const,
      data: char
    })),
    ...locations.map(loc => ({
      id: loc._id,
      name: loc.name,
      type: 'location' as const,
      data: loc
    })),
    ...events.map(event => ({
      id: event._id,
      name: event.name,
      type: 'event' as const,
      data: event
    })),
    ...organizations.map(org => ({
      id: org._id,
      name: org.name,
      type: 'organization' as const,
      data: org
    }))
  ];
  
  // Filter relationships to only show those connected to this location
  const relevantRelationships = relationships.filter(rel => 
    rel.source === locationId || rel.target === locationId
  );
  
  // Get all entities connected to this location
  const connectedEntityIds = new Set<string>();
  relevantRelationships.forEach(rel => {
    if (rel.source === locationId) {
      connectedEntityIds.add(rel.target);
    } else if (rel.target === locationId) {
      connectedEntityIds.add(rel.source);
    }
  });
  
  // Filter nodes to only show the location itself and connected entities
  const relevantNodes = nodes.filter(node => 
    node.id === locationId || connectedEntityIds.has(node.id)
  );
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = svgRef.current;
    const svgWidth = svg.clientWidth;
    const svgHeight = svg.clientHeight;
    
    // Clear previous content
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }
    
    // If no relationships, show a message
    if (relevantRelationships.length === 0) {
      const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textElement.setAttribute('x', String(svgWidth / 2));
      textElement.setAttribute('y', String(svgHeight / 2));
      textElement.setAttribute('text-anchor', 'middle');
      textElement.setAttribute('dominant-baseline', 'middle');
      textElement.setAttribute('fill', '#9CA3AF');
      textElement.textContent = 'No relationships to display';
      svg.appendChild(textElement);
      return;
    }
    
    // Create a simple force-directed layout
    // For a real implementation, you would use D3.js or a similar library
    const centerX = svgWidth / 2;
    const centerY = svgHeight / 2;
    const radius = Math.min(svgWidth, svgHeight) * 0.4;
    
    // Position nodes in a circle around the center
    const nodePositions = new Map<string, {x: number, y: number}>();
    
    // Position the location node in the center
    const locationNode = relevantNodes.find(node => node.id === locationId);
    if (locationNode) {
      nodePositions.set(locationNode.id, {x: centerX, y: centerY});
    }
    
    // Position other nodes in a circle around the location
    const otherNodes = relevantNodes.filter(node => node.id !== locationId);
    otherNodes.forEach((node, index) => {
      const angle = (2 * Math.PI * index) / otherNodes.length;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      nodePositions.set(node.id, {x, y});
    });
    
    // Create a defs element for arrow markers
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svg.appendChild(defs);
    
    // Create arrow marker for relationship lines
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('viewBox', '0 0 10 10');
    marker.setAttribute('refX', '8');
    marker.setAttribute('refY', '5');
    marker.setAttribute('markerWidth', '6');
    marker.setAttribute('markerHeight', '6');
    marker.setAttribute('orient', 'auto');
    
    const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arrowPath.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
    arrowPath.setAttribute('fill', '#6B7280');
    marker.appendChild(arrowPath);
    defs.appendChild(marker);
    
    // Draw relationship lines
    relevantRelationships.forEach(rel => {
      const sourcePos = nodePositions.get(rel.source);
      const targetPos = nodePositions.get(rel.target);
      
      if (sourcePos && targetPos) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', String(sourcePos.x));
        line.setAttribute('y1', String(sourcePos.y));
        line.setAttribute('x2', String(targetPos.x));
        line.setAttribute('y2', String(targetPos.y));
        line.setAttribute('stroke', '#6B7280');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('marker-end', 'url(#arrowhead)');
        
        // Add relationship type as text on the line
        const midX = (sourcePos.x + targetPos.x) / 2;
        const midY = (sourcePos.y + targetPos.y) / 2;
        
        const relText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        relText.setAttribute('x', String(midX));
        relText.setAttribute('y', String(midY - 10));
        relText.setAttribute('text-anchor', 'middle');
        relText.setAttribute('fill', '#9CA3AF');
        relText.setAttribute('font-size', '12');
        relText.textContent = rel.type;
        
        svg.appendChild(line);
        svg.appendChild(relText);
      }
    });
    
    // Draw nodes
    relevantNodes.forEach(node => {
      const pos = nodePositions.get(node.id);
      if (!pos) return;
      
      // Create node group
      const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      nodeGroup.setAttribute('class', 'node');
      nodeGroup.setAttribute('data-id', node.id);
      nodeGroup.addEventListener('click', () => setSelectedEntity(node));
      
      // Create node circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String(pos.x));
      circle.setAttribute('cy', String(pos.y));
      circle.setAttribute('r', node.id === locationId ? '30' : '25');
      
      // Set color based on node type
      let fill = '#4B5563';
      if (node.type === 'character') fill = '#3B82F6';
      else if (node.type === 'location') fill = '#10B981';
      else if (node.type === 'event') fill = '#F59E0B';
      else if (node.type === 'organization') fill = '#8B5CF6';
      
      circle.setAttribute('fill', fill);
      circle.setAttribute('stroke', '#1F2937');
      circle.setAttribute('stroke-width', '2');
      
      // Create node icon
      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      icon.setAttribute('x', String(pos.x));
      icon.setAttribute('y', String(pos.y + 5));
      icon.setAttribute('text-anchor', 'middle');
      icon.setAttribute('dominant-baseline', 'middle');
      icon.setAttribute('fill', 'white');
      icon.setAttribute('font-size', '16');
      
      // Set icon based on node type
      if (node.type === 'character') icon.textContent = '👤';
      else if (node.type === 'location') icon.textContent = '📍';
      else if (node.type === 'event') icon.textContent = '📅';
      else if (node.type === 'organization') icon.textContent = '🏢';
      
      // Create node label
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', String(pos.x));
      label.setAttribute('y', String(pos.y + 45));
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('fill', 'white');
      label.setAttribute('font-size', '14');
      label.textContent = node.name;
      
      // Add all elements to the group
      nodeGroup.appendChild(circle);
      nodeGroup.appendChild(icon);
      nodeGroup.appendChild(label);
      
      // Add the node group to the SVG
      svg.appendChild(nodeGroup);
    });
  }, [locationId, relevantNodes, relevantRelationships]);
  
  const getEntityTypeLabel = (type: string) => {
    switch (type) {
      case 'character': return 'Character';
      case 'location': return 'Location';
      case 'event': return 'Event';
      case 'organization': return 'Organization';
      default: return 'Entity';
    }
  };
  
  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'character': return <User className="h-5 w-5 text-blue-400" />;
      case 'location': return <MapPin className="h-5 w-5 text-green-400" />;
      case 'event': return <Calendar className="h-5 w-5 text-yellow-400" />;
      case 'organization': return <Building className="h-5 w-5 text-purple-400" />;
      default: return null;
    }
  };
  
  return (
    <div className="w-full rounded-xl bg-gray-800/40 overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">Entity Relationships</h2>
        <p className="text-gray-400 mt-1">
          Visualizing connections between this location and other elements in your story.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        {/* Relationship visualization */}
        <div className="lg:col-span-2 h-[600px] bg-gray-900/30 p-4">
          <svg
            ref={svgRef}
            className="w-full h-full"
            viewBox="0 0 800 600"
            preserveAspectRatio="xMidYMid meet"
          />
        </div>
        
        {/* Details panel */}
        <div className="p-6 bg-gray-800/60 h-[600px] overflow-y-auto">
          {selectedEntity ? (
            <div>
              <div className="flex items-center gap-2 mb-4">
                {getEntityIcon(selectedEntity.type)}
                <h3 className="text-lg font-medium text-white">{selectedEntity.name}</h3>
              </div>
              
              <div className="mb-4">
                <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300">
                  {getEntityTypeLabel(selectedEntity.type)}
                </span>
              </div>
              
              {selectedEntity.type === 'character' && (
                <div className="space-y-3">
                  {(selectedEntity.data as Character).type && (
                    <div>
                      <h4 className="text-sm text-gray-400">Character Type</h4>
                      <p className="text-white capitalize">{(selectedEntity.data as Character).type}</p>
                    </div>
                  )}
                </div>
              )}
              
              {selectedEntity.type === 'event' && (
                <div className="space-y-3">
                  {(selectedEntity.data as Event).date && (
                    <div>
                      <h4 className="text-sm text-gray-400">Date</h4>
                      <p className="text-white">{(selectedEntity.data as Event).date}</p>
                    </div>
                  )}
                  
                  {(selectedEntity.data as Event).description && (
                    <div>
                      <h4 className="text-sm text-gray-400">Description</h4>
                      <p className="text-white">{(selectedEntity.data as Event).description}</p>
                    </div>
                  )}
                </div>
              )}
              
              {selectedEntity.type === 'organization' && (
                <div className="space-y-3">
                  {(selectedEntity.data as Organization).type && (
                    <div>
                      <h4 className="text-sm text-gray-400">Organization Type</h4>
                      <p className="text-white">{(selectedEntity.data as Organization).type}</p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="mt-6">
                <h4 className="text-sm text-gray-400 mb-2">Relationships</h4>
                <div className="space-y-2">
                  {relevantRelationships
                    .filter(rel => 
                      rel.source === selectedEntity.id || rel.target === selectedEntity.id
                    )
                    .map((rel, index) => {
                      const isSource = rel.source === selectedEntity.id;
                      const otherEntityId = isSource ? rel.target : rel.source;
                      const otherEntity = nodes.find(node => node.id === otherEntityId);
                      
                      return (
                        <div key={index} className="bg-gray-700/50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {otherEntity && getEntityIcon(otherEntity.type)}
                              <span className="text-white">
                                {otherEntity ? otherEntity.name : 'Unknown Entity'}
                              </span>
                            </div>
                            <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300">
                              {isSource ? 'To' : 'From'}
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-gray-300">
                            <span className="text-gray-400">Relationship: </span>
                            {rel.type}
                          </div>
                          {rel.description && (
                            <div className="mt-1 text-sm text-gray-300">
                              <span className="text-gray-400">Details: </span>
                              {rel.description}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                  {relevantRelationships.filter(rel => 
                    rel.source === selectedEntity.id || rel.target === selectedEntity.id
                  ).length === 0 && (
                    <p className="text-gray-400 italic">No direct relationships defined.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <MapPin className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Select an Entity</h3>
              <p className="text-gray-400 max-w-xs">
                Click on any entity in the visualization to see more details about its relationships.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
