# The Story Teller: Architecture Overview

*Last Updated: 2025-04-22*

This document provides a high-level overview of the architecture for The Story Teller application. It outlines the major architectural components, their relationships, and the design patterns used throughout the application.

## Architecture Overview

The Story Teller is built on a modern web architecture using React, Next.js, and MongoDB. The application follows a component-based approach with a clear separation between frontend and backend concerns.

### Frontend Architecture

The application follows a component-based architecture using React and Next.js:

1. **App Router**: Defined by the Next.js App Router file system for page routing
2. **Components**: Reusable UI elements organized in a hierarchical structure
3. **Hooks**: Custom React hooks for shared logic and state management
4. **Context Providers**: React Context API for state management across components
5. **Client-Side Logging**: Browser-based logging with batched server submission

### Backend Architecture

The backend is implemented using Next.js API routes with a robust organization structure:

1. **API Routes**: Server-side endpoints for data operations organized by domain
   - `/api/stories` - Story management endpoints
   - `/api/mcp` - Model Context Protocol integration
   - `/api/settings` - User settings management
   - `/api/logs` - Logging system endpoints
   - `/api/ai` - AI integration endpoints
   - `/api/auth` - Authentication endpoints

2. **Database Access Layer**: MongoDB Atlas for data storage with connection pooling
3. **Authentication Layer**: NextAuth.js for OAuth integration with Google and GitHub
4. **Middleware Layer**: Request validation and authentication checking
5. **Logging Middleware**: Comprehensive request/response logging

### Database Architecture

The application uses a multi-tenant database design where each user has their own MongoDB database with collections for:

1. **metadata**: User metadata and configuration
2. **stories**: Stories collection with core narrative data
3. **characters**: Characters in stories with relationships
4. **locations**: Locations in stories with spatial data
5. **timelines**: Timelines for stories with chronological events
6. **events**: Events in the storylines with temporal and character associations
7. **logs**: Application logs with structured data

The database layer includes several architectural components:

1. **Connection Pooling**: Reused MongoDB connections to optimize resources
2. **Schema Validation**: JSON Schema validation for MongoDB collections
3. **Logged Operations**: Automatic logging of all database operations
4. **User-Specific Databases**: Complete isolation between user data
5. **Automatic Reconnection**: Built-in retry logic for database operations

### MCP Server Architecture

The application integrates with four specialized NestJS-based MCP (Model Context Protocol) servers, each providing distinct capabilities:

1. **Memory MCP Server**: 
   - Handles memory storage and retrieval
   - Implements importance-based ranking
   - Provides context management
   - Supports memory consolidation
   - Enables advanced memory search

2. **Everart MCP Server**: 
   - Manages character and location visualization
   - Supports artwork generation and storage
   - Implements style consistency management
   - Handles artwork metadata tagging
   - Provides search functionality for visual assets

3. **Sequential Thinking MCP Server**: 
   - Provides step-by-step reasoning capabilities
   - Supports structured thinking processes
   - Enables process creation and management
   - Implements reasoning step addition
   - Handles process completion with conclusions

4. **MongoDB Atlas MCP Server**: 
   - Offers schema-aware database operations
   - Supports complex query construction
   - Provides schema management and validation
   - Implements text search functionality
   - Enables aggregation pipeline execution

### Logging Architecture

The application implements a sophisticated centralized logging system that spans all components:

1. **Centralized Logger Configuration**:
   - Environment-based log levels (DEBUG in development, INFO in production)
   - Structured JSON format for machine parsing
   - Multiple transport mechanisms (Console, File, MongoDB)
   - Log level hierarchy (TRACE, DEBUG, INFO, WARN, ERROR, FATAL)
   - Automatic sensitive data redaction

2. **Context Propagation**:
   - Correlation ID tracking across components
   - Request ID association for web requests
   - User ID inclusion for authenticated operations
   - Component and method identification
   - Performance metrics with duration tracking

3. **Specialized Loggers**:
   - Database operation logging (MongoDB)
   - API request/response logging
   - MCP server communication logging
   - AI integration logging
   - Client-side error and event logging

4. **Log Management**:
   - Log querying and search functionality
   - Log visualization dashboard
   - Log level configuration management
   - Log-based alerting system
   - Performance impact optimization

## Key Architectural Patterns

The application incorporates several key architectural patterns:

1. **Model-View-Controller (MVC)**: Separation of data models, user interface, and control logic
2. **Repository Pattern**: Data access abstracted through repositories
3. **Dependency Injection**: Services injected into components as needed
4. **Middleware Pattern**: Request/response processing through middleware chains
5. **Schema Validation**: Data validation through JSON schemas
6. **Service Pattern**: Business logic encapsulated in service classes
7. **Decorator Pattern**: Method decoration for cross-cutting concerns like logging
8. **Factory Pattern**: Creation of complex objects through factory methods
9. **Proxy Pattern**: Interception of operations for logging and validation
10. **Observer Pattern**: Event-based communication between components

## Integration Architecture

The application integrates with several external services:

1. **MongoDB Atlas**: Cloud database for persistent storage
2. **NextAuth.js**: Authentication service with multiple OAuth providers
3. **OpenAI API**: AI capabilities for content generation and analysis
4. **Vercel**: Deployment and hosting platform
5. **NestJS MCP Servers**: Specialized microservices for specific capabilities

## Communication Patterns

The application uses several communication patterns for inter-component interaction:

1. **RESTful APIs**: HTTP-based communication between frontend and backend
2. **JSON-RPC**: Remote procedure calls for MCP server communication
3. **WebSockets**: Real-time communication for collaborative features
4. **Event Bus**: Internal event broadcasting for loosely coupled components
5. **Message Queues**: Asynchronous processing for long-running operations

## Security Architecture

The application implements a comprehensive security architecture:

1. **Authentication**: OAuth 2.0 integration with identity providers
2. **Authorization**: Fine-grained access control to resources
3. **Data Isolation**: Complete separation of user data
4. **Input Validation**: Schema-based validation of all inputs
5. **API Keys**: Secure communication with MCP servers
6. **Sensitive Data Handling**: Automatic redaction in logs
7. **HTTPS Encryption**: Secure transport for all communication

## Deployment Architecture

The application is designed for deployment on Vercel:

1. **Next.js Application**: Deployed on Vercel with automatic scaling
2. **Database**: MongoDB Atlas for database hosting
3. **Environment Variables**: Configured in Vercel dashboard
4. **CI/CD**: Automated deployment on commits to main branch
5. **MCP Servers**: Deployed as separate NestJS applications
6. **Domain**: Custom domain configuration in Vercel
7. **SSL**: Automatic SSL certificate management by Vercel
8. **Preview Deployments**: Per-branch preview environments

## Development Architecture

The development environment is streamlined for productivity:

1. **Hot Reloading**: Automatic reloading of code changes
2. **Environment Switching**: Different configurations for development/production
3. **Mocking**: Simulation of external services for testing
4. **Local MCP Servers**: Development instances of MCP servers
5. **Development Database**: Local or cloud-based development database

## Relation to Other Documentation

This architecture overview document is part of the architecture documentation. For more detailed information, refer to:

- [Frontend Architecture](./frontend-architecture.md) - Frontend architecture in detail
- [Backend Architecture](./backend-architecture.md) - Backend architecture in detail
- [Database Architecture](./database-architecture.md) - Database design and schema
- [Authentication Flow](./authentication-flow.md) - Authentication architecture
- [Structure Overview](../structure/structure-overview.md) - Project structure overview
- [Logging System](./logging-architecture.md) - Detailed logging system architecture
- [MCP Integration](./mcp-architecture.md) - MCP server integration details