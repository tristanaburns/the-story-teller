import { NextAuthOptions } from "next-auth";
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { clientPromise } from '@/lib/mongodb';
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
}; 