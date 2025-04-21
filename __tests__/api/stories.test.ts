/**
 * Stories API Tests
 */

import { GET, POST } from '@/app/api/stories/route';
import { mockSession, testApiRoute, createMockDocuments } from './helpers';
import { getUserDb } from '@/lib/user-db';

// Mock database functions
jest.mock('@/lib/user-db', () => ({
  getUserDb: jest.fn(),
  userDbExists: jest.fn().mockResolvedValue(true),
}));

describe('Stories API', () => {
  const storiesApiRoute = testApiRoute({
    path: '/api/stories',
    method: 'get',
    handler: GET,
  });

  const storiesCreateApiRoute = testApiRoute({
    path: '/api/stories',
    method: 'post',
    handler: POST,
  });

  // Create mock stories data
  const mockStories = createMockDocuments(3, (index) => ({
    title: `Test Story ${index + 1}`,
    description: `Description for story ${index + 1}`,
    genre: 'Fantasy',
    tags: ['test', 'fantasy', `tag-${index}`],
    status: 'draft',
    createdAt: new Date(Date.now() - index * 86400000), // Different dates
    updatedAt: new Date(Date.now() - index * 43200000),
    userId: 'test@example.com',
  }));

  beforeEach(() => {
    jest.clearAllMocks();
    mockSession(true, 'test@example.com');

    // Mock the stories collection
    const mockStoriesCollection = {
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue(mockStories),
      }),
      countDocuments: jest.fn().mockResolvedValue(mockStories.length),
      insertOne: jest.fn().mockResolvedValue({ insertedId: 'new-story-id' }),
    };

    // Mock the metadata collection
    const mockMetadataCollection = {
      findOne: jest.fn().mockResolvedValue({ 
        userId: 'test@example.com', 
        createdAt: new Date(), 
        updatedAt: new Date(),
        plan: 'free',
        storiesCount: mockStories.length
      }),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    };

    // Mock the getUserDb function
    (getUserDb as jest.Mock).mockResolvedValue({
      collection: jest.fn((collectionName) => {
        if (collectionName === 'stories') return mockStoriesCollection;
        if (collectionName === 'metadata') return mockMetadataCollection;
        return { findOne: jest.fn().mockResolvedValue(null) };
      }),
    });
  });

  describe('GET /api/stories', () => {
    it('should return 401 when not authenticated', async () => {
      mockSession(false);
      const response = await storiesApiRoute.send('/api/stories');
      
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should return a list of stories when authenticated', async () => {
      const response = await storiesApiRoute.send('/api/stories');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('stories');
      expect(response.body).toHaveProperty('total', mockStories.length);
      expect(response.body.stories).toHaveLength(mockStories.length);
      expect(response.body.stories[0]).toHaveProperty('title', mockStories[0].title);
    });

    it('should apply pagination parameters correctly', async () => {
      const mockCollection = (getUserDb as jest.Mock).mock.results[0].value.collection('stories');
      
      await storiesApiRoute.send('/api/stories?limit=5&offset=10&sort=title&order=asc');
      
      expect(mockCollection.find).toHaveBeenCalled();
      expect(mockCollection.find().sort).toHaveBeenCalledWith({ title: 1 });
      expect(mockCollection.find().skip).toHaveBeenCalledWith(10);
      expect(mockCollection.find().limit).toHaveBeenCalledWith(5);
    });

    it('should handle database errors gracefully', async () => {
      // Mock the stories collection to throw an error
      (getUserDb as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      const response = await storiesApiRoute.send('/api/stories');
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch stories');
    });
  });

  describe('POST /api/stories', () => {
    const newStory = {
      title: 'New Test Story',
      description: 'A new story for testing',
      genre: 'Science Fiction',
      tags: ['test', 'sci-fi', 'new'],
    };

    it('should return 401 when not authenticated', async () => {
      mockSession(false);
      const response = await storiesCreateApiRoute.send('/api/stories', newStory);
      
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should create a new story when authenticated', async () => {
      const response = await storiesCreateApiRoute.send('/api/stories', newStory);
      
      const mockStoriesCollection = (getUserDb as jest.Mock).mock.results[0].value.collection('stories');
      const mockMetadataCollection = (getUserDb as jest.Mock).mock.results[0].value.collection('metadata');
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id', 'new-story-id');
      expect(response.body).toHaveProperty('title', newStory.title);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
      
      expect(mockStoriesCollection.insertOne).toHaveBeenCalledWith(expect.objectContaining({
        title: newStory.title,
        description: newStory.description,
        genre: newStory.genre,
        tags: newStory.tags,
        userId: 'test@example.com',
        status: 'draft',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      }));
      
      expect(mockMetadataCollection.updateOne).toHaveBeenCalledWith(
        { userId: 'test@example.com' },
        expect.objectContaining({
          $inc: { storiesCount: 1 },
          $set: { updatedAt: expect.any(Date) },
        })
      );
    });

    it('should return 400 for invalid story data', async () => {
      const invalidStory = {
        // Missing required title
        description: 'Invalid story without title',
      };
      
      const response = await storiesCreateApiRoute.send('/api/stories', invalidStory);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid story data');
    });

    it('should handle database errors gracefully', async () => {
      // Mock the stories collection to throw an error
      const mockCollection = {
        insertOne: jest.fn().mockRejectedValue(new Error('Database error')),
      };

      (getUserDb as jest.Mock).mockResolvedValue({
        collection: jest.fn().mockReturnValue(mockCollection),
      });
      
      const response = await storiesCreateApiRoute.send('/api/stories', newStory);
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to create story');
    });
  });
});
