# The Story Teller MCP Servers

This directory contains Model Context Protocol (MCP) servers used by The Story Teller application. Each MCP server provides specialized AI functionality to enhance the storytelling experience.

## Available MCP Servers

### Memory MCP Server
- **Directory**: `memory/`
- **Purpose**: Stores, retrieves, and manages narrative memory context
- **Features**:
  - Memory storage and retrieval
  - Context-aware memory search
  - Memory consolidation and summarization
  - Importance ranking and prioritization
  - Memory timeline management

### Everart MCP Server
- **Directory**: `everart/`
- **Purpose**: Generates and manages artwork for the narrative
- **Features**:
  - Character portrait generation
  - Location visualization
  - Scene illustration
  - Style consistency management
  - Artwork metadata tagging

### Sequential Thinking MCP Server
- **Directory**: `sequential-thinking/`
- **Purpose**: Provides step-by-step reasoning for narrative development
- **Features**:
  - Plot development assistance
  - Character motivation analysis
  - World-building consistency checking
  - Reasoning documentation
  - Cause-and-effect relationship analysis

### MongoDB Atlas MCP Server
- **Directory**: `mongodb-atlas/`
- **Purpose**: Provides schema-aware database operations
- **Features**:
  - Schema validation
  - Complex query construction
  - Data transformation
  - Performance monitoring
  - Schema evolution management

## Setup Instructions

Each MCP server is designed to run as a standalone service. Follow these steps to set up and run an MCP server:

### Prerequisites
- Node.js 20.x or later
- MongoDB (local or Atlas)
- npm or yarn

### General Setup
1. Navigate to the specific MCP server directory (e.g., `cd memory`)
2. Copy the `.env.example` file to `.env` and configure the environment variables
3. Install dependencies: `npm install` or `yarn install`
4. Start the server: `npm start` or `yarn start`

### Memory MCP Server Setup
```bash
cd memory
cp .env.example .env
# Edit .env file with your MongoDB connection string and other settings
npm install
npm start
```

### Testing MCP Servers
Each MCP server includes a health check endpoint. You can test if a server is running correctly by making a GET request to the `/health` endpoint:

```bash
curl http://localhost:3001/health  # Memory MCP
curl http://localhost:3002/health  # Everart MCP
curl http://localhost:3003/health  # Sequential Thinking MCP
curl http://localhost:3004/health  # MongoDB Atlas MCP
```

## Docker Support

Each MCP server includes a Dockerfile for containerization. To build and run a server using Docker:

```bash
# Building the Docker image
cd memory
docker build -t memory-mcp .

# Running the container
docker run -p 3001:3001 --env-file .env memory-mcp
```

## Development

### Adding New Endpoints
To add a new endpoint to an MCP server:

1. Define the endpoint in the server's main file (e.g., `index.js`)
2. Create a handler function for the endpoint
3. Add the appropriate TypeScript interface in the application's `types/mcp.ts` file
4. Add a client function in the appropriate file in `lib/mcp/`

### Testing
Each MCP server includes Jest tests. Run the tests with:

```bash
npm test
```

## MCP Protocol

All MCP servers follow a standardized protocol for requests and responses:

### Request Format
```json
{
  "serverId": "memory-mcp",
  "action": "store",
  "payload": {
    // Action-specific data
  },
  "userId": "user-123",
  "requestId": "req-456",
  "timestamp": 1682481632000
}
```

### Response Format
```json
{
  "serverId": "memory-mcp",
  "action": "store",
  "payload": {
    // Action-specific response data
  },
  "status": "success", // or "error"
  "error": "Error message if status is error",
  "requestId": "req-456",
  "responseId": "res-789",
  "timestamp": 1682481632100
}
```

For more details on the MCP protocol, see the [MCP Protocol Documentation](../documentation/mcp-protocol.md).

## Troubleshooting

### Common Issues

#### MongoDB Connection Errors
- Verify your MongoDB connection string in the `.env` file
- Ensure MongoDB is running
- Check if the database user has the correct permissions

#### Port Conflicts
If you encounter port conflicts, you can change the port in the `.env` file:
```
MEMORY_MCP_PORT=3005
```

#### API Key Authentication Issues
- Check if `API_KEY_REQUIRED` is set to `true` in the `.env` file
- Verify the API key in the request header matches the one in the `.env` file
- Ensure the Authorization header is formatted correctly: `Bearer YOUR_API_KEY`

For more troubleshooting guidance, see the [MCP Troubleshooting Guide](../documentation/mcp-troubleshooting.md).
