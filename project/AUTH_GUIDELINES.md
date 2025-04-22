# Auth.js v5 Guidelines for AI Assistants

## CRITICAL NOTICE

**This project uses Auth.js v5 (NextAuth v5) EXCLUSIVELY.**

**DO NOT mix with v4 patterns or generic Auth.js implementations under any circumstances.**

## Auth.js v5 Required Patterns

### Server Components / API Routes

```typescript
// CORRECT - Auth.js v5 pattern ✅
import { auth } from '@/auth';

// Get session in server component or API route
const session = await auth();
if (session) {
  // User is authenticated
  const userId = session.user?.id;
}

// DO NOT USE - Auth.js v4 pattern ❌
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '@/lib/auth';
// const session = await getServerSession(authOptions);
```

### Client Components

```typescript
// CORRECT - Auth.js v5 pattern for client components ✅
'use client'

import { useSession } from 'next-auth/react';

function MyComponent() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  
  // Access user data
  const userId = session?.user?.id;
  
  return (/* component code */);
}
```

### Route Protection

```typescript
// CORRECT - Auth.js v5 server component protection ✅
import { ServerAuth } from '@/components/auth/ServerAuth';

export default function ProtectedPage() {
  return (
    <ServerAuth requireAuth={true}>
      {/* Protected content */}
    </ServerAuth>
  );
}

// CORRECT - Auth.js v5 middleware protection ✅
// In middleware.ts
import { auth } from '@/auth';

export async function middleware(request) {
  const session = await auth();
  if (!session) {
    // Redirect to login
  }
}
```

## Mandatory File Annotations

All authentication-related files MUST include:

1. Version tag: `@version Auth.js v5`
2. Warning comment: "IMPORTANT: This project uses Auth.js v5 (NextAuth v5) EXCLUSIVELY. Do NOT mix with v4 patterns or generic Auth.js implementations."

Example:

```typescript
/**
 * My Auth-related component
 * 
 * IMPORTANT: This project uses Auth.js v5 (NextAuth v5) EXCLUSIVELY.
 * Do NOT mix with v4 patterns or generic Auth.js implementations.
 *
 * @version Auth.js v5
 */
```

## Auth.js v5 Imports

### ALWAYS USE:
- `import { auth } from '@/auth'` - For server components/API routes
- `import { useSession } from 'next-auth/react'` - For client components
- `import { SessionProvider } from '@/components/auth/SessionProvider'` - For providers
- `import { ServerAuth } from '@/components/auth/ServerAuth'` - For server protection

### NEVER USE:
- ❌ `import { getServerSession } from 'next-auth/next'`
- ❌ `import { getToken } from 'next-auth/jwt'`
- ❌ `import NextAuth from 'next-auth'` (except in the root auth.ts file)

## Testing Authentication

When writing tests for Auth.js v5:

```typescript
// CORRECT - Auth.js v5 test mocking ✅
import { auth } from '@/auth';

// Mock the auth function
jest.mock('@/auth', () => ({
  auth: jest.fn(() => ({
    user: { id: 'mock-user-id', name: 'Test User' }
  }))
}));

// DO NOT USE v4 patterns in tests ❌
// jest.mock('next-auth/next', () => ({
//   getServerSession: jest.fn()
// }));
```

## Documentation Standards

When documenting authentication:

1. Always specify "Auth.js v5" or "NextAuth v5" - never just "Auth" or "NextAuth"
2. Include links to the v5 documentation: https://authjs.dev/guides/upgrade-to-v5
3. Emphasize the exclusive use of v5 patterns

## Examples of Complete Implementation

### Protected API Route

```typescript
/**
 * Protected API route using Auth.js v5
 * 
 * IMPORTANT: This project uses Auth.js v5 (NextAuth v5) EXCLUSIVELY.
 * Do NOT mix with v4 patterns or generic Auth.js implementations.
 *
 * @version Auth.js v5
 */

import { auth } from '@/auth';
import { createLogger } from '@/lib/logging';

const logger = createLogger('ProtectedAPI');

export async function GET(request: Request) {
  const session = await auth();
  
  if (!session) {
    logger.warn('Unauthorized access attempt');
    return new Response('Unauthorized', { status: 401 });
  }
  
  const userId = session.user?.id;
  logger.debug('Authenticated request', { userId });
  
  // Process the request for the authenticated user
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

### Protected Server Component

```typescript
/**
 * Protected page using Auth.js v5
 * 
 * IMPORTANT: This project uses Auth.js v5 (NextAuth v5) EXCLUSIVELY.
 * Do NOT mix with v4 patterns or generic Auth.js implementations.
 *
 * @version Auth.js v5
 */

import { ServerAuth } from '@/components/auth/ServerAuth';
import { DashboardContent } from '@/components/dashboard/DashboardContent';

export default function DashboardPage() {
  return (
    <ServerAuth requireAuth={true}>
      <DashboardContent />
    </ServerAuth>
  );
}
```

Remember, consistency is absolutely critical. Using the wrong patterns can cause difficult-to-debug authentication issues. 