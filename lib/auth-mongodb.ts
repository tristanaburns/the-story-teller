/**
 * auth-mongodb.ts
 * 
 * DEPRECATED: This file is maintained for backward compatibility only.
 * Please use imports from '@/lib/auth/mongodb' instead.
 * 
 * Re-export the auth MongoDB module for backward compatibility
 * This ensures that existing imports continue to work
 * while the codebase migrates to the new directory structure
 */

// Show deprecation warning in development
if (process.env.NODE_ENV === 'development') {
  console.warn(
    'DEPRECATED: Using @/lib/auth-mongodb.ts is deprecated. ' +
    'Please use imports from @/lib/auth/mongodb instead.'
  );
}

// Re-export everything from the auth/mongodb module
export * from './auth/mongodb'; 