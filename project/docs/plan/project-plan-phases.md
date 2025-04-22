# The Story Teller: Project Plan Phases

*Last Updated: 2025-04-28*

This document details the implementation phases for The Story Teller project, providing a structured roadmap for development from Minimum Testable Product (MTP) to full release.

## Overview

The Story Teller is an AI-native, multimodal narrative platform being developed in phased approach, beginning with a focused Minimum Testable Product and expanding to full functionality through clearly defined phases. Each phase builds upon the previous phase, adding new capabilities while refining existing ones.

## Phase 0: Foundation (Completed)

The foundation phase established the basic project infrastructure, core architecture, and authentication system.

**Key Deliverables:**
- Project setup and configuration
- Basic Next.js application structure
- MongoDB integration
- Authentication system
- Core UI components
- MCP server implementation
- Logging infrastructure

## Phase 1: Minimum Testable Product (MTP)

The MTP phase focuses on establishing the core editor functionality, AI generation capabilities, schema validation, and data isolation. This forms the foundation for all subsequent development.

### Epic E0 – Author can create & AI-generate a passage

**Key Deliverables:**
- Editor with sample story loading
- AI Generate Draft button functionality
- Validation for AI-generated content
- Error handling for invalid metadata
- Markdown editing with basic formatting

**User Stories:**
- As an authenticated user, I can open editor and load sample story
- I click Generate Draft to have AI write a new passage
- If AI returns invalid metadata, I get a clear error and nothing is saved

### Epic E1 – Schema enforcement & DB isolation

**Key Deliverables:**
- Per-user MongoDB databases
- Ajv validation middleware
- Error response formatting
- Validation error display
- Connection pooling and optimization

**User Stories:**
- My data is stored in a personal DB
- Invalid direct API calls are rejected

### Epic E2 – Importer & Seed

**Key Deliverables:**
- CLI seed functionality
- Shadow Team Chronicles sample data
- First-login detection and seeding
- Error handling for seed failures
- Documentation for sample data

**User Stories:**
- On first login, Shadow Team Chronicles is preloaded

## Phase 2: Interactive Runner

Building on the MTP, this phase focuses on implementing the interactive storytelling experience, allowing users to consume stories with choice-based progression and multimedia enhancement.

**Key Deliverables:**
- WebSocket channel `/ws/session/:sessionId`
- Choice engine for branching narratives
- ElevenLabs streaming TTS integration
- Session state management
- Audio playback controls
- Choice rendering from metadata
- Server-side AI pipeline for next passage generation
- Real-time updates via WebSocket

## Phase 3: Media Layer

This phase adds media generation capabilities, allowing users and AI to create visual and audio assets that enhance stories and bring worlds to life.

**Key Deliverables:**
- `/api/media/image` & `/api/media/video` workers
- Asset gallery component with tagging
- S3 storage integration
- Prompt builder UI with style presets
- Multi-model support (DALL·E, SDXL, etc.)
- EverArt service for style consistency
- Drag-and-drop integration into passages
- Bulk operations for media management

## Phase 4: Publishing System

This phase implements comprehensive publishing capabilities, allowing users to distribute their stories in various formats across multiple platforms.

**Key Deliverables:**

### Text-Based Publishing
- PDF generation with themed formatting
- ePub/MOBI creation for e-readers
- Document styling with theme options
- Inline image and map inclusion
- Table of contents and chapter markers
- World documentation export option

### Audio Publishing
- Audiobook compilation system
- Character voice switching with AI cloning
- Ambient music and background effects
- Multiple narration modes
- Podcast-style serialization
- RSS feed generation for distribution
- Platform integration (Spotify, Apple Podcasts)

### Video Publishing
- YouTube video creation pipeline
- AI narration with visual compilation
- Opening credits and scene visuals
- Auto-generated subtitles
- YouTube metadata integration
- Format customization options

### Publishing Wizard
- Step-by-step publishing interface
- Format selection with previews
- Style and media customization
- Platform distribution options
- Publishing presets for common formats

### Metadata & Licensing
- License tagging system
- Version control and timestamping
- Metadata JSON export
- Creator profile/dashboard
- Published works management

## Phase 5: Advanced MCP

This phase enhances the AI capabilities with advanced features for memory management, style consistency, and complex narrative planning.

**Key Deliverables:**
- Vector store for long-term memory (Weaviate)
- Style vectors for consistent art prompts
- Quest composer for multi-step narrative arcs
- Enhanced context handling for large narratives
- Improved AI reasoning for complex plots
- Timeline integration for event scheduling

## Phase 6: Mobile & Plugins

This phase expands the platform to mobile devices and adds extensibility through plugins.

**Key Deliverables:**
- Expo React Native app (Reader + light Editor)
- Offline mode with PouchDB synchronization
- Mobile-optimized UI for reading and editing
- Audio playback optimization for mobile
- Plugin SDK with hooks system
- Extension points for custom functionality
- Documentation for plugin development

## Phase 7: Road to Beta

This phase focuses on finalizing the platform for beta release, including quality assurance, onboarding, and community preparation.

**Key Deliverables:**
- Comprehensive telemetry collection
- Schema error reporting system
- AI guardrail hardening
- Email onboarding tour
- User feedback mechanisms
- Performance optimization
- Knowledge base and documentation
- Closed beta distribution to creators

## Development Timeline

| Phase | Start Date | End Date | Duration | Status |
|-------|------------|----------|----------|--------|
| 0: Foundation | March 2025 | April 2025 | 6 weeks | ✅ Completed |
| 1: MTP | April 2025 | May 2025 | 6 weeks | 🔄 In Progress |
| 2: Interactive Runner | May 2025 | June 2025 | 6 weeks | ⏱️ Planned |
| 3: Media Layer | June 2025 | July 2025 | 6 weeks | ⏱️ Planned |
| 4: Publishing System | July 2025 | August 2025 | 6 weeks | ⏱️ Planned |
| 5: Advanced MCP | August 2025 | September 2025 | 6 weeks | ⏱️ Planned |
| 6: Mobile & Plugins | September 2025 | October 2025 | 6 weeks | ⏱️ Planned |
| 7: Road to Beta | October 2025 | November 2025 | 4 weeks | ⏱️ Planned |

## AI-Orchestrated Storytelling Modes Implementation

The development of AI-orchestrated storytelling modes will be distributed across phases:

### Writer Mode
- Basic functionality in MTP (AI generation)
- Enhanced capabilities in Media Layer phase
- Advanced features in Advanced MCP phase

### Reader Mode
- Core implementation in Interactive Runner phase
- Media enhancements in Media Layer phase
- Mobile support in Mobile & Plugins phase

### Storyteller Mode
- Foundation in Interactive Runner phase
- Advanced branching in Advanced MCP phase
- Full implementation completed in Road to Beta phase

### Interactive Audiobook Mode
- Audio basics in Interactive Runner phase
- Enhanced audio in Media Layer phase
- Full experience in Publishing System phase

## Content Pipeline Integration

The content pipeline will be developed progressively through phases:

```
MTP:
[Concept] → [Draft] → [Final] → [Schema-Validated]

Interactive Runner:
[Concept] → [Draft] → [Final] → [Schema-Validated] → [Interactive Choices]

Media Layer:
[Concept] → [Draft] → [Final] → [Schema-Validated] → [Media Generated]

Publishing System:
[Concept] → [Draft] → [Final] → [Schema-Validated] → [Media Generated] → [User Approves Output] → [Publish as: PDF | eBook | Audio | Video | API JSON]

Advanced MCP:
Complete workflow with enhanced AI capabilities and advanced storytelling features
```

## Publishing Format Implementation Timeline

| Format | Phase | Key Milestone |
|--------|-------|---------------|
| PDF | Phase 4 | Week 2 |
| eBook (ePub/MOBI) | Phase 4 | Week 3 |
| Audiobook | Phase 4 | Week 4 |
| Podcast | Phase 4 | Week 5 |
| YouTube Video | Phase 4 | Week 6 |
| API JSON | Phase 5 | Week 2 |
| Wiki/Docs | Phase 5 | Week 3 |

## Shadow Team Chronicles Development

The flagship narrative will be developed incrementally:

- MTP: Basic structure and sample passages
- Interactive Runner: Choice-based progression
- Media Layer: Visual and audio enhancements
- Publishing System: Export-ready formatting across multiple formats
- Advanced MCP: Rich world and complex relationships
- Road to Beta: Polished, complete narrative experience

## Relation to Other Documentation

This phases document connects to:
- **Project Blueprint**: For detailed MTP specifications and phased roadmap
- **Project Plan Overview**: For high-level project vision
- **Project Status**: For current implementation status
- **Project Roadmap**: For timeline and milestone planning
- **Publishing Layer Specifications**: For detailed publishing system features
