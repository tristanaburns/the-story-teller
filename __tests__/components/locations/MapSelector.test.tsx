import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import MapSelector from '@/components/locations/MapSelector';

// Mock the Leaflet map components
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children, ...props }: any) => (
    <div data-testid="map-container" {...props}>
      {children}
    </div>
  ),
  TileLayer: (props: any) => <div data-testid="tile-layer" {...props} />,
  Marker: ({ position, ...props }: any) => (
    <div 
      data-testid="map-marker" 
      data-lat={position?.[0]} 
      data-lng={position?.[1]} 
      {...props} 
    />
  ),
  useMapEvents: (handlers: any) => {
    // Store the click handler for testing
    (global as any).mapClickHandler = handlers.click;
    return { getCenter: () => ({ lat: 51.505, lng: -0.09 }) };
  },
}));

// Mock useMapEvents separately to access it in tests
const mockUseMapEvents = jest.fn();
(global as any).mockMapEvents = mockUseMapEvents;

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} data-testid="next-image" />,
}));

describe('MapSelector Component', () => {
  const mockOnPositionChange = jest.fn();
  
  // Add defaultProps for the tests
  const defaultProps = {
    initialPosition: [51.505, -0.09] as [number, number],
    onPositionChange: mockOnPositionChange
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders the map container with correct initial props', () => {
    render(
      <MapSelector 
        initialPosition={[51.505, -0.09]} 
        onPositionChange={mockOnPositionChange} 
      />
    );
    
    const mapContainer = screen.getByTestId('map-container');
    expect(mapContainer).toBeInTheDocument();
    expect(mapContainer).toHaveAttribute('center', '51.505,-0.09');
    expect(mapContainer).toHaveAttribute('zoom', '13');
    expect(mapContainer).toHaveAttribute('scrollWheelZoom', 'true');
    
    const tileLayer = screen.getByTestId('tile-layer');
    expect(tileLayer).toBeInTheDocument();
    expect(tileLayer).toHaveAttribute('url', 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
  });
  
  it('displays a marker at the initial position', () => {
    render(
      <MapSelector 
        initialPosition={[51.505, -0.09]} 
        onPositionChange={mockOnPositionChange} 
      />
    );
    
    const marker = screen.getByTestId('map-marker');
    expect(marker).toBeInTheDocument();
    expect(marker).toHaveAttribute('data-lat', '51.505');
    expect(marker).toHaveAttribute('data-lng', '-0.09');
  });
  
  it('updates marker position when map is clicked', () => {
    render(
      <MapSelector 
        initialPosition={[51.505, -0.09]} 
        onPositionChange={mockOnPositionChange} 
      />
    );
    
    // Simulate a map click event
    const newPosition = { lat: 52, lng: 1 };
    const clickEvent = { latlng: newPosition };
    
    // Access the click handler stored during mock setup
    const clickHandler = (global as any).mapClickHandler;
    clickHandler(clickEvent);
    
    // Check if onPositionChange was called with the new coordinates
    expect(mockOnPositionChange).toHaveBeenCalledWith([52, 1]);
  });
  
  it('renders with default London coordinates when no initial position is provided', () => {
    render(
      <MapSelector onPositionChange={mockOnPositionChange} />
    );
    
    const mapContainer = screen.getByTestId('map-container');
    // Default London coordinates: [51.505, -0.09]
    expect(mapContainer).toHaveAttribute('center', '51.505,-0.09');
    
    const marker = screen.getByTestId('map-marker');
    expect(marker).toHaveAttribute('data-lat', '51.505');
    expect(marker).toHaveAttribute('data-lng', '-0.09');
  });
  
  it('updates position state when initialPosition prop changes', () => {
    const { rerender } = render(
      <MapSelector 
        initialPosition={[51.505, -0.09]} 
        onPositionChange={mockOnPositionChange} 
      />
    );
    
    // Verify initial marker position
    let marker = screen.getByTestId('map-marker');
    expect(marker).toHaveAttribute('data-lat', '51.505');
    expect(marker).toHaveAttribute('data-lng', '-0.09');
    
    // Update the initialPosition prop
    rerender(
      <MapSelector 
        initialPosition={[52.5, 13.4]} 
        onPositionChange={mockOnPositionChange} 
      />
    );
    
    // Verify marker position has updated
    marker = screen.getByTestId('map-marker');
    expect(marker).toHaveAttribute('data-lat', '52.5');
    expect(marker).toHaveAttribute('data-lng', '13.4');
  });

  it('allows position update via lat/lng inputs', async () => {
    const user = userEvent.setup();
    render(<MapSelector {...defaultProps} />);
    
    // Find the latitude and longitude inputs
    const latInput = screen.getByLabelText(/latitude/i);
    const lngInput = screen.getByLabelText(/longitude/i);
    
    // Change input values
    await user.clear(latInput);
    await user.type(latInput, '53.5');
    
    await user.clear(lngInput);
    await user.type(lngInput, '-2.5');
    
    // Trigger form submission
    const form = screen.getByTestId('coordinates-form');
    fireEvent.submit(form);
    
    // Check if onPositionChange callback was called with the new position
    expect(defaultProps.onPositionChange).toHaveBeenCalledWith([53.5, -2.5]);
    
    // Check if marker position was updated
    await waitFor(() => {
      const marker = screen.getByTestId('map-marker');
      expect(marker.dataset.position).toBe(JSON.stringify([53.5, -2.5]));
    });
  });

  it('validates input coordinates', async () => {
    const user = userEvent.setup();
    render(<MapSelector {...defaultProps} />);
    
    // Find the latitude and longitude inputs
    const latInput = screen.getByLabelText(/latitude/i);
    const lngInput = screen.getByLabelText(/longitude/i);
    
    // Invalid latitude (out of range)
    await user.clear(latInput);
    await user.type(latInput, '91');
    
    // Valid longitude
    await user.clear(lngInput);
    await user.type(lngInput, '0');
    
    // Trigger form submission
    const form = screen.getByTestId('coordinates-form');
    fireEvent.submit(form);
    
    // Check if validation error is displayed
    expect(screen.getByText(/latitude must be between -90 and 90/i)).toBeInTheDocument();
    
    // Check that onPositionChange was not called
    expect(defaultProps.onPositionChange).not.toHaveBeenCalled();
    
    // Now try with invalid longitude
    await user.clear(latInput);
    await user.type(latInput, '45');
    
    await user.clear(lngInput);
    await user.type(lngInput, '190');
    
    // Trigger form submission
    fireEvent.submit(form);
    
    // Check if validation error is displayed
    expect(screen.getByText(/longitude must be between -180 and 180/i)).toBeInTheDocument();
    
    // Check that onPositionChange was not called
    expect(defaultProps.onPositionChange).not.toHaveBeenCalled();
  });

  it('displays coordinates in the correct format', () => {
    render(<MapSelector {...defaultProps} />);
    
    // Find the latitude and longitude inputs
    const latInput = screen.getByLabelText(/latitude/i) as HTMLInputElement;
    const lngInput = screen.getByLabelText(/longitude/i) as HTMLInputElement;
    
    // Check that initial coordinates are displayed correctly
    expect(latInput.value).toBe(defaultProps.initialPosition[0].toString());
    expect(lngInput.value).toBe(defaultProps.initialPosition[1].toString());
  });
}); 