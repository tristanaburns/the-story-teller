'use client';

import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from '@/components/ui/sonner';
import { createLogger } from '@/lib/logging';

// Create a logger for providers
const logger = createLogger('Providers');

// Create theme context
type Theme = 'light' | 'dark' | 'system';

interface ThemeContextProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

// Create application context
interface AppContextProps {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  lastError: Error | null;
  setLastError: (error: Error | null) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

// Combined providers component
export function Providers({ children }: { children: ReactNode }) {
  logger.debug('Rendering application providers');
  
  return (
    <SessionProvider>
      <AppStateProvider>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </AppStateProvider>
    </SessionProvider>
  );
}

// Theme provider component
function ThemeProvider({ children }: { children: ReactNode }) {
  const logger = createLogger('ThemeProvider');
  const [theme, setTheme] = useState<Theme>('system');
  
  useEffect(() => {
    // Get theme from local storage or default to system
    const savedTheme = localStorage.getItem('theme') as Theme || 'system';
    logger.debug(`Initializing theme: ${savedTheme}`);
    setTheme(savedTheme);
  }, []);
  
  const updateTheme = (newTheme: Theme) => {
    logger.debug(`Updating theme: ${newTheme}`);
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Apply theme to document
    if (newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      logger.debug('Applied dark theme to document');
    } else {
      document.documentElement.classList.remove('dark');
      logger.debug('Applied light theme to document');
    }
  };
  
  // Update theme when preference changes
  useEffect(() => {
    updateTheme(theme);
    
    // Listen for system preference changes if using system theme
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (event: MediaQueryListEvent) => {
        logger.debug(`System theme preference changed: ${event.matches ? 'dark' : 'light'}`);
        if (event.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme: updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// App state provider component
function AppStateProvider({ children }: { children: ReactNode }) {
  const logger = createLogger('AppStateProvider');
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);
  
  // Log state changes
  useEffect(() => {
    logger.debug(`Loading state changed: ${isLoading}`);
  }, [isLoading]);
  
  useEffect(() => {
    if (lastError) {
      logger.error('Application error occurred', lastError);
    }
  }, [lastError]);
  
  const contextValue: AppContextProps = {
    isLoading,
    setIsLoading: (value) => {
      logger.debug(`Setting loading state: ${value}`);
      setIsLoading(value);
    },
    lastError,
    setLastError: (error) => {
      if (error) {
        logger.error('Setting application error', error);
      } else {
        logger.debug('Clearing application error');
      }
      setLastError(error);
    }
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Auth provider component (already provided by next-auth)
export function AuthProvider({ children }: { children: ReactNode }) {
  logger.debug('Rendering auth provider');
  return <SessionProvider>{children}</SessionProvider>;
}

// Custom hooks for using contexts
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function useAppState() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
