'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

interface Character {
  _id: string;
  id: string;
  name: string;
  type?: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
}

interface Relationship {
  source: string;
  target: string;
  type: string;
  dynamics?: string;
}

interface CharacterRelationshipsProps {
  characters: Character[];
  relationships: Relationship[];
}

// Extend d3's SimulationNodeDatum to include our custom properties
interface CustomNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type?: string;
  color?: string;
  radius?: number;
}

type Link = d3.SimulationLinkDatum<CustomNode> & {
  source: string | CustomNode;
  target: string | CustomNode;
  type: string;
  dynamics?: string;
};

export default function CharacterRelationships({ characters, relationships }: CharacterRelationshipsProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const [hoveredNode, setHoveredNode] = useState<CustomNode | null>(null);
  const [hoveredLink, setHoveredLink] = useState<Link | null>(null);

  // Colors for different character types
  const characterColors = {
    protagonist: '#3b82f6', // blue
    antagonist: '#8b5cf6',  // purple
    supporting: '#f59e0b',  // amber
    minor: '#6b7280'        // gray
  };

  // Colors for different relationship types
  const relationshipColors = {
    family: '#ef4444',      // red
    friend: '#10b981',      // green
    ally: '#3b82f6',        // blue
    enemy: '#f43f5e',       // pink
    romantic: '#ec4899',    // pink
    professional: '#6366f1', // indigo
    mentor: '#8b5cf6',      // purple
    other: '#6b7280'        // gray
  };

  useEffect(() => {
    if (!svgRef.current || !characters.length) return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();

    // Get container dimensions
    const containerWidth = svgRef.current.parentElement?.clientWidth || 600;
    const containerHeight = Math.max(400, containerWidth * 0.6); // Aim for a 5:3 aspect ratio
    setDimensions({ width: containerWidth, height: containerHeight });

    // Set SVG dimensions
    const svg = d3.select(svgRef.current)
      .attr('width', containerWidth)
      .attr('height', containerHeight)
      .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`);

    // Prepare data for D3
    const nodes: CustomNode[] = characters.map(char => ({
      id: char.id,
      name: char.name,
      type: char.type,
      color: char.type ? characterColors[char.type] : characterColors.minor,
      radius: char.type === 'protagonist' || char.type === 'antagonist' ? 15 : 10,
      x: undefined,
      y: undefined
    }));

    // Create links from relationships
    const links: Link[] = relationships.map(rel => ({
      source: rel.source,
      target: rel.target,
      type: rel.type || 'other',
      dynamics: rel.dynamics
    }));

    // Create the force simulation
    const simulation = d3.forceSimulation<CustomNode, Link>(nodes)
      .force('link', d3.forceLink<CustomNode, Link>(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force('collision', d3.forceCollide<CustomNode>().radius(d => (d.radius || 10) + 10));

    // Create a container for links and nodes with zoom capability
    const g = svg.append('g');

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create links
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke-width', 2)
      .attr('stroke', d => relationshipColors[d.type as keyof typeof relationshipColors] || '#6b7280')
      .attr('stroke-opacity', 0.6)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('stroke-width', 4)
          .attr('stroke-opacity', 1);
        setHoveredLink(d);
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('stroke-width', 2)
          .attr('stroke-opacity', 0.6);
        setHoveredLink(null);
      });

    // Create nodes
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .call(d3.drag<SVGGElement, CustomNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))
      .on('mouseover', function(event, d) {
        d3.select(this).select('circle')
          .attr('stroke-width', 3);
        setHoveredNode(d);
      })
      .on('mouseout', function() {
        d3.select(this).select('circle')
          .attr('stroke-width', 1.5);
        setHoveredNode(null);
      });

    // Add circles for nodes
    node.append('circle')
      .attr('r', d => d.radius || 10)
      .attr('fill', d => d.color || '#6b7280')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5);

    // Add text labels for nodes
    node.append('text')
      .attr('dx', d => (d.radius || 10) + 5)
      .attr('dy', '.35em')
      .attr('font-size', '12px')
      .attr('font-weight', d => d.type === 'protagonist' || d.type === 'antagonist' ? 'bold' : 'normal')
      .attr('fill', '#fff')
      .text(d => d.name);

    // Set up the simulation
    simulation.nodes(nodes)
      .on('tick', ticked);

    if (simulation.force('link')) {
      (simulation.force('link') as d3.ForceLink<CustomNode, Link>).links(links);
    }

    // Function to update positions on each simulation tick
    function ticked() {
      link
        .attr('x1', d => (d.source as CustomNode).x!)
        .attr('y1', d => (d.source as CustomNode).y!)
        .attr('x2', d => (d.target as CustomNode).x!)
        .attr('y2', d => (d.target as CustomNode).y!);

      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    }

    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGGElement, CustomNode, CustomNode>, d: CustomNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, CustomNode, CustomNode>, d: CustomNode) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, CustomNode, CustomNode>, d: CustomNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Clean up simulation when component unmounts
    return () => {
      simulation.stop();
    };
  }, [characters, relationships, dimensions, characterColors, relationshipColors]);

  return (
    <div className="bg-gray-800/40 p-4 rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">Character Relationships</h3>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
            <span className="text-gray-300">Protagonist</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-purple-500 mr-1"></span>
            <span className="text-gray-300">Antagonist</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-amber-500 mr-1"></span>
            <span className="text-gray-300">Supporting</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-gray-500 mr-1"></span>
            <span className="text-gray-300">Minor</span>
          </div>
        </div>
      </div>
      
      <div className="relative">
        <svg ref={svgRef} className="w-full" />
        
        {(hoveredNode || hoveredLink) && (
          <div className="absolute bottom-4 left-4 bg-gray-900/90 p-3 rounded shadow-lg text-white text-sm max-w-xs">
            {hoveredNode && (
              <div>
                <div className="font-bold">{hoveredNode.name}</div>
                {hoveredNode.type && (
                  <div className="text-gray-300 capitalize">{hoveredNode.type}</div>
                )}
              </div>
            )}
            
            {hoveredLink && (
              <div>
                <div className="font-medium capitalize">{hoveredLink.type} Relationship</div>
                {hoveredLink.dynamics && (
                  <div className="text-gray-300">{hoveredLink.dynamics}</div>
                )}
                <div className="text-gray-400 text-xs mt-1">
                  {typeof hoveredLink.source === 'object' ? hoveredLink.source.name : ''} →
                  {typeof hoveredLink.target === 'object' ? hoveredLink.target.name : ''}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-4 text-xs text-gray-400">
        <p>Drag nodes to reposition. Hover over nodes or connections for details.</p>
      </div>
    </div>
  );
}