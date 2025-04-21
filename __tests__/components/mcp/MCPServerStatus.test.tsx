import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MCPServerStatus from '@/components/mcp/MCPServerStatus';

// Mock dependencies
jest.mock('@/lib/mcp', () => ({
  defaultMCPServers: {
    'memory-server': {
      id: 'memory-mcp',
      name: 'Memory Server',
      baseUrl: 'http://localhost:3001',
    },
    'everart-server': {
      id: 'everart-mcp',
      name: 'Everart Server',
      baseUrl: 'http://localhost:3002',
    },
    'thinking-server': {
      id: 'thinking-mcp',
      name: 'Sequential Thinking Server',
      baseUrl: 'http://localhost:3003',
    },
    'database-server': {
      id: 'database-mcp',
      name: 'MongoDB Atlas Server',
      baseUrl: 'http://localhost:3004',
    },
  },
}));

// Helper function to create a performance.now mock
const mockPerformanceNow = () => {
  const originalPerformanceNow = performance.now;
  let callCount = 0;
  
  // Mock to return increasing values on each call to simulate elapsed time
  performance.now = jest.fn().mockImplementation(() => {
    callCount++;
    return callCount % 2 === 1 ? 0 : 100; // Return 0 on first call, 100 on second call (100ms latency)
  });
  
  return {
    restore: () => {
      performance.now = originalPerformanceNow;
    }
  };
};

describe('MCPServerStatus Component', () => {
  let performanceMock: { restore: () => void };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset fetch mock
    global.fetch = jest.fn();
    
    // Mock performance.now
    performanceMock = mockPerformanceNow();
  });
  
  afterEach(() => {
    performanceMock.restore();
  });
  
  it('renders initial loading state correctly', () => {
    // Mock fetch to delay responses
    global.fetch = jest.fn(() => new Promise(() => {}));
    
    render(<MCPServerStatus />);
    
    // Check for component title
    expect(screen.getByText('MCP Server Status')).toBeInTheDocument();
    
    // Check that all servers are shown with unknown status
    expect(screen.getByText('Memory MCP')).toBeInTheDocument();
    expect(screen.getByText('Everart MCP')).toBeInTheDocument();
    expect(screen.getByText('Sequential Thinking MCP')).toBeInTheDocument();
    expect(screen.getByText('MongoDB Atlas MCP')).toBeInTheDocument();
    
    // Check number of status elements
    const initialStatusElements = screen.getAllByText('Unknown');
    expect(initialStatusElements).toHaveLength(4);
  });
  
  it('updates server statuses based on API responses', async () => {
    // Mock successful responses for some servers and error for others
    global.fetch = jest.fn()
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          statusText: 'OK',
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        })
      )
      .mockImplementationOnce(() => 
        Promise.reject(new Error('Network error'))
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          statusText: 'OK',
        })
      );
    
    render(<MCPServerStatus />);
    
    // Initially all servers should have Unknown status
    const initialStatusElements = screen.getAllByText('Unknown');
    expect(initialStatusElements).toHaveLength(4);
    
    // Wait for status updates
    await waitFor(() => {
      // Check for online status by looking for 'ms' suffix
      const onlineElements = screen.getAllByText(/ms$/);
      expect(onlineElements).toHaveLength(2);
      
      // Check for error status
      const errorStatusElements = screen.getAllByText('Error');
      expect(errorStatusElements).toHaveLength(2);
    });
    
    // Verify fetch was called for each server
    expect(global.fetch).toHaveBeenCalledTimes(4);
    
    // Verify URLs
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/health',
      expect.objectContaining({
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      })
    );
    
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3002/health',
      expect.anything()
    );
    
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3003/health',
      expect.anything()
    );
    
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3004/health',
      expect.anything()
    );
  });
  
  it('applies correct status colors', () => {
    // Mock all servers as online for simplicity
    global.fetch = jest.fn().mockImplementation(() => 
      Promise.resolve({
        ok: true,
        statusText: 'OK',
      })
    );
    
    const { container } = render(<MCPServerStatus className="custom-class" />);
    
    // Check that custom class is applied to the wrapper
    expect(container.firstChild).toHaveClass('custom-class');
    
    // Check that indicators are present
    const indicators = container.querySelectorAll('.w-3.h-3.rounded-full');
    expect(indicators.length).toBe(4); // Four servers
  });
  
  it('handles all server statuses with appropriate styles', async () => {
    // Mock different responses for different servers
    global.fetch = jest.fn()
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true, // Online - green
          statusText: 'OK',
        })
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: false, // Error - yellow
          status: 500,
          statusText: 'Internal Server Error',
        })
      )
      .mockImplementationOnce(() => 
        Promise.reject(new Error('Network error')) // Error - yellow
      )
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: false, // Error - yellow
          status: 404,
          statusText: 'Not Found',
        })
      );
    
    const { container } = render(<MCPServerStatus />);
    
    // Wait for status updates with a longer timeout
    await waitFor(() => {
      // First check for status indicators before checking the colors
      const indicators = container.querySelectorAll('.w-3.h-3.rounded-full');
      expect(indicators.length).toBe(4);
      
      // Check for status colors
      const greenIndicators = container.querySelectorAll('.bg-green-500');
      expect(greenIndicators.length).toBe(1); // One server online
      
      const yellowIndicators = container.querySelectorAll('.bg-yellow-500');
      expect(yellowIndicators.length).toBe(3); // Three servers with error
    }, { timeout: 2000 });
  });
}); 