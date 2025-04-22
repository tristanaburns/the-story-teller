/**
 * auth/session.ts
 * 
 * Utility functions for working with Auth.js v5 sessions
 * Provides type-safe access to session data and user information
 */

import { auth } from "@/auth";

/**
 * Get the current session server-side with strong typing
 * Uses the Auth.js v5 auth() function
 */
export async function getSession() {
  try {
    const session = await auth();
    return session;
  } catch (error) {
    console.error("Error retrieving session:", error);
    return null;
  }
}

/**
 * Get the current user ID server-side
 * Returns null if not authenticated
 */
export async function getUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.user?.id || null;
}

/**
 * Determine if the current session belongs to an authenticated user
 * Returns true if a valid session exists with a user ID
 */
export async function isAuthenticated(): Promise<boolean> {
  const userId = await getUserId();
  return userId !== null;
}

/**
 * Extract user information from session in a type-safe way
 * @param session The Auth.js session object
 * @returns Object with user information or null
 */
export function extractUserFromSession(session: any) {
  if (!session?.user) return null;
  
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  };
} 