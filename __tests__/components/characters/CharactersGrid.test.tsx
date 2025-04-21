import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CharactersGrid from '@/components/characters/CharactersGrid';

// Mock CharacterCard component to simplify testing
jest.mock('@/components/characters/CharacterCard', () => {
  return ({ character, onDelete }: any) => (
    <div data-testid={`character-card-${character._id}`} className="mocked-character-card">
      <h3>{character.name}</h3>
      {character.type && <span data-testid="character-type">{character.type}</span>}
      {character.status && <span data-testid="character-status">{character.status}</span>}
      {onDelete && (
        <button 
          data-testid={`delete-button-${character._id}`}
          onClick={() => onDelete(character._id)}
        >
          Delete
        </button>
      )}
    </div>
  );
});

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href} data-testid="mock-link">{children}</a>;
  };
});

describe('CharactersGrid Component', () => {
  const mockStoryId = 'story123';
  const mockOnDelete = jest.fn();
  
  const mockCharacters = [
    {
      _id: 'char1',
      id: 'char1',
      storyId: mockStoryId,
      name: 'John Doe',
      type: 'protagonist' as const,
      status: 'alive' as const,
      description: 'A brave hero'
    },
    {
      _id: 'char2',
      id: 'char2',
      storyId: mockStoryId,
      name: 'Jane Smith',
      type: 'supporting' as const,
      status: 'alive' as const,
      description: 'A loyal friend'
    },
    {
      _id: 'char3',
      id: 'char3',
      storyId: mockStoryId,
      name: 'Villain',
      type: 'antagonist' as const,
      status: 'deceased' as const,
      description: 'An evil mastermind'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders character cards for all characters', () => {
    render(
      <CharactersGrid 
        characters={mockCharacters} 
        storyId={mockStoryId}
        onDelete={mockOnDelete} 
      />
    );
    
    // All three characters should be rendered
    expect(screen.getByTestId('character-card-char1')).toBeInTheDocument();
    expect(screen.getByTestId('character-card-char2')).toBeInTheDocument();
    expect(screen.getByTestId('character-card-char3')).toBeInTheDocument();
    
    // Should show the character count
    expect(screen.getByText('3 characters')).toBeInTheDocument();
  });

  it('renders empty state for no characters', () => {
    render(
      <CharactersGrid 
        characters={[]} 
        storyId={mockStoryId}
        onDelete={mockOnDelete} 
      />
    );
    
    // Should show the empty state message
    expect(screen.getByText('No characters yet')).toBeInTheDocument();
    expect(screen.getByText('Start building your story world by creating your first character')).toBeInTheDocument();
    
    // Should have a link to create a character
    const createLink = screen.getByText('Create Your First Character');
    expect(createLink).toBeInTheDocument();
    expect(createLink.closest('a')).toHaveAttribute('href', `/stories/${mockStoryId}/characters/new`);
  });

  it('filters characters by type', () => {
    render(
      <CharactersGrid 
        characters={mockCharacters} 
        storyId={mockStoryId}
        onDelete={mockOnDelete} 
      />
    );
    
    // Initially all characters should be visible
    expect(screen.getByTestId('character-card-char1')).toBeInTheDocument();
    expect(screen.getByTestId('character-card-char2')).toBeInTheDocument();
    expect(screen.getByTestId('character-card-char3')).toBeInTheDocument();
    
    // Filter by antagonist
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'antagonist' } });
    
    // Now only the villain should be visible
    expect(screen.getByTestId('character-card-char3')).toBeInTheDocument();
    expect(screen.queryByTestId('character-card-char1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('character-card-char2')).not.toBeInTheDocument();
    
    // Should show the updated character count
    expect(screen.getByText('1 character')).toBeInTheDocument();
  });

  it('filters characters by status', () => {
    render(
      <CharactersGrid 
        characters={mockCharacters} 
        storyId={mockStoryId}
        onDelete={mockOnDelete} 
      />
    );
    
    // Filter by deceased status
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'deceased' } });
    
    // Now only the deceased character should be visible
    expect(screen.getByTestId('character-card-char3')).toBeInTheDocument();
    expect(screen.queryByTestId('character-card-char1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('character-card-char2')).not.toBeInTheDocument();
    
    // Should show the updated character count
    expect(screen.getByText('1 character')).toBeInTheDocument();
  });

  it('searches characters by name and description', () => {
    render(
      <CharactersGrid 
        characters={mockCharacters} 
        storyId={mockStoryId}
        onDelete={mockOnDelete} 
      />
    );
    
    // Search for "evil"
    fireEvent.change(screen.getByLabelText('Search Characters'), { target: { value: 'evil' } });
    
    // Only the villain with "evil" in description should be visible
    expect(screen.getByTestId('character-card-char3')).toBeInTheDocument();
    expect(screen.queryByTestId('character-card-char1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('character-card-char2')).not.toBeInTheDocument();
    
    // Clear and search for "John"
    fireEvent.change(screen.getByLabelText('Search Characters'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Search Characters'), { target: { value: 'John' } });
    
    // Only John Doe should be visible
    expect(screen.getByTestId('character-card-char1')).toBeInTheDocument();
    expect(screen.queryByTestId('character-card-char2')).not.toBeInTheDocument();
    expect(screen.queryByTestId('character-card-char3')).not.toBeInTheDocument();
  });

  it('sorts characters by name', () => {
    render(
      <CharactersGrid 
        characters={mockCharacters} 
        storyId={mockStoryId}
        onDelete={mockOnDelete} 
      />
    );
    
    // Default sorting should be by name ascending
    const characterNames = screen.getAllByRole('heading').map(h => h.textContent);
    expect(characterNames).toEqual(['Jane Smith', 'John Doe', 'Villain']);
    
    // Toggle sorting direction
    fireEvent.click(screen.getByText('Asc'));
    
    // Should now be sorted by name descending
    const characterNamesDesc = screen.getAllByRole('heading').map(h => h.textContent);
    expect(characterNamesDesc).toEqual(['Villain', 'John Doe', 'Jane Smith']);
  });

  it('sorts characters by type', () => {
    render(
      <CharactersGrid 
        characters={mockCharacters} 
        storyId={mockStoryId}
        onDelete={mockOnDelete} 
      />
    );
    
    // Change sort to type
    fireEvent.change(screen.getByLabelText('Sort by:'), { target: { value: 'type' } });
    
    // Should be sorted by type
    const types = ['antagonist', 'protagonist', 'supporting'];
    const renderedTypes = screen.getAllByTestId('character-type').map(t => t.textContent);
    expect(renderedTypes).toEqual(types);
    
    // Toggle to descending
    fireEvent.click(screen.getByText('Asc'));
    
    // Should be sorted by type descending
    const typesDesc = ['supporting', 'protagonist', 'antagonist'];
    const renderedTypesDesc = screen.getAllByTestId('character-type').map(t => t.textContent);
    expect(renderedTypesDesc).toEqual(typesDesc);
  });

  it('handles the delete action', () => {
    render(
      <CharactersGrid 
        characters={mockCharacters} 
        storyId={mockStoryId}
        onDelete={mockOnDelete} 
      />
    );
    
    // Click delete on the first character
    fireEvent.click(screen.getByTestId('delete-button-char1'));
    
    // onDelete should be called with the character id
    expect(mockOnDelete).toHaveBeenCalledWith('char1');
  });

  it('combines filters correctly', () => {
    render(
      <CharactersGrid 
        characters={mockCharacters} 
        storyId={mockStoryId}
        onDelete={mockOnDelete} 
      />
    );
    
    // Apply type filter
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'protagonist' } });
    
    // Apply status filter
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'alive' } });
    
    // Should show only the protagonist who is alive
    expect(screen.getByTestId('character-card-char1')).toBeInTheDocument();
    expect(screen.queryByTestId('character-card-char2')).not.toBeInTheDocument();
    expect(screen.queryByTestId('character-card-char3')).not.toBeInTheDocument();
    
    // Character count should be updated
    expect(screen.getByText('1 character')).toBeInTheDocument();
  });
}); 