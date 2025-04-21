import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CharacterCard from '@/components/characters/CharacterCard';

// Mock the next/link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href} data-testid="mock-link">{children}</a>;
  };
});

describe('CharacterCard Component', () => {
  const mockCharacter = {
    _id: 'char123',
    id: 'char123',
    storyId: 'story123',
    name: 'John Doe',
    full_name: 'Johnathan Doe',
    type: 'protagonist' as const,
    status: 'alive' as const,
    description: 'A test character description',
    story_role: 'Main hero of the story'
  };

  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders character information correctly', () => {
    render(<CharacterCard character={mockCharacter} />);
    
    // Check basic character info is displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Johnathan Doe')).toBeInTheDocument();
    expect(screen.getByText('Protagonist')).toBeInTheDocument();
    expect(screen.getByText('Alive')).toBeInTheDocument();
    expect(screen.getByText('A test character description')).toBeInTheDocument();
    expect(screen.getByText('Role:')).toBeInTheDocument();
    expect(screen.getByText('Main hero of the story')).toBeInTheDocument();
  });

  it('displays initials in the avatar', () => {
    render(<CharacterCard character={mockCharacter} />);
    
    // The initials should be shown in the avatar
    const avatar = screen.getByText('JD');
    expect(avatar).toBeInTheDocument();
  });

  it('renders without full name when it matches the name', () => {
    const characterWithSameName = {
      ...mockCharacter,
      full_name: 'John Doe' // Same as name
    };
    
    render(<CharacterCard character={characterWithSameName} />);
    
    // Should only show the name once (not duplicated)
    const nameElements = screen.getAllByText('John Doe');
    expect(nameElements.length).toBe(1);
  });

  it('renders without optional fields', () => {
    const minimalCharacter = {
      _id: 'char123',
      id: 'char123',
      storyId: 'story123',
      name: 'John Doe'
    };
    
    render(<CharacterCard character={minimalCharacter} />);
    
    // Basic info should be there
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    
    // Optional fields should not be present
    expect(screen.queryByText('Protagonist')).not.toBeInTheDocument();
    expect(screen.queryByText('Alive')).not.toBeInTheDocument();
    expect(screen.queryByText('Role:')).not.toBeInTheDocument();
  });

  it('includes view and edit links with correct URLs', () => {
    render(<CharacterCard character={mockCharacter} />);
    
    // Check links are rendered with correct hrefs
    const links = screen.getAllByTestId('mock-link');
    
    // Should have View and Edit links
    expect(links.length).toBeGreaterThanOrEqual(2);
    
    // Check links have correct URLs
    const viewLink = links.find(link => link.textContent === 'View');
    const editLink = links.find(link => link.textContent === 'Edit');
    
    expect(viewLink).toHaveAttribute('href', '/stories/story123/characters/char123');
    expect(editLink).toHaveAttribute('href', '/stories/story123/characters/char123/edit');
  });

  it('shows delete button when onDelete prop is provided', () => {
    render(<CharacterCard character={mockCharacter} onDelete={mockOnDelete} />);
    
    // Delete button should be visible
    const deleteButton = screen.getByText('Delete');
    expect(deleteButton).toBeInTheDocument();
  });

  it('hides delete button when onDelete prop is not provided', () => {
    render(<CharacterCard character={mockCharacter} />);
    
    // Delete button should not be visible
    const deleteButton = screen.queryByText('Delete');
    expect(deleteButton).not.toBeInTheDocument();
  });

  it('opens delete modal when delete button is clicked', () => {
    render(<CharacterCard character={mockCharacter} onDelete={mockOnDelete} />);
    
    // Click delete button
    fireEvent.click(screen.getByText('Delete'));
    
    // Modal should open
    expect(screen.getByText('Delete Character')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onDelete when delete is confirmed', () => {
    render(<CharacterCard character={mockCharacter} onDelete={mockOnDelete} />);
    
    // Click delete button to open modal
    fireEvent.click(screen.getByText('Delete'));
    
    // Click confirm in modal
    fireEvent.click(screen.getByText('Delete', { selector: '.bg-red-600' }));
    
    // Check onDelete was called with correct ID
    expect(mockOnDelete).toHaveBeenCalledWith('char123');
  });

  it('closes modal without deleting when cancel is clicked', () => {
    render(<CharacterCard character={mockCharacter} onDelete={mockOnDelete} />);
    
    // Click delete button to open modal
    fireEvent.click(screen.getByText('Delete'));
    
    // Click cancel in modal
    fireEvent.click(screen.getByText('Cancel'));
    
    // Modal should be closed
    expect(screen.queryByText('Delete Character')).not.toBeInTheDocument();
    
    // onDelete should not have been called
    expect(mockOnDelete).not.toHaveBeenCalled();
  });
}); 