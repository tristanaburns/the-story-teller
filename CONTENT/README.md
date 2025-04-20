# StoryTeller Content Directory Guide

Welcome to the content directory of the StoryTeller framework. This directory houses all narrative content for The Shadow Team Chronicles and other potential storylines. This guide explains the directory structure and workflow for creating and managing narrative content.

## Directory Structure

Each storyline follows an organized structure with specific subdirectories for different content types:

```
content/
├── README.md
└── The Shadow Team Chronicles/
    ├── CHAT_HISTORY/          # Archives of AI conversations
    │   ├── _Archive/          # Older chat logs
    │   └── ...                # Current chat history files
    ├── CONCEPTS_BRAINSTORMING/# Early ideas and concept development
    │   └── ...                # Brainstorming documents
    ├── DATABASE/              # JSON databases for tracking narrative elements
    │   └── character_database.json
    ├── IMAGES/                # Visual assets
    │   ├── DRAFT/             # In-progress images
    │   └── ...                # Finalized images
    ├── INFO/                  # Setting information and lore
    │   ├── DRAFT/             # In-progress lore documents
    │   ├── FINAL/             # Completed lore documents
    │   └── CONCEPT/           # Experimental lore concepts
    ├── STORYLINE/             # Narrative content
    │   ├── DRAFT/             # Work-in-progress stories
    │   ├── FINAL/             # Completed and approved stories
    │   └── CONCEPT/           # Experimental story concepts
    ├── TIMELINE/              # Chronological structure
    │   ├── DRAFT/             # In-progress timelines
    │   ├── FINAL/             # Finalized timelines
    │   └── CONCEPT/           # Timeline experiments
    └── VIDEOS/                # Video assets
        ├── DRAFT/             # In-progress videos
        ├── FINAL/             # Completed videos
        └── CONCEPT/           # Experimental video concepts
```

## Content Development States

All content in the StoryTeller system progresses through three development states:

### CONCEPT

The CONCEPT directories contain experimental, early-stage content:

- **Purpose**: Creative exploration, brainstorming, and concept development
- **Format**: Loosely structured, often incomplete
- **Examples**: `The Shadow Team Chronicles - CONCEPT - STORYLINE - CHAPTER - The Cave of the Wayfinder.md`
- **Naming Convention**: `[Storyline] - CONCEPT - [Content Type] - [Content Name].md`
- **Use When**: You're developing initial ideas, exploring concepts, or experimenting with narrative approaches

### DRAFT

The DRAFT directories contain work-in-progress content with more structure:

- **Purpose**: Developing structured narrative content with proper flow and organization
- **Format**: Follows narrative hierarchy with required metadata
- **Examples**: `1. The Shadow Team Chronicles - DRAFT - STORYLINE - INTRODUCTION - The Bridge of Fate.md`
- **Naming Convention**: `[Number]. [Storyline] - DRAFT - [Content Type] - [Content Name].md`
- **Use When**: Your content has moved beyond the experimental stage and is being actively developed

### FINAL

The FINAL directories contain completed, reviewed content:

- **Purpose**: Storing finalized narrative content ready for distribution or reference
- **Format**: Complete with full metadata and polish
- **Naming Convention**: `[Number]. [Storyline] - FINAL - [Content Type] - [Content Name].md`
- **Use When**: Content has been thoroughly reviewed and is considered complete

## Key Directory Types

### CHAT_HISTORY

Contains records of AI conversations related to story development:

- **Purpose**: Archive interactions and track idea development
- **Content**: AI chat logs, narrative explorations, and brainstorming sessions
- **Organization**: Recent chats at root level, older chats in `_Archive` subdirectory
- **Example Files**: `ChatGPT_Chat_1741415341393_The_Shadow_Team_Chronicles_-_Intro_Story_Redraft_Request.md`

### CONCEPTS_BRAINSTORMING

Contains foundational conceptual material:

- **Purpose**: Document core ideas and brainstorming
- **Content**: World concepts, character ideas, technology definitions
- **Example Files**: `The Shadow Team Chronicles - Base concepts and ideas for the City-States.md`

### DATABASE

Contains structured JSON data tracking narrative elements:

- **Purpose**: Maintain continuity and relationships between story elements
- **Content**: Character profiles, location details, organizational information
- **Example Files**: `character_database.json`

### STORYLINE

Contains the actual narrative content:

- **Purpose**: House the main stories and narrative progression
- **Organization**: Divided into CONCEPT, DRAFT, and FINAL states
- **Example Files**: 
  - `The Shadow Team Chronicles - CONCEPT - STORYLINE - CHAPTER - The Cave of the Wayfinder.md`
  - `2. The Shadow Team Chronicles - DRAFT - STORYLINE - CHAPTER - The Warriors Oath.md`

### TIMELINE

Contains chronological information and story sequencing:

- **Purpose**: Establish and maintain narrative chronology
- **Content**: Timeline documents, historical records, event sequences
- **Example Files**: `The Shadow Team Chronicles - MASTER - TIMELINE.csv`

### INFO

Contains world-building and reference material:

- **Purpose**: Document setting information and background details
- **Content**: Character backgrounds, technology specifications, setting details
- **Example Files**: `The Shadow Team Chronicles - CONCEPT - INFO - The Machines.md`

### IMAGES and VIDEOS

Contain visual assets associated with the narrative:

- **Purpose**: Store visual representations and references
- **Content**: Scene illustrations, character visualizations, concept art, video clips
- **Example Files**: DALL-E generated images, video sequences

## File Naming Conventions

Follow these naming patterns for consistency:

### CONCEPT Files:
```
[Storyline] - CONCEPT - [Content Type] - [Optional Modifier] - [Content Name].md
```
Example: `The Shadow Team Chronicles - CONCEPT - STORYLINE - CHAPTER - The Den of Wolves.md`

### DRAFT Files:
```
[Number]. [Storyline] - DRAFT - [Content Type] - [Optional Modifier] - [Content Name].md
```
Example: `2. The Shadow Team Chronicles - DRAFT - STORYLINE - CHAPTER - The Warriors Oath.md`

### FINAL Files:
```
[Number]. [Storyline] - FINAL - [Content Type] - [Optional Modifier] - [Content Name].md
```

### CHAT_HISTORY Files:
```
ChatGPT_Chat_[Timestamp]_[Storyline]_-_[Description].md
```
Example: `ChatGPT_Chat_1741415341393_The_Shadow_Team_Chronicles_-_Intro_Story_Redraft_Request.md`

## Working with AI Assistants

StoryTeller is optimized for AI-assisted content creation:

### Text-Based Content Creation

1. **Use the Structured Prompts**
   - Find prompt templates in the [documentation README](../documentation/README.md)
   - Specify content parameters using schema references
   - Request creation of specific content types based on the directory structure

2. **Content Development Workflow**
   - Start in CONCEPT for initial exploration
   - Move to DRAFT when developing structured narrative
   - Promote to FINAL after review and refinement

3. **Database Integration**
   - Request database updates as part of content generation
   - Ensure new characters, locations, and events are added to appropriate JSON files

### Voice-Based Content Creation

You can use voice interactions with AI assistants to create content through:

1. **Creation Commands**
   - "Create a new CONCEPT chapter about [topic]"
   - "Draft a scene for the Warriors Oath storyline"
   - "Help me develop a character concept for the INFO directory"

2. **Review and Refinement**
   - "Read back the latest DRAFT chapter"
   - "Enhance the prose variation in this passage"
   - "Check this content against the MASTER TIMELINE for consistency"

3. **File Organization**
   - "Move this content from CONCEPT to DRAFT"
   - "Update the file naming to follow the convention"
   - "Create appropriate metadata for this content"

## Metadata Requirements

Every content file should include appropriate metadata in YAML frontmatter:

```yaml
---
title: "The Bridge of Fate"
object_type: "chapter"
content_state: "draft"
sequence: 1
author: "AI Assistant"
creation_date: "2025-03-15"
version: "1.2.0"
related_files:
  - "The Shadow Team Chronicles - MASTER - TIMELINE.csv"
  - "character_database.json"
---
```

By following these guidelines, you'll contribute to a well-organized narrative universe that maintains continuity and quality across all content.
