import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from './providers'
import { initializeLogging, createLogger } from '@/lib/logging'

// Initialize logging as early as possible
initializeLogging();

// Create a logger for the root layout
const logger = createLogger('RootLayout');

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'The Story Teller',
  description: 'Advanced narrative schema system for AI-assisted storytelling',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  logger.debug('Rendering root layout');
  // Log when the layout is about to render
  logger.debug('Rendering application shell');
  
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}