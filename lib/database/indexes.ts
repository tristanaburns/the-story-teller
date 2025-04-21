import { Db } from 'mongodb';
import { Logger } from '@/lib/logging/logger';

// Create a logger instance
const logger = new Logger('database:indexes');

/**
 * Ensures that all necessary indexes are created for the database
 * 
 * @param db The database connection
 * @param userId The ID of the user who owns the database (for logging)
 */
export async function setupDatabaseIndexes(db: Db, userId: string) {
  try {
    logger.info('Setting up database indexes', { userId });
    
    // Stories collection indexes
    const storyIndexes = [
      { key: { title: 1 }, name: 'title_index' },
      { key: { createdAt: -1 }, name: 'createdAt_index' },
      { key: { updatedAt: -1 }, name: 'updatedAt_index' },
      { key: { userId: 1 }, name: 'userId_index' },
      { key: { status: 1 }, name: 'status_index' },
      { key: { title: 'text', description: 'text' }, name: 'text_search_index' }
    ];
    
    for (const index of storyIndexes) {
      await db.collection('stories').createIndex(index.key, { name: index.name });
      logger.debug(`Created index ${index.name} on stories collection`, { userId });
    }
    
    // Characters collection indexes
    const characterIndexes = [
      { key: { name: 1 }, name: 'name_index' },
      { key: { storyId: 1 }, name: 'storyId_index' },
      { key: { createdAt: -1 }, name: 'createdAt_index' },
      { key: { updatedAt: -1 }, name: 'updatedAt_index' },
      { key: { 'attributes.role': 1 }, name: 'role_index' },
      { key: { name: 'text', background: 'text' }, name: 'character_text_search_index' }
    ];
    
    for (const index of characterIndexes) {
      await db.collection('characters').createIndex(index.key, { name: index.name });
      logger.debug(`Created index ${index.name} on characters collection`, { userId });
    }
    
    // Locations collection indexes
    const locationIndexes = [
      { key: { name: 1 }, name: 'name_index' },
      { key: { storyId: 1 }, name: 'storyId_index' },
      { key: { createdAt: -1 }, name: 'createdAt_index' },
      { key: { updatedAt: -1 }, name: 'updatedAt_index' },
      { key: { 'coordinates.lat': 1, 'coordinates.lng': 1 }, name: 'coordinates_index' },
      { key: { name: 'text', description: 'text' }, name: 'location_text_search_index' }
    ];
    
    for (const index of locationIndexes) {
      await db.collection('locations').createIndex(index.key, { name: index.name });
      logger.debug(`Created index ${index.name} on locations collection`, { userId });
    }
    
    // Timeline events collection indexes
    const timelineEventIndexes = [
      { key: { title: 1 }, name: 'title_index' },
      { key: { storyId: 1 }, name: 'storyId_index' },
      { key: { date: 1 }, name: 'date_index' },
      { key: { createdAt: -1 }, name: 'createdAt_index' },
      { key: { updatedAt: -1 }, name: 'updatedAt_index' },
      { key: { 'participants.id': 1 }, name: 'participants_index' },
      { key: { title: 'text', description: 'text' }, name: 'event_text_search_index' }
    ];
    
    for (const index of timelineEventIndexes) {
      await db.collection('timelineEvents').createIndex(index.key, { name: index.name });
      logger.debug(`Created index ${index.name} on timelineEvents collection`, { userId });
    }
    
    // Relationships collection indexes
    const relationshipIndexes = [
      { key: { storyId: 1 }, name: 'storyId_index' },
      { key: { fromId: 1 }, name: 'fromId_index' },
      { key: { toId: 1 }, name: 'toId_index' },
      { key: { type: 1 }, name: 'type_index' },
      { key: { fromType: 1 }, name: 'fromType_index' },
      { key: { toType: 1 }, name: 'toType_index' },
      { key: { description: 'text' }, name: 'relationship_text_search_index' }
    ];
    
    for (const index of relationshipIndexes) {
      await db.collection('relationships').createIndex(index.key, { name: index.name });
      logger.debug(`Created index ${index.name} on relationships collection`, { userId });
    }
    
    // Story content collection indexes
    const storyContentIndexes = [
      { key: { storyId: 1 }, name: 'storyId_index' },
      { key: { version: -1 }, name: 'version_index' },
      { key: { createdAt: -1 }, name: 'createdAt_index' },
      { key: { updatedAt: -1 }, name: 'updatedAt_index' },
      { key: { content: 'text' }, name: 'content_text_search_index' }
    ];
    
    for (const index of storyContentIndexes) {
      await db.collection('storyContent').createIndex(index.key, { name: index.name });
      logger.debug(`Created index ${index.name} on storyContent collection`, { userId });
    }
    
    // Settings collection indexes
    const settingsIndexes = [
      { key: { userId: 1 }, name: 'userId_index', unique: true }
    ];
    
    for (const index of settingsIndexes) {
      await db.collection('settings').createIndex(index.key, { name: index.name, unique: index.unique });
      logger.debug(`Created index ${index.name} on settings collection`, { userId });
    }
    
    // Logging collection indexes (if using MongoDB for logging)
    if (await collectionExists(db, 'logs')) {
      const logIndexes = [
        { key: { timestamp: -1 }, name: 'timestamp_index' },
        { key: { level: 1 }, name: 'level_index' },
        { key: { component: 1 }, name: 'component_index' },
        { key: { correlationId: 1 }, name: 'correlationId_index' },
        { key: { message: 'text' }, name: 'message_text_search_index' }
      ];
      
      for (const index of logIndexes) {
        await db.collection('logs').createIndex(index.key, { name: index.name });
        logger.debug(`Created index ${index.name} on logs collection`, { userId });
      }
    }
    
    // MCP Memory collection indexes
    if (await collectionExists(db, 'mcpMemory')) {
      const memoryIndexes = [
        { key: { storyId: 1 }, name: 'storyId_index' },
        { key: { context: 1 }, name: 'context_index' },
        { key: { importance: -1 }, name: 'importance_index' },
        { key: { createdAt: -1 }, name: 'createdAt_index' },
        { key: { source: 1 }, name: 'source_index' },
        { key: { content: 'text' }, name: 'memory_text_search_index' }
      ];
      
      for (const index of memoryIndexes) {
        await db.collection('mcpMemory').createIndex(index.key, { name: index.name });
        logger.debug(`Created index ${index.name} on mcpMemory collection`, { userId });
      }
    }
    
    // MCP Art collection indexes
    if (await collectionExists(db, 'mcpArt')) {
      const artIndexes = [
        { key: { storyId: 1 }, name: 'storyId_index' },
        { key: { type: 1 }, name: 'type_index' },
        { key: { entityId: 1 }, name: 'entityId_index' },
        { key: { createdAt: -1 }, name: 'createdAt_index' },
        { key: { tags: 1 }, name: 'tags_index' },
        { key: { description: 'text' }, name: 'art_text_search_index' }
      ];
      
      for (const index of artIndexes) {
        await db.collection('mcpArt').createIndex(index.key, { name: index.name });
        logger.debug(`Created index ${index.name} on mcpArt collection`, { userId });
      }
    }
    
    // MCP Thinking Process collection indexes
    if (await collectionExists(db, 'mcpThinking')) {
      const thinkingIndexes = [
        { key: { storyId: 1 }, name: 'storyId_index' },
        { key: { title: 1 }, name: 'title_index' },
        { key: { status: 1 }, name: 'status_index' },
        { key: { createdAt: -1 }, name: 'createdAt_index' },
        { key: { updatedAt: -1 }, name: 'updatedAt_index' },
        { key: { title: 'text', description: 'text', conclusion: 'text' }, name: 'thinking_text_search_index' }
      ];
      
      for (const index of thinkingIndexes) {
        await db.collection('mcpThinking').createIndex(index.key, { name: index.name });
        logger.debug(`Created index ${index.name} on mcpThinking collection`, { userId });
      }
    }
    
    logger.info('Database indexes setup completed successfully', { userId });
  } catch (error) {
    logger.error('Error setting up database indexes', { error, userId });
    throw error;
  }
}

/**
 * Checks if a collection exists in the database
 * @param db MongoDB database instance
 * @param collectionName Name of the collection to check
 * @returns boolean indicating if collection exists
 */
async function collectionExists(db: Db, collectionName: string): Promise<boolean> {
  const collections = await db.listCollections({ name: collectionName }).toArray();
  return collections.length > 0;
}
