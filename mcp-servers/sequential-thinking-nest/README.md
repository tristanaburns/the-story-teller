# Sequential Thinking MCP Server

This is the Sequential Thinking MCP (Message Control Protocol) Server for The Story Teller application. It provides a NestJS-based API for handling sequential thinking processes for story analysis, character development, plot generation, and more.

## Features

- RESTful API with Swagger documentation
- MongoDB integration for data persistence
- API key authentication
- Asynchronous processing of thinking tasks
- Support for step-by-step thinking processes

## Prerequisites

- Node.js (v14+)
- MongoDB (v4+)
- npm or yarn

## Installation

1. Clone the repository
2. Navigate to the sequential-thinking directory
3. Install dependencies:

```bash
npm install
```

## Configuration

Copy the `.env.example` file to `.env` and update the values:

```bash
cp .env.example .env
```

Key configuration options:

- `PORT`: The port to run the server on (default: 3004)
- `MONGODB_URI`: MongoDB connection string
- `MONGODB_DB_NAME`: MongoDB database name
- `API_KEY`: API key for authentication

## Running the Server

### Development Mode

```bash
npm run start:dev
```

### Production Mode

```bash
npm run build
npm run start:prod
```

## API Documentation

Once the server is running, access the Swagger UI at:

```
http://localhost:3004/api
```

## API Endpoints

- `POST /thinking`: Create a new thinking process
- `GET /thinking/:processId`: Get a thinking process by ID
- `GET /thinking/user/:userId`: Get thinking processes by user ID
- `GET /thinking/story/:storyId`: Get thinking processes by story ID
- `PUT /thinking/:processId`: Update a thinking process
- `DELETE /thinking/:processId`: Delete a thinking process

## Authentication

All API endpoints require authentication using a bearer token. Include the API key in the `Authorization` header:

```
Authorization: Bearer your-api-key-here
```

## Testing

Run tests with:

```bash
npm test
```

## License

MIT 