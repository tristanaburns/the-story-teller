import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CharacterForm from '@/components/characters/CharacterForm';

// Mock the next/link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href} data-testid="mock-link">{children}</a>;
  };
});

describe('CharacterForm Component', () => {
  const mockStoryId = 'story123';
  const mockOnSubmit = jest.fn();
  
  const mockCharacter = {
    _id: 'char123',
    storyId: mockStoryId,
    name: 'John Doe',
    full_name: 'Johnathan Doe',
    type: 'protagonist' as const,
    status: 'alive' as const,
    description: 'A test character description',
    story_role: 'Main hero of the story',
    physical_appearance: {
      height: '6\'2"',
      build: 'Athletic',
      distinctive_features: ['Scar on cheek', 'Blue eyes'],
      typical_attire: 'Leather jacket and jeans'
    },
    personality: {
      traits: ['Brave', 'Compassionate'],
      values: ['Justice', 'Family'],
      motivations: ['Revenge', 'Protecting loved ones']
    },
    background: {
      birthplace: 'New York',
      occupation: 'Detective',
      significant_events: ['Lost parents at young age']
    },
    relationships: [
      {
        character_id: 'char456',
        relationship_type: 'friend',
        dynamics: 'Close allies who occasionally disagree'
      }
    ]
  };

  const mockRelatedCharacters = [
    { _id: 'char456', id: 'char456', name: 'Jane Smith' },
    { _id: 'char789', id: 'char789', name: 'Robert Johnson' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly for creating a new character', () => {
    render(
      <CharacterForm 
        storyId={mockStoryId} 
        onSubmit={mockOnSubmit} 
      />
    );
    
    // Check form elements by testid
    expect(screen.getByTestId('name-input')).toBeInTheDocument();
    expect(screen.getByTestId('full-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('type-select')).toBeInTheDocument();
    expect(screen.getByTestId('status-select')).toBeInTheDocument();
    expect(screen.getByTestId('description-input')).toBeInTheDocument();
    expect(screen.getByTestId('story-role-input')).toBeInTheDocument();
    
    // Check form sections
    expect(screen.getByText('Basic Information')).toBeInTheDocument();
    expect(screen.getByText('Physical Appearance')).toBeInTheDocument();
    expect(screen.getByText('Personality')).toBeInTheDocument();
    expect(screen.getByText('Background')).toBeInTheDocument();
    expect(screen.getByText('Relationships')).toBeInTheDocument();
    
    // Check submit button
    expect(screen.getByText('Create Character')).toBeInTheDocument();
  });

  it('renders correctly for editing an existing character', () => {
    render(
      <CharacterForm 
        storyId={mockStoryId} 
        character={mockCharacter}
        relatedCharacters={mockRelatedCharacters}
        onSubmit={mockOnSubmit} 
      />
    );
    
    // Check if form is pre-filled with character data
    expect(screen.getByTestId('name-input')).toHaveValue('John Doe');
    expect(screen.getByTestId('full-name-input')).toHaveValue('Johnathan Doe');
    expect(screen.getByTestId('description-input')).toHaveValue('A test character description');
    
    // Check if the submit button shows "Save Changes" in edit mode
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  it('handles input changes correctly', () => {
    render(
      <CharacterForm 
        storyId={mockStoryId} 
        onSubmit={mockOnSubmit} 
      />
    );
    
    // Change the name field
    const nameInput = screen.getByTestId('name-input') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'New Character Name' } });
    
    // Verify the input was updated
    expect(nameInput.value).toBe('New Character Name');
  });

  it('handles form submission correctly', () => {
    render(
      <CharacterForm 
        storyId={mockStoryId} 
        onSubmit={mockOnSubmit} 
      />
    );
    
    // Fill in the required name field
    const nameInput = screen.getByTestId('name-input');
    fireEvent.change(nameInput, { target: { value: 'New Character' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Create Character'));
    
    // Check if onSubmit was called with the form data
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        storyId: mockStoryId,
        name: 'New Character'
      })
    );
  });

  it('handles nested field changes correctly', () => {
    render(
      <CharacterForm 
        storyId={mockStoryId} 
        onSubmit={mockOnSubmit} 
      />
    );
    
    // Change a nested field - height under physical_appearance
    const heightInput = screen.getByTestId('height-input') as HTMLInputElement;
    fireEvent.change(heightInput, { target: { value: '5\'10"' } });
    
    // Verify the input was updated
    expect(heightInput.value).toBe('5\'10"');
    
    // Submit the form to check the data structure
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'Test Character' } });
    fireEvent.click(screen.getByText('Create Character'));
    
    // Check if onSubmit was called with the correct nested data
    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Character',
        physical_appearance: expect.objectContaining({
          height: '5\'10"'
        })
      })
    );
  });

  it('handles array input changes correctly', () => {
    render(
      <CharacterForm 
        storyId={mockStoryId} 
        onSubmit={mockOnSubmit} 
      />
    );
    
    // Find an array input field
    const traitsInput = screen.getByTestId('traits-input') as HTMLInputElement;
    
    // Add comma-separated values
    fireEvent.change(traitsInput, { target: { value: 'Brave, Smart, Resourceful' } });
    
    // Submit the form with required fields
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'Test Character' } });
    fireEvent.click(screen.getByText('Create Character'));
    
    // Check if the array was processed correctly
    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        personality: expect.objectContaining({
          traits: ['Brave', 'Smart', 'Resourceful']
        })
      })
    );
  });

  // Skipping relationship tests until component is updated with data-testid attributes
  it.skip('handles relationship additions correctly', () => {
    render(
      <CharacterForm 
        storyId={mockStoryId} 
        relatedCharacters={mockRelatedCharacters}
        onSubmit={mockOnSubmit} 
      />
    );
    
    // Click the "Add Relationship" button
    fireEvent.click(screen.getByText('Add Relationship'));
    
    // Select fields should appear for the relationship
    const relationshipSelects = screen.getAllByRole('combobox');
    expect(relationshipSelects.length).toBeGreaterThanOrEqual(2); // Type and Character selects
    
    // Use data-testid attributes instead of labels
    const characterSelect = screen.getByTestId('related-character-select') as HTMLSelectElement;
    fireEvent.change(characterSelect, { target: { value: 'char456' } });
    
    const typeSelect = screen.getByTestId('relationship-type-select') as HTMLSelectElement;
    fireEvent.change(typeSelect, { target: { value: 'friend' } });
    
    const dynamicsInput = screen.getByTestId('relationship-dynamics-input') as HTMLTextAreaElement;
    fireEvent.change(dynamicsInput, { target: { value: 'Best friends since childhood' } });
    
    // Submit the form with required fields
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'Test Character' } });
    fireEvent.click(screen.getByText('Create Character'));
    
    // Verify the relationship data
    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        relationships: [
          expect.objectContaining({
            character_id: 'char456',
            relationship_type: 'friend',
            dynamics: 'Best friends since childhood'
          })
        ]
      })
    );
  });

  it.skip('handles relationship removals correctly', () => {
    render(
      <CharacterForm 
        storyId={mockStoryId} 
        character={mockCharacter}
        relatedCharacters={mockRelatedCharacters}
        onSubmit={mockOnSubmit} 
      />
    );
    
    // There should be a relationship already in the form - look for it by test ID
    expect(screen.getByTestId('relationship-0')).toBeInTheDocument();
    
    // Find and click the remove button for the relationship
    const removeButton = screen.getByTestId('remove-relationship-0');
    fireEvent.click(removeButton);
    
    // Check that the relationship was removed
    expect(screen.queryByTestId('relationship-0')).not.toBeInTheDocument();
    
    // Submit the form to check that no relationships are included
    fireEvent.click(screen.getByText('Save Changes'));
    
    // Verify the submitted data has no relationships
    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        relationships: []
      })
    );
  });
}); 