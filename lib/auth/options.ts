/**
 * auth/options.ts
 * 
 * NextAuth.js v5 (Auth.js v5) options configuration 
 * Defines providers, callbacks, and other authentication settings
 * 
 * IMPORTANT: This project uses Auth.js v5 (NextAuth v5) EXCLUSIVELY.
 * Do NOT mix with v4 patterns or generic Auth.js implementations.
 *
 * @version Auth.js v5
 */

import { NextAuthOptions } from "next-auth";
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { clientPromise } from './mongodb';
import { createUserDb } from '@/lib/user-db';

/**
 * Next Auth configuration options
 * Used across the app for consistent authentication
 */
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    async signIn({ user }) {
      if (user.email) {
        // Create a user-specific database when they first sign in
        await createUserDb(user.id);
      }
      return true;
    },
    async session({ session, user }) {
      // Add the user ID to the session object
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error(code, metadata) {
      console.error(`Auth error (${code}):`, metadata);
    },
    warn(code) {
      console.warn(`Auth warning (${code})`);
    },
  },
}; 