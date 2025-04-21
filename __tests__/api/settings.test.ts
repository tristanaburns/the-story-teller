/**
 * Settings API Tests
 */

import { NextRequest } from 'next/server';
import { GET, PUT } from '@/app/api/settings/route';
import { mockSession, testApiRoute } from './helpers';
import { getUserDb } from '@/lib/user-db';

// Mock database functions
jest.mock('@/lib/user-db', () => ({
  getUserDb: jest.fn(),
}));

describe('Settings API', () => {
  const settingsApiRoute = testApiRoute({
    path: '/api/settings',
    method: 'get',
    handler: GET,
  });

  const settingsUpdateApiRoute = testApiRoute({
    path: '/api/settings',
    method: 'put',
    handler: PUT,
  });

  // Default mock settings
  const mockSettings = {
    userId: 'test@example.com',
    displayName: 'Test User',
    email: 'test@example.com',
    theme: 'system',
    editorFontSize: 16,
    enableAIFeatures: true,
    enableEmailNotifications: false,
    logLevel: 'info',
    mcpServers: {
      memory: true,
      art: true,
      thinking: true,
      database: true,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSession(true, 'test@example.com');

    // Mock the settings collection
    const mockCollection = {
      findOne: jest.fn().mockResolvedValue(mockSettings),
      updateOne: jest.fn().mockResolvedValue({ matchedCount: 1, modifiedCount: 1 }),
      insertOne: jest.fn().mockResolvedValue({ insertedId: 'mock-id' }),
    };

    // Mock the getUserDb function
    (getUserDb as jest.Mock).mockResolvedValue({
      collection: jest.fn().mockReturnValue(mockCollection),
    });
  });

  describe('GET /api/settings', () => {
    it('should return 401 when not authenticated', async () => {
      mockSession(false);
      const response = await settingsApiRoute.send('/api/settings');
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should return user settings when authenticated', async () => {
      const response = await settingsApiRoute.send('/api/settings');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSettings);
    });

    it('should create default settings when none exist', async () => {
      // Mock findOne to return null (no settings found)
      const mockCollection = {
        findOne: jest.fn().mockResolvedValue(null),
        insertOne: jest.fn().mockResolvedValue({ insertedId: 'mock-id' }),
      };

      (getUserDb as jest.Mock).mockResolvedValue({
        collection: jest.fn().mockReturnValue(mockCollection),
      });

      const response = await settingsApiRoute.send('/api/settings');
      
      expect(response.status).toBe(200);
      expect(mockCollection.insertOne).toHaveBeenCalled();
      expect(response.body).toHaveProperty('userId', 'test@example.com');
      expect(response.body).toHaveProperty('theme', 'system');
    });

    it('should handle database errors gracefully', async () => {
      (getUserDb as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      const response = await settingsApiRoute.send('/api/settings');
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch settings');
    });
  });

  describe('PUT /api/settings', () => {
    const updatedSettings = {
      displayName: 'Updated User',
      theme: 'dark',
      editorFontSize: 18,
      enableAIFeatures: false,
      enableEmailNotifications: true,
      logLevel: 'debug',
      mcpServers: {
        memory: true,
        art: false,
        thinking: true,
        database: false,
      },
    };

    it('should return 401 when not authenticated', async () => {
      mockSession(false);
      const response = await settingsUpdateApiRoute.send('/api/settings', updatedSettings);
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should update user settings when authenticated', async () => {
      const response = await settingsUpdateApiRoute.send('/api/settings', updatedSettings);
      
      const mockCollection = (getUserDb as jest.Mock).mock.results[0].value.collection();
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Settings updated successfully');
      
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { userId: 'test@example.com' },
        { $set: expect.objectContaining({
          displayName: 'Updated User',
          theme: 'dark',
          editorFontSize: 18,
          enableAIFeatures: false,
          updatedAt: expect.any(Date),
        })},
        { upsert: true }
      );
    });

    it('should return 400 for invalid settings data', async () => {
      const invalidSettings = {
        displayName: '',  // Empty name is invalid
        theme: 'invalid-theme',  // Invalid theme value
        editorFontSize: 5,  // Too small font size
        enableAIFeatures: 'not-a-boolean',  // Should be boolean
        enableEmailNotifications: true,
      };
      
      const response = await settingsUpdateApiRoute.send('/api/settings', invalidSettings);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid settings data');
    });

    it('should handle database errors gracefully', async () => {
      const mockCollection = {
        updateOne: jest.fn().mockRejectedValue(new Error('Database error')),
      };

      (getUserDb as jest.Mock).mockResolvedValue({
        collection: jest.fn().mockReturnValue(mockCollection),
      });
      
      const response = await settingsUpdateApiRoute.send('/api/settings', updatedSettings);
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to update settings');
    });
  });
});
