# The Story Teller: Code Organization

*Last Updated: 2025-04-22*

This document outlines the code organization patterns and conventions used throughout The Story Teller project. Following these guidelines ensures consistency and maintainability.

## Code Organization Principles

The Story Teller codebase follows these core organizational principles:

1. **Modularity**: Code is organized into distinct, loosely coupled modules
2. **Feature-Based Structure**: Components are grouped by feature rather than type
3. **Clear Responsibilities**: Each file and function has a single responsibility
4. **Consistent Patterns**: Similar problems are solved in similar ways
5. **Hierarchical Organization**: Project structure follows a logical hierarchy

## Frontend Code Organization

### Component Structure

React components follow this organization:

```
/components
  /feature-name
    FeatureName.tsx         # Main component
    FeatureName.module.css  # Component-specific styles
    useFeatureName.tsx      # Custom hook (if needed)
    FeatureName.test.tsx    # Component tests
    /sub-components         # Folder for feature-specific components
      SubComponent.tsx
```

### Component File Structure

Each component file follows this structure:

1. **Imports**: External libraries, then internal modules
2. **Types**: TypeScript interfaces and types
3. **Constants**: Component-specific constants
4. **Helper Functions**: Small utility functions
5. **Component Definition**: Main component function
6. **Export Statement**: Default or named export

Example:
```typescript
// External imports
import React, { useState, useEffect } from 'react';

// Internal imports
import { formatDate } from '@/utils/date';
import styles from './ComponentName.module.css';

// Types
interface ComponentProps {
  title: string;
  createdAt: string;
}

// Constants
const MAX_TITLE_LENGTH = 50;

// Helper functions
const truncateTitle = (title: string) => {
  return title.length > MAX_TITLE_LENGTH 
    ? `${title.substring(0, MAX_TITLE_LENGTH)}...` 
    : title;
};

// Component definition
export function ComponentName({ title, createdAt }: ComponentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayTitle = isExpanded ? title : truncateTitle(title);
  
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{displayTitle}</h2>
      <p className={styles.date}>{formatDate(createdAt)}</p>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className={styles.expandButton}
      >
        {isExpanded ? 'Collapse' : 'Expand'}
      </button>
    </div>
  );
}

// Export
export default ComponentName;
```

### Hook Organization

Custom hooks are organized as follows:

```
/hooks
  /feature-specific
    useFeatureSpecific.ts   # Feature-specific hooks
  /common
    useForm.ts              # General-purpose hooks
    useAuth.ts
    useApi.ts
```

## Backend Code Organization

### API Route Structure

API routes follow this organization:

```
/app/api
  /[resource]
    route.ts                # Route handler with GET, POST, etc.
    schema.ts               # Validation schemas
    /controllers            # Business logic for routes
    /models                 # Data models for the resource
```

### API Handler Structure

Each API handler follows this structure:

1. **Imports**: External then internal
2. **Validation**: Request validation
3. **Authentication**: User authentication check
4. **Authorization**: Permission checking
5. **Business Logic**: Core functionality
6. **Response Formatting**: Consistent response structure
7. **Error Handling**: Try/catch with appropriate error responses

Example:
```typescript
// Imports
import { NextRequest, NextResponse } from 'next/server';
import { validateSchema } from '@/lib/validation';
import { authenticateUser } from '@/lib/auth';
import { checkPermission } from '@/lib/permissions';
import { storySchema } from './schema';
import { createStory } from './controllers/story-controller';

// Handler function
export async function POST(req: NextRequest) {
  try {
    // Validation
    const body = await req.json();
    const validationResult = validateSchema(storySchema, body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.errors },
        { status: 400 }
      );
    }
    
    // Authentication
    const user = await authenticateUser(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Authorization
    const canCreate = await checkPermission(user, 'story.create');
    if (!canCreate) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }
    
    // Business logic
    const newStory = await createStory(body, user.id);
    
    // Response
    return NextResponse.json(
      { data: newStory, success: true },
      { status: 201 }
    );
  } catch (error) {
    console.error('Story creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Utility Code Organization

Utility functions are organized by domain:

```
/utils
  /date                    # Date manipulation utilities
  /string                  # String manipulation utilities
  /validation              # Validation helpers
  /formatting              # Data formatting utilities
  /analytics               # Analytics helpers
```

## Database Code Organization

Database access code is organized by entity:

```
/database
  /connection.ts           # Database connection management
  /[entity]                # Entity-specific database operations
    repository.ts          # Data access methods
    schema.ts              # Entity schema definition
    types.ts               # Entity-specific types
```

## Configuration Organization

Configuration follows this structure:

```
/config
  index.ts                 # Main configuration export
  environment.ts           # Environment-specific configurations
  features.ts              # Feature flags and toggles
  logging.ts               # Logging configuration
```

## Testing Organization

Tests follow the structure of the code they test:

```
/components/feature        # Component tests alongside components
  Component.test.tsx
/utils                     # Unit tests for utilities
  util.test.ts
/__tests__                 # Integration tests
  /features
    feature.test.ts
```

## Naming Conventions

The project adheres to these naming conventions:

1. **Files**: 
   - React components: PascalCase.tsx
   - Utility functions: kebab-case.ts
   - Hooks: useHookName.ts
   - Tests: original-name.test.ts

2. **Directories**:
   - Feature directories: kebab-case
   - Component directories: PascalCase

3. **Exports**:
   - One component per file with default export
   - Multiple utility functions with named exports

## Code Organization Enforcement

These organization patterns are enforced through:

1. **ESLint Rules**: Custom ESLint rules check file organization
2. **Code Reviews**: Organization is verified during review
3. **Documentation**: This document serves as a reference
4. **File Templates**: Templates enforce correct structure

## Relation to Other Documentation

This code organization document connects to:

- **Project Structure Directory**: For overall directory structure
- **File Naming Conventions**: For detailed naming guidelines
- **Architecture Documentation**: For how organization implements architecture 