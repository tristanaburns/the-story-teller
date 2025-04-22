# The Story Teller: Folder Structure

*Last Updated: 2025-04-22*

This document outlines the folder structure of The Story Teller application to help developers navigate the codebase efficiently.

## Root Directory Structure

```
the-story-teller/
├── app/               # Next.js application entry point with App Router
├── components/        # Reusable UI components
├── config/            # Configuration files and constants
├── hooks/             # Custom React hooks
├── lib/               # Utility functions and libraries
├── public/            # Static assets (images, fonts, etc.)
├── styles/            # Global styles and Tailwind configuration
├── types/             # TypeScript type definitions
├── prisma/            # Prisma ORM schema and migrations
├── tests/             # Test files
├── .github/           # GitHub workflows and configuration
├── .vscode/           # VS Code settings
└── project/           # Project documentation
```

## App Directory (`/app`)

The app directory follows the Next.js App Router convention with nested routing:

```
app/
├── api/               # API routes
│   ├── auth/          # Authentication API endpoints
│   ├── stories/       # Stories API endpoints
│   └── users/         # Users API endpoints
├── (auth)/            # Authentication routes (grouped)
│   ├── login/         # Login page
│   ├── register/      # Registration page
│   └── forgot-password/ # Password recovery
├── (dashboard)/       # Dashboard routes (grouped)
│   ├── dashboard/     # Main dashboard
│   ├── profile/       # User profile
│   └── settings/      # User settings
├── stories/           # Story-related pages
│   ├── [id]/          # Dynamic route for individual stories
│   ├── create/        # Create new story
│   └── edit/[id]/     # Edit existing story
├── explore/           # Story exploration and discovery
├── error.tsx          # Global error component
├── layout.tsx         # Root layout component
├── loading.tsx        # Global loading component
├── not-found.tsx      # 404 page
└── page.tsx           # Home page
```

### Route Organization

Each route typically contains these files:

```
route-name/
├── page.tsx           # Page component (default export)
├── layout.tsx         # (Optional) Layout specific to this route
├── loading.tsx        # (Optional) Loading state
├── error.tsx          # (Optional) Error handling
├── not-found.tsx      # (Optional) Not found state
└── actions.ts         # (Optional) Server actions
```

## Components Directory (`/components`)

Components are organized by domain and type:

```
components/
├── auth/              # Authentication-related components
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── ResetPasswordForm.tsx
├── dashboard/         # Dashboard-specific components
│   ├── DashboardStats.tsx
│   ├── RecentActivity.tsx
│   └── UserSummary.tsx
├── editor/            # Rich text editor components
│   ├── Editor.tsx
│   ├── Toolbar.tsx
│   └── FormatButton.tsx
├── layout/            # Layout components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Sidebar.tsx
│   └── Navigation.tsx
├── stories/           # Story-related components
│   ├── StoryCard.tsx
│   ├── StoryList.tsx
│   └── StoryMetadata.tsx
└── ui/                # Reusable UI components
    ├── Button/
    │   ├── Button.tsx
    │   └── Button.test.tsx
    ├── Card/
    ├── Dialog/
    ├── Dropdown/
    └── Form/
```

### UI Component Structure

Each UI component folder typically includes:

```
ComponentName/
├── index.ts           # Re-exports the component
├── ComponentName.tsx  # Main component implementation
├── ComponentName.test.tsx # Unit tests
└── ComponentName.stories.tsx # Storybook stories (if applicable)
```

## Hooks Directory (`/hooks`)

Custom React hooks are organized by functionality:

```
hooks/
├── auth/              # Authentication-related hooks
│   ├── useAuth.ts
│   └── useSession.ts
├── stories/           # Story-related hooks
│   ├── useStories.ts
│   └── useStoryActions.ts
├── ui/                # UI-related hooks
│   ├── useMediaQuery.ts
│   ├── useClickOutside.ts
│   └── useLocalStorage.ts
├── form/              # Form-related hooks
│   ├── useForm.ts
│   └── useValidation.ts
└── data/              # Data fetching hooks
    ├── useQuery.ts
    └── useMutation.ts
```

## Lib Directory (`/lib`)

Utilities and services are organized by functionality:

```
lib/
├── api/               # API client and utilities
│   ├── client.ts      # API client instance
│   ├── endpoints.ts   # API endpoint definitions
│   └── helpers.ts     # API helper functions
├── auth/              # Authentication utilities
│   ├── session.ts
│   └── permissions.ts
├── db/                # Database utilities
│   ├── prisma.ts      # Prisma client instance
│   └── queries/       # Reusable database queries
├── utils/             # General utilities
│   ├── date.ts        # Date formatting and manipulation
│   ├── string.ts      # String utilities
│   └── validation.ts  # Validation helpers
└── services/          # External service integrations
    ├── storage.ts     # File storage service
    └── analytics.ts   # Analytics service
```

## Config Directory (`/config`)

Configuration files organized by purpose:

```
config/
├── constants.ts       # Application constants
├── routes.ts          # Route definitions and helpers
├── themes.ts          # Theme configuration
├── menu.ts            # Navigation menu configuration
└── features.ts        # Feature flags
```

## Prisma Directory (`/prisma`)

Database schema and migrations:

```
prisma/
├── schema.prisma      # Prisma schema definition
├── migrations/        # Migration files
│   ├── 20250401000000_initial_migration/
│   └── 20250415000000_add_categories/
└── seed.ts            # Database seeding script
```

## Types Directory (`/types`)

TypeScript type definitions:

```
types/
├── auth.ts            # Authentication-related types
├── story.ts           # Story-related types
├── user.ts            # User-related types
├── api.ts             # API response and request types
└── index.ts           # Re-exports common types
```

## Public Directory (`/public`)

Static assets:

```
public/
├── favicon.ico        # Favicon
├── images/            # Image assets
│   ├── logo.svg
│   ├── hero.jpg
│   └── icons/
├── fonts/             # Font files
└── locales/           # Internationalization files
```

## Styles Directory (`/styles`)

Global styles and Tailwind configuration:

```
styles/
├── globals.css        # Global CSS styles
├── tailwind.css       # Tailwind imports
└── themes/            # Theme variations
    ├── dark.css
    └── light.css
```

## Tests Directory (`/tests`)

Test utilities and integration tests:

```
tests/
├── setup.ts           # Test setup configuration
├── fixtures/          # Test fixtures and mock data
├── utils/             # Test utilities
├── integration/       # Integration tests
└── e2e/               # End-to-end tests
```

## Project Documentation Directory (`/project`)

Project documentation:

```
project/
├── docs/              # Documentation files
│   ├── architecture/  # Architecture documentation
│   ├── codebase/      # Codebase documentation
│   ├── plan/          # Project planning
│   └── status/        # Project status
├── design/            # Design assets and mockups
└── scripts/           # Project-related scripts
```

## File Naming Conventions

The Story Teller follows these file naming conventions:

1. **React Components**: PascalCase for component files
   - Example: `Button.tsx`, `StoryCard.tsx`

2. **Hooks**: camelCase with 'use' prefix
   - Example: `useAuth.ts`, `useLocalStorage.ts`

3. **Utilities**: camelCase
   - Example: `dateUtils.ts`, `stringHelpers.ts`

4. **Constants**: UPPER_SNAKE_CASE for constant values, PascalCase for files
   - Example: `const MAX_STORIES = 10;`, `Constants.ts`

5. **TypeScript Interfaces and Types**: PascalCase
   - Example: `interface UserProfile {}`, `type StoryStatus = 'draft' | 'published';`

6. **Test Files**: Same name as the file they test, with `.test` or `.spec` suffix
   - Example: `Button.test.tsx`, `dateUtils.spec.ts`

## Import Organization

Imports in files should follow this order:

1. External libraries (React, Next.js, etc.)
2. Internal absolute imports (components, hooks, utilities)
3. Relative imports (from the same directory)
4. Style imports

Example:

```typescript
// External libraries
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// Internal absolute imports
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/auth/useAuth';
import { formatDate } from '@/lib/utils/date';

// Relative imports
import { StoryMetadata } from './StoryMetadata';

// Styles
import './StoryCard.module.css';
```

## Conclusion

This folder structure is designed to make navigation through the codebase intuitive and maintainable. The organization follows a domain-driven approach, separating concerns by feature area while keeping common utilities and components accessible.

## Relation to Other Documentation

This folder structure document connects to:
- **Coding Standards**: For information on code organization and naming conventions
- **Architecture Documentation**: For understanding how the folder structure maps to the system architecture
- **Build Process**: For information on how files are processed during the build
- **Team Workflow**: For understanding where to place new code