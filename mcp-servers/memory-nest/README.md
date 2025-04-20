# Memory MCP Server (NestJS)

A NestJS implementation of the Memory Model Context Protocol (MCP) server for The Story Teller application. This server provides structured memory storage, retrieval, and management for maintaining narrative context in AI-assisted storytelling.

## Features

- Memory storage and retrieval
- Memory search with filtering (by context, story, tags, and content)
- Memory consolidation for summarizing multiple memories
- Memory importance ranking
- API Key authentication
- Swagger API documentation
- Docker support
- Comprehensive testing
- MongoDB integration

## Prerequisites

- Node.js 20.x or later
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Clone the repository
2. Navigate to the memory-nest directory
3. Install dependencies:

```bash
npm install
```

4. Copy the environment example file and configure it:

```bash
cp .env.example .env
# Edit .env with your MongoDB connection string and other settings
```

5. Start the application:

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## Using Docker

### With Docker Compose

This project includes a Docker Compose configuration for easy development setup:

```bash
# Start the server and MongoDB
docker-compose up

# Start in detached mode
docker-compose up -d

# Stop the containers
docker-compose down
```

### With Docker only

```bash
# Build the Docker image
docker build -t memory-mcp .

# Run the container
docker run -p 3001:3001 --env-file .env memory-mcp
```

## API Documentation

The API documentation is available at `/api` when the server is running:

```
http://localhost:3001/api
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## API Endpoints

### Health Check

```
GET /health
```

Returns the server health status.

### Memory Operations

Memory operations use a standardized MCP protocol format:

```typescript
// Request format
{
  "serverId": "memory-mcp",
  "action": "store", // "retrieve", "search", "consolidate", "rank", "delete"
  "userId": "user123",
  "requestId": "req_abc123",
  "timestamp": 1682481632000,
  "payload": {
    // Action-specific data
  }
}

// Response format
{
  "serverId": "memory-mcp",
  "action": "store",
  "status": "success", // or "error"
  "payload": {
    // Action-specific response data
  },
  "requestId": "req_abc123",
  "responseId": "res_def456",
  "timestamp": 1682481632100
}
```

#### Available Endpoints

Each endpoint accepts a POST request with the appropriate action in the request body:

- **POST /** - Main endpoint for all memory operations
- **POST /store** - Store a new memory
- **POST /retrieve** - Retrieve a specific memory
- **POST /search** - Search for memories
- **POST /consolidate** - Consolidate multiple memories
- **POST /rank** - Rank memories by importance
- **POST /delete** - Delete a memory

### Example: Storing a Memory

```json
POST /store

{
  "serverId": "memory-mcp",
  "action": "store",
  "userId": "user123",
  "requestId": "req_abc123",
  "timestamp": 1682481632000,
  "payload": {
    "content": "The character entered the dark room cautiously.",
    "importance": 5,
    "tags": ["character", "action", "setting"],
    "storyId": "story123",
    "contextId": "scene42"
  }
}
```

### Example: Searching Memories

```json
POST /search

{
  "serverId": "memory-mcp",
  "action": "search",
  "userId": "user123",
  "requestId": "req_def456",
  "timestamp": 1682481632000,
  "payload": {
    "query": "dark room",
    "tags": ["setting"],
    "storyId": "story123",
    "contextId": "scene42"
  }
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment (development, production, test) | development |
| PORT | Server port | 3001 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/memory-mcp |
| MONGODB_DB_NAME | MongoDB database name | memory-mcp |
| API_KEY_REQUIRED | Whether API key authentication is required | false |
| API_KEY | API key for authentication | - |
| CORS_ORIGINS | Allowed CORS origins (comma-separated) | http://localhost:3000 |
| LOG_LEVEL | Logging level | info |
| MAX_MEMORIES_PER_USER | Maximum number of memories per user | 1000 |
| DEFAULT_MEMORY_IMPORTANCE | Default importance value for memories | 1 |
| ENABLE_AUTO_TAGGING | Enable automatic tagging of memories | false |
| MONGODB_POOL_SIZE | MongoDB connection pool size | 10 |
| REQUEST_TIMEOUT_MS | Request timeout in milliseconds | 5000 |

## Project Structure

```
memory-nest/
├── src/                          # Source code
│   ├── main.ts                   # Application entry point
│   ├── app.module.ts             # Main application module
│   ├── app.controller.ts         # App controller
│   ├── app.service.ts            # App service
│   ├── memory/                   # Memory module
│   │   ├── dto/                  # Data Transfer Objects
│   │   ├── schemas/              # MongoDB schemas
│   │   ├── repositories/         # Data repositories
│   │   ├── memory.controller.ts  # Memory controller
│   │   ├── memory.service.ts     # Memory service
│   │   └── memory.module.ts      # Memory module definition
│   ├── auth/                     # Authentication
│   │   ├── api-key.guard.ts      # API key guard
│   │   ├── api-key.strategy.ts   # API key strategy
│   │   └── auth.module.ts        # Auth module
│   └── common/                   # Common utilities
│       └── filters/              # Exception filters
├── test/                         # Tests
├── dist/                         # Compiled output
├── node_modules/                 # Dependencies
├── .env.example                  # Environment variables example
├── .gitignore                    # Git ignore file
├── package.json                  # Package config
├── tsconfig.json                 # TypeScript config
├── nest-cli.json                 # NestJS CLI config
├── jest.config.js                # Jest config
├── docker-compose.yml            # Docker Compose config
└── Dockerfile                    # Docker config
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
