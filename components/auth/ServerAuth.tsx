/**
 * ServerAuth component for Auth.js v5
 * Provides authentication utilities for server components
 * 
 * IMPORTANT: This project uses Auth.js v5 (NextAuth v5) EXCLUSIVELY.
 * Do NOT mix with v4 patterns or generic Auth.js implementations.
 *
 * @version Auth.js v5
 */

import { auth } from '@/auth'
import { createLogger } from '@/lib/logging'
import { redirect } from 'next/navigation'

const logger = createLogger('ServerAuth')

/**
 * Auth component that can be used in Server Components to get the session
 * and protect routes using Auth.js v5
 */
export async function ServerAuth({ 
  children, 
  requireAuth = true,
  fallbackUrl = '/auth/signin'
}: { 
  children: React.ReactNode
  requireAuth?: boolean
  fallbackUrl?: string
}) {
  logger.debug('Checking auth in server component using Auth.js v5', { requireAuth })
  
  const session = await auth()
  
  // If authentication is required but no session exists, redirect to sign-in
  if (requireAuth && !session) {
    logger.debug('Redirecting unauthenticated user', { fallbackUrl })
    redirect(fallbackUrl)
  }
  
  return <>{children}</>
}

/**
 * Get Auth.js v5 session in a server component
 * Uses the Auth.js v5 auth() function
 */
export async function getServerSession() {
  return await auth()
}

/**
 * Check if the user is authenticated in a server component
 * Uses the Auth.js v5 auth() function
 */
export async function isAuthenticated() {
  const session = await auth()
  return !!session
}

/**
 * Get user in a server component
 * Uses the Auth.js v5 auth() function
 */
export async function getUser() {
  const session = await auth()
  return session?.user || null
} 