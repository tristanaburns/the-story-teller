/**
 * Memory MCP Server
 * 
 * Model Context Protocol server for memory management.
 * Stores, retrieves, and manages narrative memory context.
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const port = process.env.MEMORY_MCP_PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
let db;
const mongoUrl = process.env.MEMORY_MCP_MONGODB_URI || 'mongodb://localhost:27017/memory-mcp';
const dbName = process.env.MEMORY_MCP_DB_NAME || 'memory-mcp';

// Connect to MongoDB
async function connectToDatabase() {
  try {
    const client = new MongoClient(mongoUrl);
    await client.connect();
    console.log('Connected to MongoDB');
    db = client.db(dbName);
    
    // Create indexes for better query performance
    await db.collection('memories').createIndex({ userId: 1 });
    await db.collection('memories').createIndex({ 'metadata.storyId': 1 });
    await db.collection('memories').createIndex({ contextId: 1 });
    await db.collection('memories').createIndex({ tags: 1 });
    
    return client;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

// Basic authentication middleware
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (process.env.API_KEY_REQUIRED === 'true') {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        error: 'Missing or invalid authorization header',
        serverId: 'memory-mcp',
        action: req.body.action || 'unknown',
        requestId: req.body.requestId || 'unknown',
        responseId: generateResponseId(),
        timestamp: Date.now()
      });
    }

    const apiKey = authHeader.split(' ')[1];
    if (apiKey !== process.env.API_KEY) {
      return res.status(401).json({
        status: 'error',
        error: 'Invalid API key',
        serverId: 'memory-mcp',
        action: req.body.action || 'unknown',
        requestId: req.body.requestId || 'unknown',
        responseId: generateResponseId(),
        timestamp: Date.now()
      });
    }
  }

  next();
}

// Request validation middleware
function validateRequest(req, res, next) {
  const { action, userId, payload, requestId } = req.body;

  if (!action || !userId || !payload || !requestId) {
    return res.status(400).json({
      status: 'error',
      error: 'Missing required fields in request: action, userId, payload, requestId',
      serverId: 'memory-mcp',
      action: action || 'unknown',
      requestId: requestId || 'unknown',
      responseId: generateResponseId(),
      timestamp: Date.now()
    });
  }

  next();
}

// Main MCP endpoint
app.post('/', authenticate, validateRequest, async (req, res) => {
  const { action, payload, requestId, userId } = req.body;

  try {
    switch (action) {
      case 'store':
        return await handleStoreMemory(req, res);
      case 'retrieve':
        return await handleRetrieveMemory(req, res);
      case 'search':
        return await handleSearchMemories(req, res);
      case 'consolidate':
        return await handleConsolidateMemories(req, res);
      case 'rank':
        return await handleRankMemories(req, res);
      case 'delete':
        return await handleDeleteMemory(req, res);
      default:
        return res.status(400).json({
          status: 'error',
          error: `Unknown action: ${action}`,
          serverId: 'memory-mcp',
          action,
          requestId,
          responseId: generateResponseId(),
          timestamp: Date.now()
        });
    }
  } catch (error) {
    console.error(`Error handling ${action} action:`, error);
    return res.status(500).json({
      status: 'error',
      error: `Internal server error: ${error.message}`,
      serverId: 'memory-mcp',
      action,
      requestId,
      responseId: generateResponseId(),
      timestamp: Date.now()
    });
  }
});

// Action handlers
async function handleStoreMemory(req, res) {
  const { payload, requestId, userId } = req.body;
  const { content, contextId, storyId, tags = [], metadata = {}, importance = 1 } = payload;

  if (!content) {
    return res.status(400).json({
      status: 'error',
      error: 'Missing required field: content',
      serverId: 'memory-mcp',
      action: 'store',
      requestId,
      responseId: generateResponseId(),
      timestamp: Date.now()
    });
  }

  const memory = {
    userId,
    content,
    importance,
    tags,
    metadata: {
      ...metadata,
      storyId,
    },
    timestamp: Date.now(),
    contextId: contextId || 'default'
  };

  const result = await db.collection('memories').insertOne(memory);

  return res.json({
    serverId: 'memory-mcp',
    action: 'store',
    status: 'success',
    payload: {
      memoryId: result.insertedId.toString(),
      content,
      importance,
      tags,
      metadata: memory.metadata,
      contextId: memory.contextId
    },
    requestId,
    responseId: generateResponseId(),
    timestamp: Date.now()
  });
}

async function handleRetrieveMemory(req, res) {
  const { payload, requestId, userId } = req.body;
  const { memoryId } = payload;

  if (!memoryId) {
    return res.status(400).json({
      status: 'error',
      error: 'Missing required field: memoryId',
      serverId: 'memory-mcp',
      action: 'retrieve',
      requestId,
      responseId: generateResponseId(),
      timestamp: Date.now()
    });
  }

  try {
    const memory = await db.collection('memories').findOne({
      _id: new ObjectId(memoryId),
      userId
    });

    if (!memory) {
      return res.status(404).json({
        status: 'error',
        error: `Memory not found with ID: ${memoryId}`,
        serverId: 'memory-mcp',
        action: 'retrieve',
        requestId,
        responseId: generateResponseId(),
        timestamp: Date.now()
      });
    }

    return res.json({
      serverId: 'memory-mcp',
      action: 'retrieve',
      status: 'success',
      payload: {
        memoryId: memory._id.toString(),
        content: memory.content,
        importance: memory.importance,
        tags: memory.tags,
        metadata: memory.metadata,
        contextId: memory.contextId
      },
      requestId,
      responseId: generateResponseId(),
      timestamp: Date.now()
    });
  } catch (error) {
    if (error.name === 'BSONTypeError') {
      return res.status(400).json({
        status: 'error',
        error: `Invalid memory ID format: ${memoryId}`,
        serverId: 'memory-mcp',
        action: 'retrieve',
        requestId,
        responseId: generateResponseId(),
        timestamp: Date.now()
      });
    }
    throw error;
  }
}

async function handleSearchMemories(req, res) {
  const { payload, requestId, userId } = req.body;
  const { query, tags, timeframe, storyId, contextId } = payload;

  const filter = { userId };

  if (storyId) {
    filter['metadata.storyId'] = storyId;
  }

  if (contextId) {
    filter.contextId = contextId;
  }

  if (tags && tags.length > 0) {
    filter.tags = { $in: tags };
  }

  if (timeframe) {
    filter.timestamp = {};
    
    if (timeframe.start) {
      filter.timestamp.$gte = new Date(timeframe.start).getTime();
    }
    
    if (timeframe.end) {
      filter.timestamp.$lte = new Date(timeframe.end).getTime();
    }
  }

  // Text search (if supported by your MongoDB version)
  if (query) {
    // Simple regex search as a fallback
    filter.content = { $regex: query, $options: 'i' };
    
    // You could use MongoDB text search here if you've set up the appropriate text index
    // This requires setting up a text index on the content field
  }

  const memories = await db.collection('memories')
    .find(filter)
    .sort({ importance: -1, timestamp: -1 })
    .toArray();

  return res.json({
    serverId: 'memory-mcp',
    action: 'search',
    status: 'success',
    payload: {
      memories: memories.map(memory => ({
        id: memory._id.toString(),
        content: memory.content,
        importance: memory.importance,
        tags: memory.tags,
        metadata: memory.metadata,
        timestamp: memory.timestamp,
        contextId: memory.contextId
      }))
    },
    requestId,
    responseId: generateResponseId(),
    timestamp: Date.now()
  });
}

async function handleConsolidateMemories(req, res) {
  const { payload, requestId, userId } = req.body;
  const { memoryIds, query, storyId, contextId } = payload;

  let memoriesToConsolidate = [];

  if (memoryIds && memoryIds.length > 0) {
    const objectIds = memoryIds.map(id => {
      try {
        return new ObjectId(id);
      } catch (error) {
        console.warn(`Invalid ObjectId: ${id}`);
        return null;
      }
    }).filter(id => id !== null);

    memoriesToConsolidate = await db.collection('memories').find({
      _id: { $in: objectIds },
      userId
    }).toArray();
  } else {
    // Reuse search functionality
    const searchFilter = { userId };
    
    if (storyId) {
      searchFilter['metadata.storyId'] = storyId;
    }
    
    if (contextId) {
      searchFilter.contextId = contextId;
    }
    
    if (query) {
      searchFilter.content = { $regex: query, $options: 'i' };
    }

    memoriesToConsolidate = await db.collection('memories')
      .find(searchFilter)
      .sort({ importance: -1, timestamp: -1 })
      .toArray();
  }

  if (memoriesToConsolidate.length === 0) {
    return res.status(404).json({
      status: 'error',
      error: 'No memories found to consolidate',
      serverId: 'memory-mcp',
      action: 'consolidate',
      requestId,
      responseId: generateResponseId(),
      timestamp: Date.now()
    });
  }

  // Simple consolidation (in a real implementation, would use more sophisticated NLP techniques)
  const consolidatedContent = memoriesToConsolidate
    .sort((a, b) => b.importance - a.importance)
    .map(memory => memory.content)
    .join('\n\n');

  // Extract all unique tags
  const consolidatedTags = Array.from(
    new Set(memoriesToConsolidate.flatMap(memory => memory.tags))
  );

  // Use highest importance value
  const maxImportance = Math.max(
    ...memoriesToConsolidate.map(memory => memory.importance)
  );

  // Store the consolidated memory
  const consolidatedMemory = {
    userId,
    content: consolidatedContent,
    importance: maxImportance,
    tags: consolidatedTags,
    metadata: {
      sourceMemoryCount: memoriesToConsolidate.length,
      sourceMemoryIds: memoriesToConsolidate.map(m => m._id.toString()),
      storyId: storyId || memoriesToConsolidate[0].metadata.storyId,
      consolidated: true
    },
    timestamp: Date.now(),
    contextId: contextId || memoriesToConsolidate[0].contextId
  };

  const result = await db.collection('memories').insertOne(consolidatedMemory);

  return res.json({
    serverId: 'memory-mcp',
    action: 'consolidate',
    status: 'success',
    payload: {
      memoryId: result.insertedId.toString(),
      content: consolidatedContent,
      tags: consolidatedTags,
      importance: maxImportance,
      metadata: consolidatedMemory.metadata,
      contextId: consolidatedMemory.contextId
    },
    requestId,
    responseId: generateResponseId(),
    timestamp: Date.now()
  });
}

async function handleRankMemories(req, res) {
  const { payload, requestId, userId } = req.body;
  const { memoryIds, query, storyId, contextId } = payload;

  let memoriesToRank = [];

  if (memoryIds && memoryIds.length > 0) {
    const objectIds = memoryIds.map(id => {
      try {
        return new ObjectId(id);
      } catch (error) {
        console.warn(`Invalid ObjectId: ${id}`);
        return null;
      }
    }).filter(id => id !== null);

    memoriesToRank = await db.collection('memories').find({
      _id: { $in: objectIds },
      userId
    }).toArray();
  } else {
    // Reuse search functionality
    const searchFilter = { userId };
    
    if (storyId) {
      searchFilter['metadata.storyId'] = storyId;
    }
    
    if (contextId) {
      searchFilter.contextId = contextId;
    }
    
    if (query) {
      searchFilter.content = { $regex: query, $options: 'i' };
    }

    memoriesToRank = await db.collection('memories').find(searchFilter).toArray();
  }

  if (memoriesToRank.length === 0) {
    return res.status(404).json({
      status: 'error',
      error: 'No memories found to rank',
      serverId: 'memory-mcp',
      action: 'rank',
      requestId,
      responseId: generateResponseId(),
      timestamp: Date.now()
    });
  }

  // Sort memories by importance and timestamp
  const rankedMemories = memoriesToRank.sort((a, b) => {
    // First sort by importance (descending)
    if (b.importance !== a.importance) {
      return b.importance - a.importance;
    }
    // Then by recency (descending)
    return b.timestamp - a.timestamp;
  });

  // In a real implementation, you might update the importance values based on relevance
  // and other factors, then save those updates back to the database

  return res.json({
    serverId: 'memory-mcp',
    action: 'rank',
    status: 'success',
    payload: {
      memories: rankedMemories.map(memory => ({
        id: memory._id.toString(),
        content: memory.content,
        importance: memory.importance,
        tags: memory.tags,
        metadata: memory.metadata,
        timestamp: memory.timestamp,
        contextId: memory.contextId
      }))
    },
    requestId,
    responseId: generateResponseId(),
    timestamp: Date.now()
  });
}

async function handleDeleteMemory(req, res) {
  const { payload, requestId, userId } = req.body;
  const { memoryId } = payload;

  if (!memoryId) {
    return res.status(400).json({
      status: 'error',
      error: 'Missing required field: memoryId',
      serverId: 'memory-mcp',
      action: 'delete',
      requestId,
      responseId: generateResponseId(),
      timestamp: Date.now()
    });
  }

  try {
    const result = await db.collection('memories').deleteOne({
      _id: new ObjectId(memoryId),
      userId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        status: 'error',
        error: `Memory not found with ID: ${memoryId}`,
        serverId: 'memory-mcp',
        action: 'delete',
        requestId,
        responseId: generateResponseId(),
        timestamp: Date.now()
      });
    }

    return res.json({
      serverId: 'memory-mcp',
      action: 'delete',
      status: 'success',
      payload: {
        memoryId
      },
      requestId,
      responseId: generateResponseId(),
      timestamp: Date.now()
    });
  } catch (error) {
    if (error.name === 'BSONTypeError') {
      return res.status(400).json({
        status: 'error',
        error: `Invalid memory ID format: ${memoryId}`,
        serverId: 'memory-mcp',
        action: 'delete',
        requestId,
        responseId: generateResponseId(),
        timestamp: Date.now()
      });
    }
    throw error;
  }
}

// Utility functions
function generateResponseId() {
  return 'res_' + Math.random().toString(36).substring(2, 15);
}

// Server setup
(async () => {
  const client = await connectToDatabase();
  
  // Action-specific endpoints
  app.post('/store', authenticate, validateRequest, handleStoreMemory);
  app.post('/retrieve', authenticate, validateRequest, handleRetrieveMemory);
  app.post('/search', authenticate, validateRequest, handleSearchMemories);
  app.post('/consolidate', authenticate, validateRequest, handleConsolidateMemories);
  app.post('/rank', authenticate, validateRequest, handleRankMemories);
  app.post('/delete', authenticate, validateRequest, handleDeleteMemory);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      serverId: 'memory-mcp',
      version: '1.0.0',
      timestamp: Date.now()
    });
  });

  // Start the server
  app.listen(port, () => {
    console.log(`Memory MCP server running on port ${port}`);
  });

  // Handle graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    await client.close();
    process.exit(0);
  });
})();
