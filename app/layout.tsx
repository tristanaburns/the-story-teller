import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from './providers'
import { initializeLogging, createLogger } from '@/lib/logging'
import { LoggingProvider } from '@/lib/logging/client/LoggingProvider'

// Initialize logging as early as possible
initializeLogging();

// Create a logger for the root layout
const logger = createLogger('RootLayout');

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'The Story Teller',
  description: 'Advanced narrative schema system for AI-assisted storytelling',
}

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  // Log server-side render of root layout
  logger.debug('Server rendering root layout', {
    componentName: 'RootLayout',
    renderType: 'server'
  });
  
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {/* Wrap the application with logging provider to enable client-side logging */}
          <LoggingProvider componentName="RootLayout">
            {children}
          </LoggingProvider>
        </AuthProvider>
      </body>
    </html>
  )
}