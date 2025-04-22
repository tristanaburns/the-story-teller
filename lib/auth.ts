/**
 * lib/auth.ts
 * 
 * DEPRECATED: This file is maintained for backward compatibility only.
 * Please use imports from '@/lib/auth/{module}' instead.
 * 
 * IMPORTANT: This project uses Auth.js v5 (NextAuth v5) EXCLUSIVELY.
 * Do NOT mix with v4 patterns or generic Auth.js implementations.
 * 
 * @version Auth.js v5
 */

import { authOptions as newAuthOptions } from './auth/options';

// Show deprecation warning in development
if (process.env.NODE_ENV === 'development') {
  console.warn(
    'DEPRECATED: Using @/lib/auth.ts is deprecated. ' +
    'Please use imports from @/lib/auth/ directory instead.'
  );
}

// Re-export the auth options to maintain backward compatibility
export const authOptions = newAuthOptions;

// Re-export everything from the auth modules
export * from './auth/index';
export * from './auth/options';
export * from './auth/session';