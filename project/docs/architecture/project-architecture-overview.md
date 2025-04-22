# The Story Teller: Architecture Overview

*Last Updated: 2025-04-28*

This document provides a comprehensive overview of the architecture for The Story Teller platform, detailing the system components, their interactions, and the technical design principles.

## System Architecture

The Story Teller platform is built as a modern web application following a modular architecture with clear separation of concerns. The architecture is designed to support the AI-native, multimodal, schema-driven narrative platform vision.

### High-Level Architecture Diagram

```
┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐
│                   │      │                   │      │                   │
│  Client Layer     │◄────►│  API Layer        │◄────►│  Database Layer   │
│  (Next.js)        │      │  (Next.js Routes) │      │  (MongoDB)        │
│                   │      │                   │      │                   │
└───────────────────┘      └─────────┬─────────┘      └───────────────────┘
                                     │
                                     ▼
                           ┌───────────────────┐
                           │                   │
                           │  MCP Services     │◄────► External AI Services
                           │  (NestJS)         │      (Claude, GPT, DALLE, etc.)
                           │                   │
                           └───────────────────┘
```

## Component Breakdown

### 1. Client Layer (Next.js)

The frontend application built with Next.js that provides the user interface for interacting with the platform.

#### Key Components:

- **World/Story Explorer**
  - World Dashboard with grid/list views
  - Story Kanban board
  - Navigation and filtering controls
  
- **Schema IDE / Passage Editor**
  - Split-pane workspace (Markdown, JSON metadata, preview)
  - Monaco editor integration
  - AI generation buttons
  - Real-time validation
  
- **Storyteller Runner**
  - Interactive reader interface
  - Audio playback controls
  - Choice engine UI
  - Media display components
  
- **Timeline & Graph Visualization**
  - Vis-timeline integration
  - React-force-graph integration
  - Interactive controls
  
- **Media Gallery**
  - Media browsing interface
  - Generation controls
  - Asset management

- **Publishing Tools**
  - Format selection interface
  - Configuration controls
  - Preview components

### 2. API Layer (Next.js Routes)

The server-side API built using Next.js API routes that handle requests from the client and communicate with the database and MCP services.

#### Key Endpoints:

- **/api/auth** 
  - Authentication and session management
  - JWT with key rotation
  
- **/api/meta** 
  - Schema and enumeration retrieval
  
- **/api/worlds**
  - World CRUD operations
  - World stats and metadata
  
- **/api/stories**
  - Story management
  - Passage operations
  - Status updates
  
- **/api/ai**
  - AI generation requests
  - Validation operations
  - Content enhancement
  
- **/api/media**
  - Image generation
  - Audio generation
  - Media management
  
- **/api/timeline**
  - Timeline events
  - Consistency validation
  
- **/api/publish**
  - Export operations
  - Format conversion
  - Distribution integrations

### 3. MCP Services (NestJS)

Microservices that handle specialized AI operations and provide Model Context Protocol (MCP) functionality.

#### Services:

- **Structure-Smith**
  - Schema compliance
  - Outline generation
  - Claude integration
  
- **Prose-Crafter**
  - Rich prose generation
  - Dialogue creation
  - GPT-4o integration
  
- **EverArt**
  - Style-consistent art
  - Image prompt expansion
  - Visual asset management
  
- **Seq-Think**
  - Long-horizon planning
  - Quest logic
  - Causal reasoning

### 4. Database Layer (MongoDB)

The data storage system using MongoDB with multi-tenant isolation through per-user databases.

#### Data Organization:

- **Multi-Tenant Structure**
  - `{userId}_stories` database per user
  - Collection isolation for security
  
- **Collections**
  - `worlds` - Top-level narrative universes
  - `stories` - Narrative units within worlds
  - `passages` - Content segments with metadata
  - `characters` - Character definitions and relationships
  - `locations` - Setting information
  - `events` - Timeline events
  - `media` - Asset metadata (with S3 references)
  - `sessions` - Interactive session state

## Technical Design Patterns

### Schema-Driven Development

- **JSON Schema Validation**
  - Ajv for schema compilation and validation
  - Type definition generation
  - Error formatting for user feedback
  
- **Schema Registration**
  - Central registry for all schema definitions
  - Versioning and evolution tracking
  - Documentation generation

### AI Integration Pattern

- **AI Pipeline**
  1. Client sends request with context
  2. API route formats for MCP
  3. Structure-Smith provides schema-compliant outline
  4. Prose-Crafter generates detailed content
  5. Validator ensures schema compliance
  6. Database stores the result
  7. Client receives validated content

### Multi-Tenant Data Isolation

- **Database Per User**
  - Connection factory creates isolated databases
  - Naming convention: `{userId}_stories`
  - Resource limits and monitoring
  
- **Access Control**
  - JWT authentication with database mapping
  - Permission validation for all operations
  - Rate limiting and quota management

### Content Processing Workflow

- **Creative Loop**
  - Trigger: User edit or AI generation
  - Process: Validation → Metadata update → Related updates
  - Notification: Subscribers to related content

### Media Management

- **S3 Integration**
  - Direct uploads with signed URLs
  - Metadata in MongoDB with S3 references
  - CDN distribution for performance
  
- **Processing Pipeline**
  - BullMQ for job queuing
  - Worker processes for async operations
  - Webhook notifications on completion

## Scalability Considerations

- **Horizontal Scaling**
  - Stateless API layer for easy scaling
  - Redis-backed session and cache
  - Read replicas for database

- **Resource Management**
  - Connection pooling for database efficiency
  - Caching strategy for frequent data
  - Background processing for heavy operations

## Security Architecture

- **Authentication**
  - OAuth integration with NextAuth
  - JWT with short expiration and rotation
  
- **Authorization**
  - Role-based access control
  - Resource ownership validation
  - Action-based permissions
  
- **Data Protection**
  - Database isolation
  - In-transit encryption
  - Content validation

## Observability

- **Logging**
  - Structured JSON logging
  - Context propagation
  - Correlation IDs
  
- **Monitoring**
  - OpenTelemetry integration
  - Grafana dashboards
  - Alert thresholds and notifications

## Implementation Phases

The architecture will be implemented according to the phased approach detailed in the [Project Blueprint](../plan/project-blueprint.md), starting with the MTP (Minimum Testable Product) and progressively adding functionality through subsequent phases.

## Relation to Other Documentation

This architecture overview connects to:
- **Project Blueprint**: For MTP and phase definitions
- **Technical Requirements**: For detailed implementation specs
- **Database Schemas**: For data structure definitions
- **API Documentation**: For detailed endpoint specifications
