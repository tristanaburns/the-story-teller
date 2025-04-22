# The Story Teller: Structure Overview

*Last Updated: 2025-04-22*

This document provides a high-level overview of the project structure for The Story Teller application. It outlines how the codebase is organized, the purpose of major directories, and the architectural design principles applied throughout the application.

## What This Document Covers

- High-level overview of the codebase organization
- Major directories and their purposes
- Key architectural patterns used in the project

## What's Not Covered Here

For more detailed information, refer to the following documents:

- [Directory Structure](./directory.md) - Detailed breakdown of all directories and files
- [Component Structure](./components.md) - Guidelines and examples for component structure
- [Environment Configuration](./environment.md) - Configuration for different environments

## Core Structure Principles

The Story Teller application follows a Next.js-based architecture with the following core structural principles:

1. **Separation of Concerns**: Clear separation between UI components, data access, and business logic
2. **Component-Based Architecture**: UI built from reusable React components
3. **Type Safety**: Comprehensive TypeScript types for all data structures
4. **API-Driven Development**: Well-defined API contracts between frontend and backend
5. **Schema Validation**: JSON schemas for MongoDB collection validation
6. **User Isolation**: User-specific databases for complete data isolation

## Major Sections

The application is structured into the following major sections:

1. **App Router**: Next.js App Router for page routing and server components
2. **Components**: Reusable React components
3. **Library**: Utility functions and services
4. **Types**: TypeScript type definitions
5. **Database Schemas**: JSON schemas for MongoDB validation
6. **AI Templates**: Templates for AI prompts
7. **Content**: Sample content for the application
8. **Documentation**: Project documentation

Each section has its own purpose and organization, which are covered in detail in the [Directory Structure](./directory.md) document.

## Relation to Other Documentation

This structure overview document is part of the project structure documentation. For more detailed information, refer to:

- [Directory Structure](./directory.md) - Detailed breakdown of directory structure
- [Component Structure](./components.md) - Guidelines for component structure
- [Environment Configuration](./environment.md) - Environment configuration
- [Architecture Overview](../architecture/overview.md) - Architectural overview 