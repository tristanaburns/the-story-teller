import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import LocationForm from '@/components/locations/LocationForm';
import { useToast } from '@/components/ui/use-toast';
import { LocationType } from '@/types/locations';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
  }),
}));

jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { id: 'user-123' } },
    status: 'authenticated',
  }),
}));

jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn(),
}));

jest.mock('@/components/locations/MapSelector', () => ({
  __esModule: true,
  default: ({ onSelectLocation }: { onSelectLocation: (lat: number, lng: number, address?: string) => void }) => (
    <div data-testid="map-selector">
      <button 
        data-testid="select-location-btn" 
        onClick={() => onSelectLocation(40.7128, -74.0060, '123 Test Street')}
      >
        Select Location
      </button>
    </div>
  ),
}));

jest.mock('@/components/TagInput', () => ({
  __esModule: true,
  default: ({ tags, setTags }: { tags: string[], setTags: (tags: string[]) => void }) => (
    <div data-testid="tag-input">
      <input 
        data-testid="tag-input-field" 
        value={tags.join(', ')} 
        onChange={(e) => setTags(e.target.value.split(', ').filter(Boolean))} 
      />
      <button 
        data-testid="add-tag-btn" 
        onClick={() => setTags([...tags, 'new-tag'])}
      >
        Add Tag
      </button>
    </div>
  ),
}));

// Mock react-leaflet components used by MapSelector
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ position }: { position: [number, number] }) => (
    <div data-testid="map-marker" data-position={JSON.stringify(position)} />
  ),
  useMapEvents: (handlers: any) => {
    // Store the click handler to be used in tests
    (window as any).mapClickHandler = handlers.click;
    return null;
  },
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} data-testid="next-image" />,
}));

describe('LocationForm Component', () => {
  const mockToast = { toast: jest.fn() };
  const mockStoryId = 'story-123';
  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();
  
  const defaultProps = {
    storyId: mockStoryId,
    onSuccess: mockOnSuccess,
    onCancel: mockOnCancel,
  };
  
  const sampleLocation = {
    _id: 'location123',
    name: 'Test Location',
    description: 'A test location description',
    coordinates: {
      latitude: 51.505,
      longitude: -0.09,
    },
    type: 'URBAN' as LocationType,
    storyId: 'story123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue(mockToast);
    global.fetch = jest.fn();
  });
  
  it('renders the form correctly for new location', () => {
    render(
      <LocationForm 
        storyId={mockStoryId} 
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );
    
    // Verify form elements are rendered
    expect(screen.getByText('Create New Location')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Latitude')).toBeInTheDocument();
    expect(screen.getByLabelText('Longitude')).toBeInTheDocument();
    expect(screen.getByTestId('tag-input')).toBeInTheDocument();
    expect(screen.getByText('Save Location')).toBeInTheDocument();
    
    // Verify delete button is not rendered for new location
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });
  
  it('renders edit mode correctly when locationId is provided', async () => {
    // Mock fetch response for edit mode
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          location: {
            name: 'Test Location',
            description: 'Test Description',
            address: '123 Test St',
            coordinates: { lat: 40.7128, lng: -74.0060 },
            tags: ['test', 'location'],
          }
        })
      })
    );
    
    render(
      <LocationForm 
        storyId={mockStoryId} 
        locationId="location-123"
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );
    
    // Initially should show loading state
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Edit Location')).toBeInTheDocument();
    });
    
    // Verify form is pre-filled with location data
    await waitFor(() => {
      expect(screen.getByLabelText('Name')).toHaveValue('Test Location');
      expect(screen.getByLabelText('Description')).toHaveValue('Test Description');
      expect(screen.getByLabelText('Address')).toHaveValue('123 Test St');
    });
    
    // Verify delete button is rendered for edit mode
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('handles form submission for new location', async () => {
    // Mock successful response
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          location: {
            id: 'new-location-123',
            name: 'New Location',
          }
        })
      })
    );
    
    render(
      <LocationForm 
        storyId={mockStoryId} 
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText('Name'), { 
      target: { value: 'New Location' } 
    });
    
    fireEvent.change(screen.getByLabelText('Description'), { 
      target: { value: 'This is a new location' } 
    });
    
    // Add a tag
    fireEvent.click(screen.getByTestId('add-tag-btn'));
    
    // Submit the form
    fireEvent.click(screen.getByText('Save Location'));
    
    // Wait for the submission to complete
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/stories/${mockStoryId}/locations`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.any(String),
        })
      );
      
      // Verify toast was called
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Location created successfully',
      });
      
      // Verify onSuccess callback was called
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
  
  it('handles validation errors', async () => {
    render(
      <LocationForm 
        storyId={mockStoryId} 
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );
    
    // Submit without filling the required fields
    fireEvent.click(screen.getByText('Save Location'));
    
    // Verify validation error message
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
    
    // Fetch should not be called
    expect(global.fetch).not.toHaveBeenCalled();
  });
  
  it('handles API errors on submission', async () => {
    // Mock failed response
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })
    );
    
    render(
      <LocationForm 
        storyId={mockStoryId} 
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );
    
    // Fill out the required fields
    fireEvent.change(screen.getByLabelText('Name'), { 
      target: { value: 'New Location' } 
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Save Location'));
    
    // Wait for the submission to complete
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
      
      // Verify error toast was called
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to save location',
        variant: 'destructive',
      });
      
      // Verify onSuccess callback was not called
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });
  
  it('handles map selection', async () => {
    render(
      <LocationForm 
        storyId={mockStoryId} 
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );
    
    // Open map dialog
    fireEvent.click(screen.getByText('Select on Map'));
    
    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText('Select Location on Map')).toBeInTheDocument();
    });
    
    // Select a location on the map
    fireEvent.click(screen.getByTestId('select-location-btn'));
    
    // Wait for the coordinates to be updated
    await waitFor(() => {
      expect(screen.getByLabelText('Latitude')).toHaveValue('40.7128');
      expect(screen.getByLabelText('Longitude')).toHaveValue('-74.006');
      expect(screen.getByLabelText('Address')).toHaveValue('123 Test Street');
    });
  });
  
  it('handles delete location', async () => {
    // Mock successful fetch for initial load and delete
    global.fetch = jest.fn()
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            location: {
              name: 'Test Location',
              description: 'Test Description',
            }
          })
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })
      );
    
    const mockRouter = { push: jest.fn(), back: jest.fn() };
    (require('next/navigation').useRouter as jest.Mock).mockReturnValue(mockRouter);
    
    render(
      <LocationForm 
        storyId={mockStoryId} 
        locationId="location-123"
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Edit Location')).toBeInTheDocument();
    });
    
    // Open delete dialog
    fireEvent.click(screen.getByText('Delete'));
    
    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText('Delete Location')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to delete this location?')).toBeInTheDocument();
    });
    
    // Confirm delete
    fireEvent.click(screen.getByText('Delete Location').closest('button')!);
    
    // Wait for the delete to complete
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/stories/${mockStoryId}/locations/location-123`,
        { method: 'DELETE' }
      );
      
      // Verify toast was called
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Location deleted successfully',
      });
      
      // Verify navigation
      expect(mockRouter.push).toHaveBeenCalledWith(`/stories/${mockStoryId}/locations`);
    });
  });

  it('renders with empty form fields when no initial data is provided', () => {
    render(<LocationForm {...defaultProps} />);
    
    // Check if form fields are rendered with empty values
    expect(screen.getByLabelText(/location name/i)).toHaveValue('');
    expect(screen.getByLabelText(/description/i)).toHaveValue('');
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
    
    // Check if type dropdown is rendered with default value
    const typeSelect = screen.getByLabelText(/location type/i);
    expect(typeSelect).toBeInTheDocument();
  });

  it('renders with initial location data when provided', () => {
    render(<LocationForm {...defaultProps} initialData={sampleLocation} />);
    
    // Check if form fields are filled with initial data
    expect(screen.getByLabelText(/location name/i)).toHaveValue(sampleLocation.name);
    expect(screen.getByLabelText(/description/i)).toHaveValue(sampleLocation.description);
    
    // Check if the map has the initial position
    const marker = screen.getByTestId('map-marker');
    expect(marker.dataset.position).toBe(
      JSON.stringify([sampleLocation.coordinates.latitude, sampleLocation.coordinates.longitude])
    );
    
    // Check if type dropdown has the initial value
    const typeSelect = screen.getByLabelText(/location type/i) as HTMLSelectElement;
    expect(typeSelect.value).toBe(sampleLocation.type);
  });

  it('validates required fields before submission', async () => {
    const user = userEvent.setup();
    render(<LocationForm {...defaultProps} />);
    
    // Try to submit form without filling required fields
    const submitButton = screen.getByRole('button', { name: /save/i });
    await user.click(submitButton);
    
    // Check if validation errors are displayed
    expect(screen.getByText(/location name is required/i)).toBeInTheDocument();
    
    // Check that onSuccess was not called
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('handles form submission with valid data', async () => {
    const user = userEvent.setup();
    render(<LocationForm {...defaultProps} />);
    
    // Fill the form with valid data
    await user.type(screen.getByLabelText(/location name/i), 'New Test Location');
    await user.type(screen.getByLabelText(/description/i), 'This is a new test location');
    
    // Select a location type
    const typeSelect = screen.getByLabelText(/location type/i);
    await user.selectOptions(typeSelect, 'RURAL');
    
    // Simulate a map position selection
    (window as any).mapClickHandler({ 
      latlng: { lat: 52.5, lng: -1.9 }
    });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /save/i });
    await user.click(submitButton);
    
    // Wait for validation and submission
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith({
        name: 'New Test Location',
        description: 'This is a new test location',
        coordinates: {
          latitude: 52.5,
          longitude: -1.9,
        },
        type: 'RURAL',
        storyId: 'story123',
      });
    });
  });

  it('updates form state when map position changes', async () => {
    render(<LocationForm {...defaultProps} />);
    
    // Initial position should be default
    expect(screen.getByLabelText(/latitude/i)).toHaveValue('51.505');
    expect(screen.getByLabelText(/longitude/i)).toHaveValue('-0.09');
    
    // Simulate a map position change
    (window as any).mapClickHandler({ 
      latlng: { lat: 53.8, lng: -2.5 } 
    });
    
    // Check if latitude and longitude inputs were updated
    await waitFor(() => {
      expect(screen.getByLabelText(/latitude/i)).toHaveValue('53.8');
      expect(screen.getByLabelText(/longitude/i)).toHaveValue('-2.5');
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<LocationForm {...defaultProps} />);
    
    // Click the cancel button
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    
    // Check if onCancel callback was called
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('prepares form for editing when initialData is provided', async () => {
    const user = userEvent.setup();
    render(<LocationForm {...defaultProps} initialData={sampleLocation} isEditing={true} />);
    
    // Verify that form is in edit mode
    expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument();
    
    // Edit some fields
    const nameInput = screen.getByLabelText(/location name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Location Name');
    
    // Submit the form
    const updateButton = screen.getByRole('button', { name: /update/i });
    await user.click(updateButton);
    
    // Check if onSuccess was called with updated data while preserving the ID
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(expect.objectContaining({
        _id: 'location123',
        name: 'Updated Location Name',
        description: sampleLocation.description,
        storyId: 'story123',
      }));
    });
  });
}); 