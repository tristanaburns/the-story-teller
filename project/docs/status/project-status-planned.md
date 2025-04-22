# The Story Teller: Planned Development Items

*Last Updated: 2025-04-29*

This document details the planned development items for The Story Teller project, aligned with the Blueprint v2 and prioritizing the Minimum Testable Product (MTP) followed by the phased roadmap.

## Upcoming Development Focus

After completing the current work on the MTP components, the following phases are planned for development:

### Minimum Testable Product Completion (Target: May 15, 2025)

- **Finalizing Epic E0: Author can create & AI-generate a passage**
  - Complete editor with sample story loading
  - Finalize AI Generate Draft functionality with MCP integration
  - Extend content insertion and update workflow
  - Fine-tune error handling and recovery mechanisms
  - Add loading states and success indicators

- **Finalizing Epic E1: Schema enforcement & DB isolation**
  - Optimize schema validation performance for larger documents
  - Implement comprehensive tests for validation system
  - Add schema version management and migration
  - Enhance error handling for complex validation failures
  - Create user-facing documentation for schema errors

- **Implementing Epic E2: Importer & Seed**
  - Complete CLI seed functionality
  - Finalize Shadow Team Chronicles sample data
  - Implement first-login detection and seeding
  - Add error handling for seed failures
  - Create documentation for sample data

- **MTP Testing & Validation**
  - Implement Cypress test suite for MTP
  - Create test cases for all acceptance criteria
  - Set up CI/CD pipeline for MTP validation
  - Implement end-to-end testing
  - Create documentation for MTP features

### Phase 3: Interactive Runner (Target: June 30, 2025)

- **WebSocket Infrastructure**
  - Implement WebSocket channel for sessions
  - Create real-time update mechanism
  - Add connection management
  - Implement error handling
  - Set up scaling architecture

- **Choice Engine**
  - Create choice button rendering
  - Implement choice selection API
  - Develop server-side processing
  - Add next passage generation
  - Implement branching narrative structure

- **TTS Integration**
  - Set up ElevenLabs streaming
  - Implement audio playback controls
  - Create word highlighting system
  - Add audio synchronization
  - Implement voice selection

- **Session State Management**
  - Create session storage model
  - Implement bookmark functionality
  - Add inventory and variable tracking
  - Create session restoration system
  - Implement session analytics

### Phase 4: Media Layer (Target: July 30, 2025)

- **Media API Workers**
  - Implement image generation API
  - Create video generation service
  - Set up BullMQ job queue
  - Add media processing pipelines
  - Implement error handling and retry logic

- **Asset Gallery**
  - Create S3 storage integration
  - Implement searchable grid interface
  - Add faceted search capabilities
  - Develop tagging system
  - Create bulk operations functionality

- **Media Integration**
  - Implement drag-and-drop into passages
  - Create embedded media rendering
  - Add media metadata management
  - Implement media optimization
  - Add accessibility features

### Phase 5: Publishing Wizard (Target: August 30, 2025)

- **PDF/Print Generation**
  - Implement React-PDF templates
  - Create format selection interface
  - Add layout and style controls
  - Implement pagination system
  - Create table of contents generation

- **ePub & MOBI Creation**
  - Set up epub-gen pipeline
  - Implement cover art integration
  - Add image handling and optimization
  - Create metadata management
  - Implement table of contents generation

- **Audiobook Builder**
  - Create voice mapping interface
  - Implement chapter generation
  - Add MP3 and CUE file creation
  - Set up FFmpeg processing
  - Create audiobook metadata system

- **Podcast & Video Export**
  - Implement RSS generation
  - Create S3 upload functionality
  - Add platform integration (PodBean, YouTube)
  - Implement Remotion for video composition
  - Create export configuration interface

## Dependencies

The development of these planned items depends on:

1. **Completion of MTP**
   - Editor with AI generation must be functional
   - Schema validation and testing must be complete (✅ Schema implementation completed)
   - Per-user database isolation must be optimized (✅ Base implementation completed)
   - Sample data seeding must be operational

2. **Technical Requirements**
   - WebSocket infrastructure for Interactive Runner
   - Media processing pipeline for Asset Gallery
   - Job queue for asynchronous processing
   - S3 storage for media assets

## Risk Assessment

Potential risks for these planned items include:

| Risk | Impact | Mitigation | Priority |
|------|--------|------------|----------|
| AI service reliability | Could affect MTP functionality | Implement robust error handling and fallbacks (Schema validation in place) | **HIGH** |
| WebSocket scaling challenges | Could limit concurrent users | Design for horizontal scaling from the start | **HIGH** |
| Media generation performance | Could create bottlenecks | Implement queuing and background processing | **MEDIUM** |
| Publishing complexity | Could delay export features | Start with simplest formats, then expand | **MEDIUM** |

## Preliminary Timeline

| Feature | Start | Completion | Duration | Priority |
|---------|-------|------------|----------|----------|
| MTP Completion | In Progress | May 15, 2025 | 2 weeks | **HIGHEST** |
| Interactive Runner | May 16, 2025 | June 30, 2025 | 6 weeks | **HIGH** |
| Media Layer | June 15, 2025 | July 30, 2025 | 6 weeks | **MEDIUM** |
| Publishing Wizard | July 15, 2025 | August 30, 2025 | 6 weeks | **MEDIUM** |
| Advanced MCP | August 15, 2025 | September 30, 2025 | 6 weeks | **LOW** |
| Mobile & Plugins | September 15, 2025 | October 31, 2025 | 6 weeks | **LOW** |

## Relation to Other Documentation

These planned items align with:

- **Project Blueprint**: Based on the MTP and phased roadmap
- **Project Roadmap**: Following the established development timeline
- **Sprint Planning**: Will be incorporated into upcoming sprints
- **Project Milestones**: Contributing to defined milestone achievements
