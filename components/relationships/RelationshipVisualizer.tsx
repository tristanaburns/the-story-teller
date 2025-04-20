'use client';

import React, { useRef, useEffect, useState } from 'react';
import { User, MapPin, Calendar, Building, Search, X, Info } from 'lucide-react';

interface Entity {
  id: string;
  name: string;
  type: 'character' | 'location' | 'event' | 'organization';
  data?: any;
}

interface Relationship {
  source: string;
  target: string;
  type: string;
  description?: string;
}

interface RelationshipVisualizerProps {
  entities: Entity[];
  relationships: Relationship[];
  onEntityClick?: (entity: Entity) => void;
  onRelationshipClick?: (relationship: Relationship) => void;
}

export default function RelationshipVisualizer({
  entities,
  relationships,
  onEntityClick,
  onRelationshipClick
}: RelationshipVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntityIds, setSelectedEntityIds] = useState<Set<string>>(new Set());
  const [highlightedRelationshipIndex, setHighlightedRelationshipIndex] = useState<number | null>(null);
  const [infoVisible, setInfoVisible] = useState(false);
  
  // Filter entities based on search term
  const filteredEntities = searchTerm 
    ? entities.filter(entity => 
        entity.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : entities;
  
  // Selected and filtered entities
  const displayedEntities = selectedEntityIds.size > 0
    ? entities.filter(entity => selectedEntityIds.has(entity.id))
    : filteredEntities;
  
  // Filter relationships to only include selected entities
  const displayedRelationships = relationships.filter(rel => 
    displayedEntities.some(e => e.id === rel.source) && 
    displayedEntities.some(e => e.id === rel.target)
  );

  // Draw the relationship visualization
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    
    // Get dimensions
    const svg = svgRef.current;
    const width = containerRef.current.clientWidth;
    const height = 600; // Fixed height
    
    // Clear previous content
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }
    
    // Set SVG attributes
    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(height));
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    
    // If no entities to display, show a message
    if (displayedEntities.length === 0) {
      const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textElement.setAttribute('x', String(width / 2));
      textElement.setAttribute('y', String(height / 2));
      textElement.setAttribute('text-anchor', 'middle');
      textElement.setAttribute('dominant-baseline', 'middle');
      textElement.setAttribute('fill', '#9CA3AF');
      textElement.textContent = 'No entities to display';
      svg.appendChild(textElement);
      return;
    }
    
    // Create a defs element for arrow markers
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svg.appendChild(defs);
    
    // Create arrow marker for relationship lines
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('viewBox', '0 0 10 10');
    marker.setAttribute('refX', '32');
    marker.setAttribute('refY', '5');
    marker.setAttribute('markerWidth', '6');
    marker.setAttribute('markerHeight', '6');
    marker.setAttribute('orient', 'auto');
    
    const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arrowPath.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
    arrowPath.setAttribute('fill', '#6B7280');
    marker.appendChild(arrowPath);
    defs.appendChild(marker);
    
    // Create a highlighted arrow marker
    const highlightedMarker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    highlightedMarker.setAttribute('id', 'highlighted-arrowhead');
    highlightedMarker.setAttribute('viewBox', '0 0 10 10');
    highlightedMarker.setAttribute('refX', '32');
    highlightedMarker.setAttribute('refY', '5');
    highlightedMarker.setAttribute('markerWidth', '6');
    highlightedMarker.setAttribute('markerHeight', '6');
    highlightedMarker.setAttribute('orient', 'auto');
    
    const highlightedArrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    highlightedArrowPath.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
    highlightedArrowPath.setAttribute('fill', '#3B82F6');
    highlightedMarker.appendChild(highlightedArrowPath);
    defs.appendChild(highlightedMarker);
    
    // Generate entity positions in a circle
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;
    
    const entityPositions = new Map<string, {x: number, y: number}>();
    
    displayedEntities.forEach((entity, index) => {
      const angle = (2 * Math.PI * index) / displayedEntities.length;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      entityPositions.set(entity.id, {x, y});
    });
    
    // Draw relationship lines
    displayedRelationships.forEach((relationship, index) => {
      const sourcePos = entityPositions.get(relationship.source);
      const targetPos = entityPositions.get(relationship.target);
      
      if (sourcePos && targetPos) {
        // Calculate direction vector
        const dx = targetPos.x - sourcePos.x;
        const dy = targetPos.y - sourcePos.y;
        
        // Normalize the vector
        const length = Math.sqrt(dx * dx + dy * dy);
        const nx = dx / length;
        const ny = dy / length;
        
        // Calculate start and end points (offset from center of nodes)
        const nodeRadius = 30;
        const startX = sourcePos.x + nx * nodeRadius;
        const startY = sourcePos.y + ny * nodeRadius;
        const endX = targetPos.x - nx * nodeRadius;
        const endY = targetPos.y - ny * nodeRadius;
        
        // Create relationship group
        const relationshipGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        relationshipGroup.setAttribute('class', 'relationship');
        relationshipGroup.setAttribute('data-index', String(index));
        
        // Create the line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', String(startX));
        line.setAttribute('y1', String(startY));
        line.setAttribute('x2', String(endX));
        line.setAttribute('y2', String(endY));
        line.setAttribute('stroke', highlightedRelationshipIndex === index ? '#3B82F6' : '#6B7280');
        line.setAttribute('stroke-width', highlightedRelationshipIndex === index ? '3' : '2');
        line.setAttribute('marker-end', highlightedRelationshipIndex === index ? 'url(#highlighted-arrowhead)' : 'url(#arrowhead)');
        
        // Add invisible wider line for better click detection
        const clickableLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        clickableLine.setAttribute('x1', String(startX));
        clickableLine.setAttribute('y1', String(startY));
        clickableLine.setAttribute('x2', String(endX));
        clickableLine.setAttribute('y2', String(endY));
        clickableLine.setAttribute('stroke', 'transparent');
        clickableLine.setAttribute('stroke-width', '10');
        clickableLine.style.cursor = 'pointer';
        
        // Add event listeners
        clickableLine.addEventListener('mouseover', () => {
          setHighlightedRelationshipIndex(index);
        });
        
        clickableLine.addEventListener('mouseout', () => {
          setHighlightedRelationshipIndex(null);
        });
        
        clickableLine.addEventListener('click', () => {
          if (onRelationshipClick) {
            onRelationshipClick(relationship);
          }
        });
        
        // Add relationship type label
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        
        // Create a background for the text
        const textBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        textBg.setAttribute('x', String(midX - 40));
        textBg.setAttribute('y', String(midY - 10));
        textBg.setAttribute('width', '80');
        textBg.setAttribute('height', '20');
        textBg.setAttribute('rx', '4');
        textBg.setAttribute('fill', highlightedRelationshipIndex === index ? '#3B82F680' : '#37415180');
        
        const relationshipText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        relationshipText.setAttribute('x', String(midX));
        relationshipText.setAttribute('y', String(midY + 5));
        relationshipText.setAttribute('text-anchor', 'middle');
        relationshipText.setAttribute('fill', highlightedRelationshipIndex === index ? '#FFFFFF' : '#9CA3AF');
        relationshipText.setAttribute('font-size', '12');
        relationshipText.textContent = relationship.type;
        
        // Add elements to the group
        relationshipGroup.appendChild(line);
        relationshipGroup.appendChild(textBg);
        relationshipGroup.appendChild(relationshipText);
        relationshipGroup.appendChild(clickableLine);
        
        // Add the group to the SVG
        svg.appendChild(relationshipGroup);
      }
    });
    
    // Draw entity nodes
    displayedEntities.forEach(entity => {
      const pos = entityPositions.get(entity.id);
      if (!pos) return;
      
      // Create entity group
      const entityGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      entityGroup.setAttribute('class', 'entity');
      entityGroup.setAttribute('data-id', entity.id);
      entityGroup.style.cursor = 'pointer';
      
      if (onEntityClick) {
        entityGroup.addEventListener('click', () => {
          onEntityClick(entity);
        });
      }
      
      // Create entity circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String(pos.x));
      circle.setAttribute('cy', String(pos.y));
      circle.setAttribute('r', '30');
      
      // Set color based on entity type
      let fill = '#4B5563';
      if (entity.type === 'character') fill = '#3B82F6';
      else if (entity.type === 'location') fill = '#10B981';
      else if (entity.type === 'event') fill = '#F59E0B';
      else if (entity.type === 'organization') fill = '#8B5CF6';
      
      circle.setAttribute('fill', fill);
      circle.setAttribute('stroke', '#1F2937');
      circle.setAttribute('stroke-width', '2');
      
      // Create entity icon
      let iconPath = '';
      if (entity.type === 'character') {
        // User icon
        iconPath = 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z';
      } else if (entity.type === 'location') {
        // MapPin icon
        iconPath = 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z';
      } else if (entity.type === 'event') {
        // Calendar icon
        iconPath = 'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5v-5z';
      } else if (entity.type === 'organization') {
        // Building icon
        iconPath = 'M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z';
      }
      
      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      icon.setAttribute('d', iconPath);
      icon.setAttribute('fill', 'white');
      icon.setAttribute('transform', `translate(${pos.x - 12}, ${pos.y - 12}) scale(0.5)`);
      
      // Create entity label
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', String(pos.x));
      label.setAttribute('y', String(pos.y + 45));
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('fill', 'white');
      label.setAttribute('font-size', '14');
      label.textContent = entity.name;
      
      // Add a background for the text
      const labelBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      const labelWidth = entity.name.length * 8 + 10; // Approximate width based on text length
      labelBg.setAttribute('x', String(pos.x - labelWidth / 2));
      labelBg.setAttribute('y', String(pos.y + 32));
      labelBg.setAttribute('width', String(labelWidth));
      labelBg.setAttribute('height', '24');
      labelBg.setAttribute('rx', '4');
      labelBg.setAttribute('fill', '#1F2937');
      
      // Add all elements to the group
      entityGroup.appendChild(labelBg);
      entityGroup.appendChild(circle);
      entityGroup.appendChild(icon);
      entityGroup.appendChild(label);
      
      // Add the entity group to the SVG
      svg.appendChild(entityGroup);
    });
  }, [displayedEntities, displayedRelationships, highlightedRelationshipIndex, onEntityClick, onRelationshipClick]);

  // Toggle entity selection
  const toggleEntitySelection = (entityId: string) => {
    setSelectedEntityIds(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(entityId)) {
        newSelected.delete(entityId);
      } else {
        newSelected.add(entityId);
      }
      return newSelected;
    });
  };

  // Clear all selected entities
  const clearSelection = () => {
    setSelectedEntityIds(new Set());
    setSearchTerm('');
  };

  // Get entity icon based on type
  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'character': return <User className="h-4 w-4" />;
      case 'location': return <MapPin className="h-4 w-4" />;
      case 'event': return <Calendar className="h-4 w-4" />;
      case 'organization': return <Building className="h-4 w-4" />;
      default: return null;
    }
  };

  // Get entity color based on type
  const getEntityColor = (type: string) => {
    switch (type) {
      case 'character': return 'bg-blue-500 text-blue-100';
      case 'location': return 'bg-green-500 text-green-100';
      case 'event': return 'bg-yellow-500 text-yellow-100';
      case 'organization': return 'bg-purple-500 text-purple-100';
      default: return 'bg-gray-500 text-gray-100';
    }
  };

  return (
    <div className="bg-gray-800/40 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Entity Relationships</h2>
          <button
            className="p-1 text-gray-400 hover:text-white"
            onClick={() => setInfoVisible(!infoVisible)}
            title="Show information"
          >
            <Info className="h-5 w-5" />
          </button>
        </div>
        
        {infoVisible && (
          <div className="mt-4 p-4 bg-gray-700/50 rounded-lg text-gray-200 text-sm">
            <h3 className="font-medium mb-2">How to use this visualization:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Search or select entities to filter the visualization</li>
              <li>Click on entities to view more details</li>
              <li>Hover over relationships to highlight connections</li>
              <li>Different colors represent different entity types</li>
            </ul>
          </div>
        )}
      </div>
      
      <div className="p-4 border-b border-gray-700 bg-gray-800/60">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search entities..."
              className="pl-10 w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
            {searchTerm && (
              <button
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-5 w-5 text-gray-400 hover:text-white" />
              </button>
            )}
          </div>
          
          {selectedEntityIds.size > 0 && (
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center"
              onClick={clearSelection}
            >
              <X className="h-4 w-4 mr-1" />
              Clear Selection ({selectedEntityIds.size})
            </button>
          )}
        </div>
        
        {/* Entity type filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          {['character', 'location', 'event', 'organization'].map(type => {
            const count = entities.filter(e => e.type === type).length;
            return count > 0 ? (
              <div
                key={type}
                className={`px-3 py-1.5 rounded-full text-xs flex items-center ${getEntityColor(type)}`}
              >
                {getEntityIcon(type)}
                <span className="ml-1 capitalize">{type}s ({count})</span>
              </div>
            ) : null;
          })}
        </div>
        
        {/* Entity list */}
        <div className="mt-4 flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2">
          {filteredEntities.map(entity => (
            <button
              key={entity.id}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center transition-colors border ${
                selectedEntityIds.has(entity.id)
                  ? `${getEntityColor(entity.type)} border-white`
                  : `bg-gray-700 text-white border-gray-600 hover:bg-gray-600`
              }`}
              onClick={() => toggleEntitySelection(entity.id)}
            >
              {getEntityIcon(entity.type)}
              <span className="ml-1">{entity.name}</span>
            </button>
          ))}
          
          {filteredEntities.length === 0 && searchTerm && (
            <div className="w-full text-center text-gray-400 py-2">
              No entities found matching "{searchTerm}"
            </div>
          )}
        </div>
      </div>
      
      {/* Visualization area */}
      <div ref={containerRef} className="bg-gray-900/30 relative">
        <svg
          ref={svgRef}
          className="w-full"
          style={{ minHeight: '600px' }}
        ></svg>
      </div>
    </div>
  );
}
