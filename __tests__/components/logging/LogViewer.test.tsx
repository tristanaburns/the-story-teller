/**
 * Tests for LogViewer Component
 *
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LogViewer } from '@/components/logging/LogViewer';
import { clientLogger } from '@/lib/logging/client/clientLogger';

// Mock fetch
global.fetch = jest.fn();

// Mock the client logger
jest.mock('@/lib/logging/client/clientLogger', () => ({
  clientLogger: {
    createChildLogger: jest.fn().mockReturnValue({
      debug: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
      trace: jest.fn(),
      warn: jest.fn(),
      fatal: jest.fn(),
      flush: jest.fn().mockResolvedValue(undefined),
    }),
  },
}));

// Sample log data for testing
const sampleLogs = [
  {
    _id: '1',
    timestamp: '2025-04-21T14:30:00.000Z',
    level: 'INFO',
    message: 'Test log message 1',
    component: 'TestComponent',
    correlationId: 'test-correlation-id-1',
    userId: 'user-1',
  },
  {
    _id: '2',
    timestamp: '2025-04-21T14:35:00.000Z',
    level: 'ERROR',
    message: 'Test error message',
    component: 'TestComponent',
    correlationId: 'test-correlation-id-2',
    userId: 'user-1',
    stackTrace: 'Error: Test error\n    at TestComponent.testMethod',
  },
  {
    _id: '3',
    timestamp: '2025-04-21T14:40:00.000Z',
    level: 'DEBUG',
    message: 'Test debug message',
    component: 'AnotherComponent',
    correlationId: 'test-correlation-id-3',
    userId: 'user-2',
    data: { key: 'value' },
  },
];

describe('LogViewer', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock successful fetch response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        logs: sampleLogs,
        total: sampleLogs.length,
        page: 1,
        pageSize: 20,
        totalPages: 1,
        availableComponents: ['TestComponent', 'AnotherComponent'],
      }),
    });
  });
  
  describe('initialization and rendering', () => {
    it('should render with initial logs', () => {
      // Render with initialLogs
      render(<LogViewer initialLogs={sampleLogs} loadLogsFromServer={false} />);
      
      // Check that logs are displayed
      expect(screen.getByText('Test log message 1')).toBeInTheDocument();
      expect(screen.getByText('Test error message')).toBeInTheDocument();
      expect(screen.getByText('Test debug message')).toBeInTheDocument();
    });
    
    it('should load logs from server on mount', async () => {
      // Render with server loading
      render(<LogViewer loadLogsFromServer={true} />);
      
      // Check that fetch was called
      expect(global.fetch).toHaveBeenCalled();
      
      // Wait for logs to load
      await waitFor(() => {
        expect(screen.getByText('Test log message 1')).toBeInTheDocument();
      });
    });
    
    it('should render empty state when no logs are available', () => {
      // Mock empty logs response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          logs: [],
          total: 0,
          page: 1,
          pageSize: 20,
          totalPages: 0,
          availableComponents: [],
        }),
      });
      
      // Render with server loading
      render(<LogViewer loadLogsFromServer={true} />);
      
      // Check empty state
      expect(screen.getByText('Loading logs...')).toBeInTheDocument();
    });
    
    it('should handle fetch errors', async () => {
      // Mock fetch error
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      // Render with server loading
      render(<LogViewer loadLogsFromServer={true} />);
      
      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/Failed to fetch logs/)).toBeInTheDocument();
      });
    });
    
    it('should render with custom title and description', () => {
      // Render with custom title and description
      render(
        <LogViewer 
          initialLogs={sampleLogs} 
          loadLogsFromServer={false}
          title="Custom Title"
          description="Custom Description" 
        />
      );
      
      // Check title and description
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
      expect(screen.getByText('Custom Description')).toBeInTheDocument();
    });
  });
  
  describe('filtering', () => {
    it('should filter logs by level', async () => {
      const user = userEvent.setup();
      
      // Render component
      render(<LogViewer initialLogs={sampleLogs} loadLogsFromServer={false} />);
      
      // Open level select
      await user.click(screen.getByRole('combobox', { name: /Log Level/i }));
      
      // Select ERROR level
      await user.click(screen.getByRole('option', { name: /Error/i }));
      
      // Apply filters
      await user.click(screen.getByRole('button', { name: /Apply Filters/i }));
      
      // Log should be filtered to show only ERROR logs
      expect(screen.getByText('Test error message')).toBeInTheDocument();
      expect(screen.queryByText('Test log message 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Test debug message')).not.toBeInTheDocument();
    });
    
    it('should filter logs by component', async () => {
      const user = userEvent.setup();
      
      // Render component
      render(<LogViewer initialLogs={sampleLogs} loadLogsFromServer={false} />);
      
      // Open component select
      await user.click(screen.getByRole('combobox', { name: /Component/i }));
      
      // Select AnotherComponent
      await user.click(screen.getByRole('option', { name: /AnotherComponent/i }));
      
      // Apply filters
      await user.click(screen.getByRole('button', { name: /Apply Filters/i }));
      
      // Log should be filtered to show only AnotherComponent logs
      expect(screen.getByText('Test debug message')).toBeInTheDocument();
      expect(screen.queryByText('Test log message 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Test error message')).not.toBeInTheDocument();
    });
    
    it('should filter logs by search text', async () => {
      const user = userEvent.setup();
      
      // Render component
      render(<LogViewer initialLogs={sampleLogs} loadLogsFromServer={false} />);
      
      // Enter search text
      await user.type(screen.getByPlaceholderText('Search logs...'), 'error');
      
      // Apply filters
      await user.click(screen.getByRole('button', { name: /Apply Filters/i }));
      
      // Log should be filtered to show only logs with "error"
      expect(screen.getByText('Test error message')).toBeInTheDocument();
      expect(screen.queryByText('Test log message 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Test debug message')).not.toBeInTheDocument();
    });
    
    it('should filter logs by correlation ID', async () => {
      const user = userEvent.setup();
      
      // Render component
      render(<LogViewer initialLogs={sampleLogs} loadLogsFromServer={false} />);
      
      // Enter correlation ID
      await user.type(
        screen.getByPlaceholderText('Filter by correlation ID'),
        'test-correlation-id-1'
      );
      
      // Apply filters
      await user.click(screen.getByRole('button', { name: /Apply Filters/i }));
      
      // Log should be filtered to show only logs with the specified correlation ID
      expect(screen.getByText('Test log message 1')).toBeInTheDocument();
      expect(screen.queryByText('Test error message')).not.toBeInTheDocument();
      expect(screen.queryByText('Test debug message')).not.toBeInTheDocument();
    });
    
    it('should reset filters', async () => {
      const user = userEvent.setup();
      
      // Render component
      render(<LogViewer initialLogs={sampleLogs} loadLogsFromServer={false} />);
      
      // Apply some filters
      await user.type(screen.getByPlaceholderText('Search logs...'), 'error');
      await user.click(screen.getByRole('button', { name: /Apply Filters/i }));
      
      // Only error message should be visible
      expect(screen.getByText('Test error message')).toBeInTheDocument();
      expect(screen.queryByText('Test log message 1')).not.toBeInTheDocument();
      
      // Reset filters
      await user.click(screen.getByRole('button', { name: /Reset/i }));
      
      // All logs should be visible again
      expect(screen.getByText('Test log message 1')).toBeInTheDocument();
      expect(screen.getByText('Test error message')).toBeInTheDocument();
      expect(screen.getByText('Test debug message')).toBeInTheDocument();
    });
  });
  
  describe('expanded log view', () => {
    it('should toggle log details when clicking on a log', async () => {
      const user = userEvent.setup();
      
      // Render component
      render(<LogViewer initialLogs={sampleLogs} loadLogsFromServer={false} />);
      
      // Initially details should not be visible
      expect(screen.queryByText('Correlation ID')).not.toBeInTheDocument();
      
      // Click on the first log
      await user.click(screen.getByText('Test log message 1'));
      
      // Details should now be visible
      expect(screen.getByText('Correlation ID')).toBeInTheDocument();
      expect(screen.getByText('test-correlation-id-1')).toBeInTheDocument();
      
      // Click again to hide details
      await user.click(screen.getByText('Test log message 1'));
      
      // Details should be hidden again
      expect(screen.queryByText('Correlation ID')).not.toBeInTheDocument();
    });
    
    it('should show stack trace for error logs', async () => {
      const user = userEvent.setup();
      
      // Render component
      render(<LogViewer initialLogs={sampleLogs} loadLogsFromServer={false} />);
      
      // Click on the error log
      await user.click(screen.getByText('Test error message'));
      
      // Stack trace should be visible
      expect(screen.getByText('Stack Trace')).toBeInTheDocument();
      
      // Expand stack trace accordion
      await user.click(screen.getByText('Stack Trace'));
      
      // Stack trace content should be visible
      expect(screen.getByText(/Error: Test error/)).toBeInTheDocument();
    });
    
    it('should show data for logs with data', async () => {
      const user = userEvent.setup();
      
      // Render component
      render(<LogViewer initialLogs={sampleLogs} loadLogsFromServer={false} />);
      
      // Click on the debug log
      await user.click(screen.getByText('Test debug message'));
      
      // Data section should be visible
      expect(screen.getByText('Data')).toBeInTheDocument();
      
      // Expand data accordion
      await user.click(screen.getByText('Data'));
      
      // Data content should be visible
      expect(screen.getByText(/"key": "value"/)).toBeInTheDocument();
      
      // Click "View in JSON Viewer" button
      await user.click(screen.getByText('View in JSON Viewer'));
      
      // JSON viewer dialog should open
      expect(screen.getByText('JSON Viewer')).toBeInTheDocument();
      
      // Close dialog
      await user.click(screen.getByRole('button', { name: /Close/i }));
      
      // Dialog should be closed
      expect(screen.queryByText('JSON Viewer')).not.toBeInTheDocument();
    });
  });
  
  describe('pagination', () => {
    it('should paginate logs when there are multiple pages', async () => {
      const user = userEvent.setup();
      
      // Mock multi-page response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          logs: sampleLogs.slice(0, 2),
          total: 50,
          page: 1,
          pageSize: 2,
          totalPages: 25,
          availableComponents: ['TestComponent', 'AnotherComponent'],
        }),
      }).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          logs: [sampleLogs[2]],
          total: 50,
          page: 2,
          pageSize: 2,
          totalPages: 25,
          availableComponents: ['TestComponent', 'AnotherComponent'],
        }),
      });
      
      // Render with server loading
      render(<LogViewer loadLogsFromServer={true} defaultPageSize={2} />);
      
      // Wait for first page to load
      await waitFor(() => {
        expect(screen.getByText('Test log message 1')).toBeInTheDocument();
      });
      
      // Pagination should be visible
      expect(screen.getByText('Showing 2 of 50 logs')).toBeInTheDocument();
      
      // Click next page
      await user.click(screen.getByRole('button', { name: /Next/i }));
      
      // Second fetch should be called
      expect(global.fetch).toHaveBeenCalledTimes(2);
      
      // Wait for second page to load
      await waitFor(() => {
        expect(screen.getByText('Test debug message')).toBeInTheDocument();
      });
    });
    
    it('should handle last page correctly', async () => {
      const user = userEvent.setup();
      
      // Mock last page response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          logs: sampleLogs,
          total: 3,
          page: 1,
          pageSize: 3,
          totalPages: 1,
          availableComponents: ['TestComponent', 'AnotherComponent'],
        }),
      });
      
      // Render with server loading
      render(<LogViewer loadLogsFromServer={true} defaultPageSize={3} />);
      
      // Wait for page to load
      await waitFor(() => {
        expect(screen.getByText('Test log message 1')).toBeInTheDocument();
      });
      
      // Pagination info should show correct count
      expect(screen.getByText('Showing 3 of 3 logs')).toBeInTheDocument();
      
      // Next button should be disabled
      expect(screen.getByRole('button', { name: /Next/i })).toBeDisabled();
    });
  });
  
  describe('refreshing and exporting', () => {
    it('should refresh logs when refresh button is clicked', async () => {
      const user = userEvent.setup();
      
      // Render with server loading
      render(<LogViewer loadLogsFromServer={true} />);
      
      // Wait for initial fetch
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });
      
      // Click refresh button
      await user.click(screen.getByRole('button', { name: /Refresh/i }));
      
      // Second fetch should be called
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
    
    it('should export logs when export button is clicked', async () => {
      const user = userEvent.setup();
      
      // Mock document.createElement and element.click
      const mockLink = {
        setAttribute: jest.fn(),
        click: jest.fn(),
      };
      
      jest.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLElement);
      
      // Render with initialLogs and export enabled
      render(<LogViewer initialLogs={sampleLogs} loadLogsFromServer={false} allowExport={true} />);
      
      // Export button should be visible
      const exportButton = screen.getByRole('button', { name: /Export/i });
      expect(exportButton).toBeInTheDocument();
      
      // Click export button
      await user.click(exportButton);
      
      // Link should be created and clicked
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.setAttribute).toHaveBeenCalledWith('href', expect.stringContaining('data:application/json'));
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', expect.stringMatching(/logs-export-.*\.json/));
      expect(mockLink.click).toHaveBeenCalled();
      
      // Logger should log the export
      expect(clientLogger.createChildLogger('LogViewer').info).toHaveBeenCalledWith(
        'Exported logs',
        expect.any(Object)
      );
    });
    
    it('should not show export button when allowExport is false', () => {
      // Render with export disabled
      render(<LogViewer initialLogs={sampleLogs} loadLogsFromServer={false} allowExport={false} />);
      
      // Export button should not be visible
      expect(screen.queryByRole('button', { name: /Export/i })).not.toBeInTheDocument();
    });
    
    it('should handle export errors', async () => {
      const user = userEvent.setup();
      
      // Mock document.createElement to throw error
      jest.spyOn(document, 'createElement').mockImplementation(() => {
        throw new Error('Export error');
      });
      
      // Render with initialLogs and export enabled
      render(<LogViewer initialLogs={sampleLogs} loadLogsFromServer={false} allowExport={true} />);
      
      // Click export button
      await user.click(screen.getByRole('button', { name: /Export/i }));
      
      // Error should be logged
      expect(clientLogger.createChildLogger('LogViewer').error).toHaveBeenCalledWith(
        'Failed to export logs',
        expect.any(Object)
      );
    });
  });
  
  describe('auto-refresh', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    
    afterEach(() => {
      jest.useRealTimers();
    });
    
    it('should auto-refresh logs when enabled', async () => {
      // Render with auto-refresh enabled
      render(<LogViewer loadLogsFromServer={true} autoRefresh={true} autoRefreshInterval={30000} />);
      
      // Initial fetch
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });
      
      // Clear mock
      (global.fetch as jest.Mock).mockClear();
      
      // Advance timers by refresh interval
      jest.advanceTimersByTime(30000);
      
      // Should fetch again
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
    
    it('should not auto-refresh when disabled', async () => {
      // Render with auto-refresh disabled
      render(<LogViewer loadLogsFromServer={true} autoRefresh={false} />);
      
      // Initial fetch
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });
      
      // Clear mock
      (global.fetch as jest.Mock).mockClear();
      
      // Advance timers by refresh interval
      jest.advanceTimersByTime(30000);
      
      // Should not fetch again
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
