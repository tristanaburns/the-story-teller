/**
 * Auth.js v5 configuration
 * This file contains the main configuration for the authentication system
 * 
 * @see https://authjs.dev/guides/upgrade-to-v5
 */
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { clientPromise } from '@/lib/mongodb';
import { createUserDb } from '@/lib/user-db';

export const config = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID || process.env.GITHUB_ID || "",
      clientSecret: process.env.AUTH_GITHUB_SECRET || process.env.GITHUB_SECRET || "",
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async signIn({ user }: { user: any }) {
      if (user.email) {
        // Create a user-specific database when they first sign in
        await createUserDb(user.id);
      }
      return true;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, user }: { session: any, user: any }) {
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
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);

// Use the auth middleware to protect routes
export const authConfig = {
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    authorized: ({ auth }: { auth: any }) => !!auth,
  },
}; 