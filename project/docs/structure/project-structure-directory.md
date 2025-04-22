# The Story Teller: Directory Structure

*Last Updated: 2025-04-22*

This document provides a detailed breakdown of the directory structure for The Story Teller application. It outlines all major directories and files, along with their purposes.

## Directory Structure Overview

```
the-story-teller/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication API
│   │   ├── stories/              # Story management API
│   │   │   └── [storyId]/        # Story-specific API routes
│   │   └── ai/                   # AI integration API
│   ├── auth/                     # Authentication pages
│   ├── dashboard/                # Dashboard pages
│   ├── stories/                  # Story management pages
│   │   └── [id]/                 # Story detail pages
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   └── page.tsx                  # Homepage
│
├── components/                   # React components
│   ├── ui/                       # UI components
│   ├── forms/                    # Form components
│   ├── editor/                   # Content editor components
│   ├── visualization/            # Data visualization components
│   └── ai/                       # AI-related components
│
├── lib/                          # Utility functions
│   ├── mongodb.ts                # MongoDB connection utilities for application data
│   ├── auth-mongodb.ts           # Deprecated re-export for backward compatibility
│   ├── user-db.ts                # User-specific database management
│   ├── auth/                     # Authentication-related utilities
│   │   └── index.ts              # Central exports for auth functionality
│   ├── auth.ts                   # Authentication utilities
│   └── ai.ts                     # AI integration utilities
│
├── types/                        # TypeScript type definitions
│   ├── story.ts                  # Story-related types
│   ├── character.ts              # Character-related types
│   ├── location.ts               # Location-related types
│   └── timeline.ts               # Timeline-related types
│
├── public/                       # Static assets
│
├── database_schemas/             # JSON schemas for MongoDB validation
│   ├── character/
│   ├── location/
│   ├── timeline/
│   └── common/
│
├── AI_INSTRUCTION_TEMPLATES/     # Templates for AI prompts
│
├── CONTENT/                      # Sample content
│
├── documentation/                # Project documentation
│
├── .env.local.example            # Environment variables template
├── .gitignore                    # Git ignore file
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies
├── postcss.config.js             # PostCSS configuration
├── tailwind.config.js            # Tailwind CSS configuration
└── tsconfig.json                 # TypeScript configuration
```

## Key Directories Explained

### App Directory (Next.js App Router)

The `app` directory follows Next.js 13+ App Router architecture, which uses file-system based routing and React Server Components.

#### Key Subdirectories:

- **api/**: Server-side API routes
  - **auth/**: Authentication API endpoints (handled by NextAuth.js)
  - **stories/**: Story management API endpoints
  - **ai/**: API endpoints for AI integration with OpenAI

- **auth/**: Authentication-related pages
  - **signin/**: Sign-in page with OAuth providers

- **dashboard/**: User dashboard pages
  - **page.tsx**: Main dashboard view listing user's stories

- **stories/**: Story management pages
  - **new/**: New story creation page
  - **[id]/**: Dynamic routes for individual stories
    - **characters/**: Character management for a specific story
    - **locations/**: Location management for a specific story
    - **timeline/**: Timeline management for a specific story
    - **editor/**: Content editor for a specific story

### Components Directory

The `components` directory contains reusable React components organized by function:

- **ui/**: Basic UI components (buttons, cards, inputs, etc.)
- **forms/**: Form components for data entry
- **editor/**: Components related to the content editor
- **visualization/**: Data visualization components (graphs, timelines, etc.)
- **ai/**: Components related to AI integration

### Lib Directory

The `lib` directory contains utility functions and services:

- **mongodb.ts**: MongoDB connection utilities for application data
- **auth-mongodb.ts**: Deprecated re-export for backward compatibility
- **user-db.ts**: User-specific database management
- **auth/**: Authentication-related utilities
  - **index.ts**: Central exports for auth functionality
  - **options.ts**: NextAuth.js configuration
  - **session.ts**: Session utility functions
  - **mongodb.ts**: Dedicated MongoDB connection for AuthJS authentication
- **ai.ts**: AI integration utilities

### Types Directory

The `types` directory contains TypeScript type definitions:

- **story.ts**: Types for story data
- **character.ts**: Types for character data
- **location.ts**: Types for location data
- **timeline.ts**: Types for timeline data

### Database Schemas Directory

The `database_schemas` directory contains JSON schemas used for MongoDB validation:

- **character/**: Schemas for character collections
- **location/**: Schemas for location collections
- **timeline/**: Schemas for timeline collections
- **common/**: Shared schema components used across multiple collections

### AI Instruction Templates Directory

The `AI_INSTRUCTION_TEMPLATES` directory contains templates used for AI prompts:

- Templates for character development
- Templates for location description
- Templates for plot development
- Templates for story generation

## Configuration Files

- **.env.local.example**: Template for environment variables
- **.gitignore**: Specifies intentionally untracked files
- **next.config.js**: Next.js configuration
- **package.json**: Project dependencies and scripts
- **postcss.config.js**: PostCSS configuration for CSS processing
- **tailwind.config.js**: Tailwind CSS configuration
- **tsconfig.json**: TypeScript configuration

## Relation to Other Documentation

This directory structure document is part of the project structure documentation. For more detailed information, refer to:

- [Structure Overview](./overview.md) - High-level structure overview
- [Component Structure](./components.md) - Guidelines for component structure
- [Environment Configuration](./environment.md) - Environment configuration details 