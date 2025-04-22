# The Story Teller: Publishing Layer Feature Specifications

*Last Updated: 2025-04-28*

## Publishing Layer Overview

The **Publishing System** acts as a bridge between creative work and public output. It supports multiple media formats and provides tools to package, export, and distribute narrative content as finished products across various mediums.

## Feature Set

### 1. Text-Based Publishing

#### PDF & eBook Export

* One-click generation of:
   * **Formatted PDFs** (for print or personal archive)
   * **ePub** and **MOBI** files (for Kindle, Apple Books, etc.)
* Style options:
   * Themed formatting (fantasy, sci-fi, noir, etc.)
   * Include AI-generated images and maps inline
   * Table of contents, chapter markers, metadata from schema
* Optional: Export full world documentation (characters, timelines, maps)

**Technology Stack**: 
* `react-pdf` for PDF generation
* `html-to-pdf` for document formatting
* `epub-gen` for eBook creation
* Next.js server actions with `Puppeteer` for complex format conversion

### 2. Audio Publishing

#### Audiobooks

* Automatically compile text-to-speech segments into long-form audio
* Full audiobook narration with:
   * Character voice switching (AI voice cloning)
   * Ambient music or background FX
   * Optional narration "modes" (dramatic, casual, storybook)
* Track-based system for download or streaming

#### Podcast-Style Serialization

* Episodic exports based on story parts
* Publish directly to:
   * Spotify (via RSS feed)
   * Apple Podcasts
   * Self-hosted podcast hub

**Technology Stack**:
* `ElevenLabs` for high-quality TTS
* `Play.ht` as alternative voice generation
* `FFmpeg` for audio processing and compilation
* RSS feed generator for podcast distribution

### 3. Video Publishing

#### YouTube Video Creation

* Compile:
   * AI narration (voice + background)
   * AI-generated visuals (DALL·E, Midjourney, etc.)
   * Optional video snippets (RunwayML, Pika)
* Generate:
   * Opening credits / titles
   * Scene-by-scene visuals or slideshows
   * Subtitles + captions (auto-generated)
* Publish to YouTube with metadata from the schema (titles, summaries, tags)

**Technology Stack**:
* `FFmpeg` for video processing
* `Remotion` for programmatic video generation
* `RunwayML API` for advanced video content
* YouTube API for direct publishing

### 4. Metadata & Licensing Control

Each story, world, and piece of media can be:
* **Tagged with licenses** (CC, personal use, commercial)
* **Versioned and timestamped**
* **Exported with metadata JSON** for reuse or remixing

**Additional Feature**: Create a **creator profile page** or dashboard for published works with previews and download links.

## Content Pipeline Integration

The Publishing Layer integrates with the overall system workflow:

```
[Concept] → [Draft] → [Final] → [Schema-Validated] → [Media Generated] → [User Approves Output] → [Publish as: PDF | eBook | Audio | Video | API JSON]
```

### Publishing Wizard

* User interface component guiding through the publishing process
* Format selection with preview capabilities
* Media inclusion options
* Style and theme selection
* Publishing presets (e.g., "Audiobook Episode", "Lore Wiki PDF", "YouTube Recap Video")

## Output Format Capabilities

| Format | Features |
|--------|----------|
| **PDF** | Styled for printing, includes images and metadata |
| **eBook (ePub/MOBI)** | eReader-compatible, text + image support |
| **Audiobook** | Multi-voice AI narration, export as MP3, episodic support |
| **Podcast** | Serialized audio story arcs, RSS integration |
| **YouTube Video** | Narrated video with generated visuals and dynamic scenes |
| **API JSON** | World export for external integration or remixing |
| **Wiki/Docs** | World encyclopedia auto-generated from schemas |

## Technical Implementation

### API Endpoints

* `/api/publish/pdf` - Generate PDF with formatting options
* `/api/publish/ebook` - Create ePub/MOBI with customization
* `/api/publish/audio` - Compile audio segments into full audiobook
* `/api/publish/podcast` - Generate podcast episodes with RSS
* `/api/publish/video` - Create video content for platform distribution
* `/api/publish/json` - Export schema-compliant data for external use
* `/api/publish/wiki` - Generate documentation site from world data

### Component Architecture

* PublishingWizard - Main UI component guiding the process
* FormatSelector - Format selection with preview capabilities
* StyleCustomizer - Theme and styling options interface
* MediaSelector - Component for choosing media inclusions
* ExportManager - Handles background processing and delivery
* PlatformConnector - Manages external platform integrations

## User Flow

1. User completes a story or selects content to publish
2. User launches Publishing Wizard
3. User selects output format(s)
4. User customizes style, media inclusions, and platform settings
5. System validates content and generates preview
6. User approves and initiates publishing process
7. System performs format conversion and compilation
8. System delivers files or publishes to selected platforms
9. User receives confirmation and access links

## Dependencies

* Completed narrative content with valid schema
* Generated media assets (if including in publication)
* API keys for external platforms (YouTube, podcast services)
* Storage for published assets

## Development Phases

The Publishing Layer will be implemented in Phase 4 of the project roadmap, with the following sub-phases:

1. **Text Publishing** - PDF and eBook generation
2. **Audio Publishing** - Audiobook and podcast creation
3. **Video Publishing** - YouTube and video content generation
4. **Metadata & Profile** - Licensing, versioning, and creator dashboard

## Relation to Other Documentation

This publishing layer specification connects to:
- **Project Blueprint**: For overall phased approach
- **Functional Requirements**: For integration with core system
- **Architecture Documentation**: For technical implementation details
- **Project Roadmap**: For development timeline
