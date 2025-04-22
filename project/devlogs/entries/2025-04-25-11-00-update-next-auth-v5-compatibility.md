---
title: "Update Auth.js (NextAuth) v5 Compatibility"
date: 2025-04-25T11:00:00
author: Developer
tags: 
  - auth
  - next-auth
  - migration
  - v5
  - compatibility
---

# Auth.js v5 Compatibility Update

## Summary
- Updated auth files to clearly indicate Auth.js v5 usage with version tags
- Updated auth/session.ts to use Auth.js v5 patterns
- Removed duplicate auth configuration in lib/auth.ts
- Created ServerAuth.tsx component for consistent server-side auth
- Fixed root auth.ts to follow Auth.js v5 patterns
- Added strict warnings about version mixing
- Identified files still using v4 patterns (getServerSession)

## Changes Made

### 1. Version Consistency Enforcement

- Added explicit version tags to all auth files: `@version Auth.js v5`
- Added warning comments: "IMPORTANT: This project uses Auth.js v5 (NextAuth v5) EXCLUSIVELY. Do NOT mix with v4 patterns or generic Auth.js implementations."
- Ensured all auth-related logging mentions Auth.js v5
- Removed duplicate authOptions definition to prevent version conflicts

### 2. Updated Session Utilities

Modified `lib/auth/session.ts` to use Auth.js v5 patterns:
- Replaced `getServerSession` from "next-auth/next" with `auth()` from "@/auth"
- Updated documentation to reference Auth.js v5
- Maintained the same API for backward compatibility

### 3. Fixed Root Auth.ts Configuration

Improved `auth.ts` in project root:
- Removed duplicate config definition
- Consistently uses imported authOptions from lib/auth
- Properly exports handlers using Auth.js v5 pattern
- Maintains backward compatibility

### 4. Created ServerAuth Component

Added `components/auth/ServerAuth.tsx` with:
- Server component authentication utilities
- Protective wrapper component
- Helper functions (getServerSession, isAuthenticated, getUser)
- Consistent logging with our system
- Explicit Auth.js v5 version markers

## Remaining Migration Tasks

The following files still use Auth.js v4 patterns and need to be updated:

### Server Components Using getServerSession

Files that import from 'next-auth/next' need to be updated:

```typescript
// BEFORE - Auth.js v4 pattern (DO NOT USE)
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// In server component
const session = await getServerSession(authOptions);

// AFTER - Auth.js v5 pattern (REQUIRED)
import { auth } from '@/auth';
// OR use our utility
import { getServerSession } from '@/components/auth/ServerAuth';

// In server component
const session = await auth();
// OR
const session = await getServerSession();
```

### API Routes Using getServerSession

API routes should be updated to use the new pattern:

```typescript
// BEFORE - Auth.js v4 pattern (DO NOT USE)
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  // ...
}

// AFTER - Auth.js v5 pattern (REQUIRED)
import { auth } from '@/auth';

export async function GET(request: Request) {
  const session = await auth();
  // ...
}
```

### Middleware Using getToken

Middleware should use the new auth() function:

```typescript
// BEFORE - Auth.js v4 pattern (DO NOT USE)
import { getToken } from 'next-auth/jwt';

// AFTER - Auth.js v5 pattern (REQUIRED)
import { auth } from '@/auth';
```

## Testing Considerations

After updating files:

1. Test authentication flow in all protected routes
2. Verify middleware correctly protects routes
3. Check that all session data is properly accessible
4. Ensure API routes correctly handle authentication
5. Verify compatibility with our logging system
6. Verify version consistency across all files

## Benefits of Auth.js v5

- Improved performance through optimized session handling
- Better server component integration
- Simplified API with the auth() function
- Type-safe session access
- Consistent authentication patterns across the application

## Next Steps

1. Create a PR for the changes made so far
2. Update remaining files in a separate PR
3. Add tests specifically for Auth.js v5 compatibility
4. Update documentation to reflect the new patterns

## Guidelines for AI Assistants

When working with this codebase, AI assistants MUST:

1. Only use Auth.js v5 patterns - NEVER suggest v4 code patterns
2. Always import `auth` from '@/auth' (not from next-auth)
3. Never use `getServerSession` from 'next-auth/next'
4. Never use `getToken` from 'next-auth/jwt'
5. Always add version tags (`@version Auth.js v5`) to new auth-related files
6. Include the warning about exclusive v5 usage in documentation
7. Use `auth()` function for server-side session access

Example proper Auth.js v5 usage:
```typescript
// Correct Auth.js v5 pattern
import { auth } from '@/auth';

// In server component or API route
const session = await auth();
if (session) {
  // User is authenticated
} 