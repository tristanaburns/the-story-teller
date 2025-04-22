/**
 * auth.ts
 * 
 * Root authentication file for Next.js 13+ compatibility
 * Contains Auth.js v5 configuration and re-exports
 * 
 * IMPORTANT: This project uses Auth.js v5 (NextAuth v5) EXCLUSIVELY.
 * Do NOT mix with v4 patterns or generic Auth.js implementations.
 * 
 * This file mimics the default Auth.js v5 installation pattern
 * while using our organized directory structure internally
 * 
 * @version Auth.js v5
 * @see https://authjs.dev/guides/upgrade-to-v5
 */

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Re-export everything from our auth modules
export * from '@/lib/auth';

// Create and export Auth.js v5 handlers
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

// Export auth middleware config for use with middleware.ts
export const authConfig = {
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    authorized: ({ auth }: { auth: any }) => !!auth,
  },
}; 