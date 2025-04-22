/**
 * SessionProvider component for Auth.js v5
 * Provides session data to client components
 * 
 * IMPORTANT: This project uses Auth.js v5 (NextAuth v5) EXCLUSIVELY.
 * Do NOT mix with v4 patterns or generic Auth.js implementations.
 *
 * @version Auth.js v5
 */

'use client'

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"
import { createLogger } from '@/lib/logging'

const logger = createLogger('SessionProvider')

export function SessionProvider({ 
  children,
  session
}: {
  children: React.ReactNode
  session?: any
}) {
  logger.debug('Initializing Session Provider with Auth.js v5', {
    hasSession: !!session
  })

  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  )
} 