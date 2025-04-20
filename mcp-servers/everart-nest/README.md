# Everart MCP Server

A specialized Model Context Protocol (MCP) server for AI-powered artwork generation and management for The Story Teller application.

## Overview

The Everart MCP server provides functionality for generating and managing artwork related to story elements such as characters, locations, and scenes. It's built using NestJS with MongoDB for data storage and follows the Model Context Protocol standard.

## Features

- **Character Portrait Generation**: Create visual representations of characters
- **Location Visualization**: Generate images of story locations
- **Scene Illustration**: Generate artwork depicting key scenes
- **Style Management**: Create and manage artwork styles for consistent aesthetics
- **Artwork Repository**: Store, search, and manage generated artwork
- **MCP Protocol Compliance**: Standard interface for integration with The Story Teller

## Prerequisites

- Node.js 20.x or later
- MongoDB 6.0 or later
- Docker and Docker Compose (optional, for containerized deployment)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
4. Configure environment variables in `.env`

## Configuration

The following environment variables are used:

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3001 |
| NODE_ENV | Environment (development, production) | development |
| MONGODB_URI | MongoDB connection URI | mongodb://localhost:27017/everart-mcp |
| API_KEY | API key for authentication | (required in production) |
| API_AUTH_ENABLED | Enable API key authentication | true |
| LOG_LEVEL | Logging level | debug |

## Running Locally

```bash
# Development mode with hot-reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## Docker Deployment

```bash
# Start with Docker Compose
docker-compose up

# Build and start in detached mode
docker-compose up -d --build
```

## API Documentation

Swagger API documentation is available at `/api` when the server is running.

## MCP Protocol

The Everart MCP server implements the Model Context Protocol, a standardized interface for AI model interactions. The main entry point is the root POST endpoint which accepts different actions:

- `generateArtwork`: Create new artwork
- `getArtwork`: Retrieve artwork
- `updateArtwork`: Modify artwork metadata
- `deleteArtwork`: Remove artwork
- `createStyle`: Create a new style
- `getStyles`: Retrieve styles
- `updateStyle`: Modify style attributes
- `deleteStyle`: Remove a style

Each action has specific request and response structures, documented in the Swagger API.

## Artwork Generation

This server uses a simulated artwork generation process. In a production environment, this would be replaced with:

1. Integration with an image generation model (e.g., DALL-E, Stable Diffusion)
2. Image storage in cloud storage (e.g., AWS S3)
3. Image processing and optimization pipeline

## Style System

The style system provides consistent aesthetics across different artworks:

- **System Styles**: Built-in styles that cannot be modified or deleted
- **User Styles**: User-created styles available for all their stories
- **Story Styles**: Styles specific to a particular story

Styles include parameters for the AI generation process and preview images.

## Testing

```bash
# Unit tests
npm run test

# Integration tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Development

This server is implemented with:

- **NestJS**: Framework for building server-side applications
- **MongoDB/Mongoose**: Database storage and schema validation
- **Swagger**: API documentation
- **Jest**: Testing framework
- **Docker**: Containerization

## Related MCP Servers

The Everart MCP Server is part of a suite of MCP servers for The Story Teller:

- **Memory MCP**: For narrative memory management
- **Sequential Thinking MCP**: For logical reasoning about narratives
- **MongoDB Atlas MCP**: For database operations

## License

MIT
