import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CharacterRelationships from '@/components/characters/CharacterRelationships';

// Fully mock D3 instead of using requireActual
jest.mock('d3', () => ({
  select: jest.fn(() => ({
    selectAll: jest.fn(() => ({
      remove: jest.fn()
    })),
    attr: jest.fn().mockReturnThis(),
    call: jest.fn().mockReturnThis(),
    append: jest.fn(() => ({
      attr: jest.fn().mockReturnThis(),
      selectAll: jest.fn(() => ({
        data: jest.fn().mockReturnThis(),
        enter: jest.fn().mockReturnThis(),
        append: jest.fn(() => ({
          attr: jest.fn().mockReturnThis(),
          on: jest.fn().mockReturnThis(),
          text: jest.fn().mockReturnThis(),
          call: jest.fn().mockReturnThis()
        }))
      }))
    }))
  })),
  forceSimulation: jest.fn(() => ({
    force: jest.fn().mockReturnThis(),
    nodes: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    alphaTarget: jest.fn().mockReturnThis(),
    restart: jest.fn().mockReturnThis(),
    stop: jest.fn()
  })),
  forceLink: jest.fn(() => ({
    id: jest.fn().mockReturnThis(),
    distance: jest.fn().mockReturnThis(),
    links: jest.fn()
  })),
  forceManyBody: jest.fn(() => ({
    strength: jest.fn()
  })),
  forceCenter: jest.fn(),
  forceCollide: jest.fn(() => ({
    radius: jest.fn()
  })),
  drag: jest.fn(() => ({
    on: jest.fn().mockReturnThis()
  })),
  zoom: jest.fn(() => ({
    scaleExtent: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis()
  }))
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe('CharacterRelationships Component', () => {
  // Mock Element.getBoundingClientRect to return fixed dimensions
  const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
  
  beforeAll(() => {
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      width: 600,
      height: 400,
      top: 0,
      left: 0,
      bottom: 400,
      right: 600,
      x: 0,
      y: 0,
      toJSON: () => {}
    }));
  });
  
  afterAll(() => {
    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });
  
  const mockCharacters = [
    { _id: 'char1', id: 'char1', name: 'John Doe', type: 'protagonist' as const },
    { _id: 'char2', id: 'char2', name: 'Jane Smith', type: 'supporting' as const },
    { _id: 'char3', id: 'char3', name: 'Villain', type: 'antagonist' as const }
  ];
  
  const mockRelationships = [
    { source: 'char1', target: 'char2', type: 'friend', dynamics: 'Close friends' },
    { source: 'char1', target: 'char3', type: 'enemy', dynamics: 'Arch nemesis' },
    { source: 'char2', target: 'char3', type: 'family', dynamics: 'Siblings' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component with appropriate title', () => {
    render(
      <CharacterRelationships 
        characters={mockCharacters} 
        relationships={mockRelationships}
      />
    );
    
    expect(screen.getByText('Character Relationships')).toBeInTheDocument();
  });

  it('renders the legend for character types', () => {
    render(
      <CharacterRelationships 
        characters={mockCharacters} 
        relationships={mockRelationships}
      />
    );
    
    // Check that the legend for different character types is rendered
    expect(screen.getByText('Protagonist')).toBeInTheDocument();
    expect(screen.getByText('Antagonist')).toBeInTheDocument();
    expect(screen.getByText('Supporting')).toBeInTheDocument();
    expect(screen.getByText('Minor')).toBeInTheDocument();
  });

  it('renders the relationship info panel with no active relationship initially', () => {
    render(
      <CharacterRelationships 
        characters={mockCharacters} 
        relationships={mockRelationships}
      />
    );
    
    expect(screen.getByText('Hover over nodes or connections for details')).toBeInTheDocument();
  });
  
  it('renders an SVG element for the visualization', () => {
    render(
      <CharacterRelationships 
        characters={mockCharacters} 
        relationships={mockRelationships}
      />
    );
    
    const svgElement = document.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('handles empty characters array', () => {
    render(
      <CharacterRelationships 
        characters={[]} 
        relationships={[]}
      />
    );
    
    expect(screen.getByText('Character Relationships')).toBeInTheDocument();
    expect(screen.getByText('No character relationships to display')).toBeInTheDocument();
  });
  
  it('renders correctly with characters but no relationships', () => {
    render(
      <CharacterRelationships 
        characters={mockCharacters} 
        relationships={[]}
      />
    );
    
    expect(screen.getByText('Character Relationships')).toBeInTheDocument();
    // Should show a message for no relationships
    expect(screen.getByText('No relationships defined between characters')).toBeInTheDocument();
  });
}); 