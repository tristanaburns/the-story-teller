/**
 * LoggingProvider.tsx
 * 
 * A client-side wrapper component that initializes logging
 * and provides navigation tracking for the application
 */

'use client';

import React, { useEffect } from 'react';
import { createClientLogger } from './clientLogger';
import { useNavigationLogging } from './hooks/useNavigationLogging';
import { useSession } from 'next-auth/react';

// Initialize the client logger as early as possible
const clientLogger = createClientLogger('Client');

interface LoggingProviderProps {
  children: React.ReactNode;
  componentName?: string;
}

/**
 * Client-side logging provider that initializes logging and
 * provides navigation tracking for the application
 */
export function LoggingProvider({ 
  children, 
  componentName = 'Application' 
}: LoggingProviderProps) {
  // Use navigation logging hook
  const { logNavigation } = useNavigationLogging(componentName);
  
  // Get session information for user context
  const { data: session, status } = useSession();
  
  // Log initial client-side render
  useEffect(() => {
    clientLogger.debug('Client-side initialization', {
      componentName,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      devicePixelRatio: window.devicePixelRatio,
      timestamp: Date.now()
    });
    
    // Set up global error handling
    const originalOnError = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
      clientLogger.error('Unhandled global error', {
        error: error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : { message },
        source,
        position: { line: lineno, column: colno }
      });
      
      // Call the original handler if it exists
      if (typeof originalOnError === 'function') {
        return originalOnError.apply(this, arguments as any);
      }
      return false;
    };
    
    // Set up unhandled promise rejection handling
    const originalOnUnhandledRejection = window.onunhandledrejection;
    window.onunhandledrejection = function(event) {
      clientLogger.error('Unhandled promise rejection', {
        error: event.reason instanceof Error ? {
          message: event.reason.message,
          stack: event.reason.stack,
          name: event.reason.name
        } : { message: String(event.reason) }
      });
      
      // Call the original handler if it exists
      if (typeof originalOnUnhandledRejection === 'function') {
        return originalOnUnhandledRejection.apply(this, arguments as any);
      }
    };
    
    // Log navigation performance
    logNavigation('initial-load');
    
    // Cleanup function
    return () => {
      // Restore original error handlers
      window.onerror = originalOnError;
      window.onunhandledrejection = originalOnUnhandledRejection;
      
      clientLogger.debug('Client-side cleanup', {
        componentName,
        timestamp: Date.now()
      });
    };
  }, [componentName, logNavigation]);
  
  // Log session state changes
  useEffect(() => {
    if (status === 'loading') {
      clientLogger.debug('Session loading', { status });
    } else if (status === 'authenticated' && session) {
      // Log user information without sensitive details
      clientLogger.info('User authenticated', {
        userId: session.user?.id, 
        email: session.user?.email ? `${session.user.email.substring(0, 3)}...` : undefined,
        name: session.user?.name,
        status,
        hasImage: !!session.user?.image
      });
      
      // Set the user ID in the client logger for all future logs
      if (session.user?.id) {
        clientLogger.setUserId(session.user.id);
      }
    } else if (status === 'unauthenticated') {
      clientLogger.info('User not authenticated', { status });
      
      // Clear the user ID in the client logger
      clientLogger.setUserId(null);
    }
  }, [session, status]);
  
  // Add click event listeners for all interactive elements
  useEffect(() => {
    const handleInteraction = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Skip if target is not an element
      if (!target || !target.tagName) return;
      
      // Only log clicks on interactive elements
      const interactiveElements = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'DETAILS', 'SUMMARY'];
      if (interactiveElements.includes(target.tagName)) {
        clientLogger.debug('User interaction', {
          type: event.type,
          element: target.tagName.toLowerCase(),
          id: target.id || undefined,
          className: target.className || undefined,
          text: target.textContent?.slice(0, 50) || undefined
        });
      }
    };
    
    // Add event listener for clicks
    document.addEventListener('click', handleInteraction);
    
    // Cleanup
    return () => {
      document.removeEventListener('click', handleInteraction);
    };
  }, []);
  
  return <>{children}</>;
} 