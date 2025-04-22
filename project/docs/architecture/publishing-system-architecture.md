# The Story Teller: Publishing System Architecture

*Last Updated: 2025-04-28*

This document details the architecture and implementation approach for the Publishing System in The Story Teller platform, describing how various publishing formats are supported and integrated into the overall system.

## Publishing System Overview

The Publishing System acts as a bridge between creative work and public output, supporting multiple media formats and providing tools to package, export, and distribute narrative content as finished products. It enables users to transform their stories into professional-quality publications across text, audio, and video formats.

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────┐      ┌─────────────────────┐      ┌─────────────────────┐
│                     │      │                     │      │                     │
│  Publishing Wizard  │◄────►│  Format Processors  │◄────►│  Export Services    │
│  (Next.js UI)       │      │  (Server Functions) │      │  (Backend Workers)  │
│                     │      │                     │      │                     │
└─────────────────────┘      └─────────┬───────────┘      └──────────┬──────────┘
                                       │                             │
                                       ▼                             ▼
                             ┌─────────────────────┐      ┌─────────────────────┐
                             │                     │      │                     │
                             │  Asset Pipeline     │      │  Platform Adapters  │
                             │  (Media Processing) │      │  (Distribution)     │
                             │                     │      │                     │
                             └─────────────────────┘      └─────────────────────┘
```

## Component Breakdown

### 1. Publishing Wizard (Next.js UI)

The front-end interface guiding users through the publishing process.

#### Key Components:

- **FormatSelector**
  - Displays available format options
  - Shows format capabilities and examples
  - Handles format-specific configuration options
  
- **StyleCustomizer**
  - Theme selection (genre-based styling)
  - Typography and layout options
  - Color scheme customization
  
- **MediaSelector**
  - Media inclusion options
  - Image/audio placement controls
  - Cover art selection and customization
  
- **MetadataEditor**
  - Title, author, and description fields
  - License selection
  - Platform-specific metadata input
  
- **PublishingPresets**
  - Saved configuration management
  - Quick-start templates
  - Format-specific optimization presets

### 2. Format Processors (Server Functions)

Server-side modules handling the conversion of content into specific formats.

#### Key Processors:

- **TextProcessor**
  - PDF generation pipeline
  - ePub/MOBI conversion
  - Document styling and layout
  - TOC generation
  - Image embedding
  
- **AudioProcessor**
  - Voice mapping implementation
  - Audio segment compilation
  - Narration style application
  - Background music integration
  - Audio quality optimization
  
- **VideoProcessor**
  - Scene sequencing
  - Visual asset integration
  - Audio track synchronization
  - Subtitle generation
  - Transition effects application

### 3. Export Services (Backend Workers)

Background processing services handling resource-intensive tasks.

#### Key Services:

- **PDFService**
  - `react-pdf` integration
  - Document compilation
  - PDF optimization
  - Layout rendering
  
- **eBookService**
  - `epub-gen` integration
  - Format-specific optimization
  - Device compatibility testing
  - Metadata embedding
  
- **AudiobookService**
  - `FFmpeg` processing
  - Chapter compilation
  - ID3 tag embedding
  - Format optimization
  
- **PodcastService**
  - Episode generation
  - RSS feed creation
  - Media hosting integration
  - Platform metadata preparation
  
- **VideoService**
  - `Remotion` integration
  - Video compilation
  - Encoding optimization
  - Platform-specific formatting

### 4. Asset Pipeline (Media Processing)

System for processing and preparing media assets for inclusion in published content.

#### Key Components:

- **ImageProcessor**
  - Format conversion
  - Resolution optimization
  - Embedded metadata
  - Compression
  
- **AudioProcessor**
  - Audio normalization
  - Format conversion
  - Quality optimization
  - Metadata embedding
  
- **VideoProcessor**
  - Transcoding
  - Thumbnail generation
  - Resolution adaptation
  - Metadata embedding

### 5. Platform Adapters (Distribution)

Integration modules for publishing to external platforms.

#### Key Adapters:

- **PDFDistributor**
  - Download link generation
  - Email delivery
  - Print service integration
  
- **eBookDistributor**
  - eReader platform integration
  - Store submission preparation
  
- **PodcastDistributor**
  - Spotify integration
  - Apple Podcasts integration
  - RSS hosting
  
- **VideoDistributor**
  - YouTube API integration
  - Video platform authentication
  - Metadata submission
  - Status monitoring

## Technical Implementation

### Content Pipeline Workflow

The Publishing System integrates into the overall content pipeline:

```
[Concept] → [Draft] → [Final] → [Schema-Validated] → [Media Generated] → [User Approves Output] → [Format Processing] → [Distribution]
```

### API Endpoints

#### Publishing API

- **/api/publish**
  - `POST /pdf` - Generate PDF with formatting options
  - `POST /ebook` - Create ePub/MOBI with customization
  - `POST /audio` - Compile audio segments into full audiobook
  - `POST /podcast` - Generate podcast episodes with RSS
  - `POST /video` - Create video content for platform distribution
  - `POST /json` - Export schema-compliant data for external use
  - `POST /wiki` - Generate documentation site from world data

#### Status API

- **/api/publish/status**
  - `GET /:jobId` - Check status of publishing job
  - `GET /history` - List recent publishing jobs
  - `DELETE /:jobId` - Cancel publishing job

#### Distribution API

- **/api/distribute**
  - `POST /youtube` - Publish to YouTube
  - `POST /podcast` - Submit to podcast platforms
  - `POST /ebook` - Distribute to eBook platforms

### Technology Stack

#### Text Publishing

- **PDF Generation**
  - `react-pdf` for document layout and rendering
  - `html-to-pdf` for complex formatting
  - Puppeteer for screenshots and advanced rendering
  
- **eBook Creation**
  - `epub-gen` for ePub generation
  - Calibre command-line tools for format conversion
  - Custom templates for styling

#### Audio Publishing

- **Voice Generation**
  - ElevenLabs API for high-quality TTS
  - Play.ht as fallback option
  
- **Audio Processing**
  - `FFmpeg` for audio manipulation and compilation
  - Web Audio API for browser preview
  - ID3 library for metadata embedding
  
- **Podcast Tools**
  - RSS feed generator
  - Podcast platform integration libraries
  - Audio streaming optimization

#### Video Publishing

- **Video Generation**
  - `Remotion` for programmatic video creation
  - `FFmpeg` for video processing and encoding
  
- **Platform Integration**
  - YouTube API for direct publishing
  - OAuth integration for authentication
  - Upload status monitoring

### Job Queue System

To handle resource-intensive publishing tasks:

- **BullMQ + Redis** for job queuing
- Worker processes for background execution
- Progress tracking and status updates
- Failure recovery and retry logic

### Storage Architecture

- **Temporary Storage**: Processing artifacts during generation
- **Permanent Storage**: Published outputs in S3 or equivalent
- **Metadata Storage**: MongoDB for publishing history and settings
- **User Access Control**: Signed URLs for secure access

## User Flow

1. User selects content to publish from their stories
2. User launches Publishing Wizard
3. User selects output format(s) and customizes settings
4. System validates content and generates preview
5. User approves and initiates publishing process
6. System adds job to queue and provides status tracking
7. Background workers process the publishing request
8. System stores output and provides access/distribution
9. User receives notification and access information

## Format-Specific Implementation Details

### PDF/Print Implementation

- Document model with hierarchical structure
- React-PDF templates for different genres
- Custom components for speciality content
- Font embedding and typography controls
- Print-specific considerations (margins, bleed, etc.)

### Audiobook Implementation

- Voice mapping configuration stored in JSON
- Character voice consistency through text analysis
- Chapter markers and navigation metadata
- Background audio layer mixing
- Multiple output format support (MP3, M4B, etc.)

### Video Implementation

- Scene detection from narrative structure
- Visual style templates for consistent branding
- Component-based design for reusable elements
- Frame-by-frame rendering for high quality
- Optimization for platform-specific requirements

## Phased Development

The Publishing System will be implemented in Phase 4 of the project roadmap:

1. **Text Publishing** (Weeks 1-2)
   - PDF generation
   - ePub/MOBI creation
   - Document styling

2. **Audio Publishing** (Weeks 3-4)
   - Audiobook compilation
   - Voice mapping
   - Podcast serialization

3. **Video Publishing** (Weeks 5-6)
   - YouTube video creation
   - Visual asset integration
   - Platform distribution

## Scalability Considerations

- **Worker Scaling**: Horizontal scaling for publishing workers
- **Storage Tiering**: Hot/cold storage based on access patterns
- **Caching Strategy**: Reuse of common elements across outputs
- **Resource Limits**: User quotas for publishing operations
- **On-Demand Processing**: Just-in-time resource allocation

## Security Architecture

- **Content Ownership**: Verification before publishing
- **Platform Authentication**: Secure OAuth integration
- **Output Protection**: Optional watermarking or DRM
- **Access Control**: Granular permissions for published content
- **License Verification**: License compliance checking

## Monitoring and Analytics

- **Job Performance**: Metrics on processing time and resource usage
- **Output Quality**: Automated quality checks
- **User Behavior**: Analytics on format preferences
- **Distribution Performance**: Platform-specific engagement metrics
- **Error Tracking**: Aggregation of publishing failures for improvement

## Relation to Other Documentation

This Publishing System architecture connects to:
- **Project Blueprint**: For overall phased approach
- **Project Architecture Overview**: For system integration details
- **Functional Requirements**: For publishing feature specifications
- **Project Roadmap**: For development timeline
- **Publishing Layer Feature Specifications**: For detailed feature information
