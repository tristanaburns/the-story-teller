# MongoDB Atlas MCP Server

A Model Context Protocol (MCP) server for MongoDB Atlas operations, built with NestJS. This server provides a standardized interface for interacting with MongoDB Atlas databases from The Story Teller application.

## 🔑 Features

- **Schema-Aware Database Operations**: Validate data against JSON schemas
- **Comprehensive Logging**: Detailed logging of all database operations
- **Schema Management**: Define and manage collection schemas
- **Query Operations**: Flexible querying of MongoDB collections
- **Data Operations**: Create, update, and delete documents
- **Search Functionality**: Text search across collections
- **Aggregation Pipeline**: Execute complex MongoDB aggregations

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or later
- MongoDB Atlas account or local MongoDB instance

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and update the values
4. Start the development server:
   ```bash
   npm run start:dev
   ```

### Docker

To run the server using Docker:

```bash
docker-compose up -d
```

## 📋 API Reference

The MongoDB Atlas MCP server exposes a standardized MCP API. Documentation is available via Swagger at `/api` when the server is running.

### Available Operations

- **query**: Retrieve documents from a collection
- **create**: Insert new documents into a collection
- **update**: Modify existing documents
- **delete**: Remove documents from a collection
- **schema**: Define or retrieve collection schemas
- **search**: Perform text search across collections
- **execute**: Run MongoDB aggregation pipelines

## 📊 Logging

The server implements comprehensive debug-level logging for all operations, capturing:

- Request/response details
- Execution times
- Query parameters
- Success/failure status
- Error messages and stack traces
- User context

## 🔒 Security

- API key authentication
- Request validation
- Schema validation
- Error handling that doesn't expose sensitive information

## 📦 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 3004 |
| `MONGODB_URI` | URI for MongoDB connection | mongodb://localhost:27017/mongodb-atlas-mcp |
| `MONGODB_DB_NAME` | Database name | mongodb-atlas-mcp |
| `API_KEY_REQUIRED` | Whether API key auth is required | false |
| `API_KEY` | API key for authentication | - |
| `LOG_LEVEL` | Logging level | debug |
| `DEFAULT_ATLAS_DB_NAME` | Default database name for Atlas operations | default-db |

## 🧪 Testing

Run tests with:

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 License

This project is licensed under the MIT License.
