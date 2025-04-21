# Sequential Thinking MCP Server

This is the Sequential Thinking Model Context Protocol (MCP) server for "The Story Teller" application. It provides step-by-step reasoning capabilities to assist with narrative development, character motivation analysis, plot planning, and world-building consistency checking.

## Features

- **Step-by-Step Reasoning**: Break down complex narrative problems into logical steps
- **Character Motivation Analysis**: Understand character decisions and development
- **Plot Development Assistance**: Analyze plot structures and identify inconsistencies
- **World-Building Consistency**: Check for logical consistency in fictional worlds
- **Documentation**: Save thinking processes with their steps and conclusions

## API Endpoints

The server exposes the following endpoints:

- `GET /health` - Check server health and status
- `POST /` - Main entry point for all MCP operations
- `POST /analyze` - Start a new reasoning process
- `POST /addStep` - Add a step to an existing reasoning process
- `POST /complete` - Complete a reasoning process with conclusions
- `POST /getProcess` - Retrieve a specific reasoning process
- `POST /search` - Search for reasoning processes
- `POST /delete` - Delete a reasoning process

## Getting Started

### Prerequisites

- Node.js 20.x or later
- MongoDB (local or Atlas)
- Docker and Docker Compose (optional)

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/thinking-mcp
MONGODB_DB_NAME=thinking-mcp

# API Key Authentication
API_KEY=your_secure_api_key
API_KEY_REQUIRED=true

# Server Configuration
PORT=3003
NODE_ENV=development
```

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   # Development mode
   npm run start:dev
   
   # Production mode
   npm run build
   npm run start:prod
   ```

### Docker Deployment

```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

## API Documentation

Once the server is running, you can access the Swagger API documentation at:

```
http://localhost:3003/api
```

## Examples

### Starting a Thinking Process

```json
{
  "serverId": "thinking-mcp",
  "action": "analyze",
  "userId": "user123",
  "requestId": "req_abc123",
  "timestamp": 1682481632000,
  "payload": {
    "title": "Character motivation analysis",
    "description": "Why is character X making inconsistent decisions?",
    "thinkingType": "character",
    "tags": ["character-development", "motivation"],
    "storyId": "story123",
    "contextId": "character-arc-42",
    "metadata": {
      "character": "John Smith",
      "chapter": 5
    }
  }
}
```

### Adding a Step

```json
{
  "serverId": "thinking-mcp",
  "action": "addStep",
  "userId": "user123",
  "requestId": "req_def456",
  "timestamp": 1682481732000,
  "payload": {
    "processId": "60d21b4667d0d8992e610c85",
    "title": "Examining past behavior patterns",
    "content": "Based on chapters 1-3, character X has shown a consistent pattern of...",
    "reasoning": "This indicates an internal conflict between the character's stated goals and their deeper motivations.",
    "conclusion": "The character's inconsistent decisions are actually consistent with their deeper character arc.",
    "index": 1
  }
}
```

## Integration with The Story Teller

This MCP server is designed to integrate with The Story Teller application. It can be used to:

1. Analyze character motivations and development
2. Plan and structure plot points
3. Ensure consistency in world-building
4. Document the reasoning behind narrative decisions

## License

This project is licensed under the MIT License - see the LICENSE file for details.
