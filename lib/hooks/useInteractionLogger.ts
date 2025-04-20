/**
 * useInteractionLogger.ts
 * 
 * A custom hook for tracking and logging user interactions
 */

import { useCallback, useEffect, useRef } from 'react';
import { useLogger } from './useLogger';

// Define interaction types
export type InteractionType = 
  | 'click'
  | 'hover'
  | 'input'
  | 'select'
  | 'navigation'
  | 'resource'
  | 'ai'
  | 'database'
  | 'api'
  | 'custom';

// Interface for interaction data
export interface InteractionData {
  type: InteractionType;
  target?: string;
  action?: string;
  value?: any;
  metadata?: Record<string, any>;
  timestamp?: number;
}

// Hook for tracking interactions
export function useInteractionLogger(componentName: string) {
  // Create logger
  const logger = useLogger(`Interaction:${componentName}`);
  
  // Store interaction history for potential analysis
  const interactionHistory = useRef<InteractionData[]>([]);
  
  // Log an interaction
  const logInteraction = useCallback((data: Omit<InteractionData, 'timestamp'>) => {
    // Create full interaction record with timestamp
    const interaction: InteractionData = {
      ...data,
      timestamp: Date.now(),
    };
    
    // Log based on interaction type
    switch (interaction.type) {
      case 'click':
        logger.debug(`Click on ${interaction.target}: ${interaction.action || ''}`, interaction);
        break;
      case 'hover':
        logger.debug(`Hover on ${interaction.target}`, interaction);
        break;
      case 'input':
        logger.debug(`Input on ${interaction.target}`, {
          ...interaction,
          // Redact potential sensitive values but keep type and length info
          value: typeof interaction.value === 'string' 
            ? `[String: ${interaction.value.length} chars]`
            : interaction.value,
        });
        break;
      case 'select':
        logger.debug(`Selection on ${interaction.target}: ${interaction.value}`, interaction);
        break;
      case 'navigation':
        logger.info(`Navigation to ${interaction.target}`, interaction);
        break;
      case 'resource':
        logger.debug(`Resource ${interaction.action} for ${interaction.target}`, interaction);
        break;
      case 'ai':
        logger.debug(`AI interaction: ${interaction.action}`, interaction);
        break;
      case 'database':
        logger.debug(`Database operation: ${interaction.action}`, interaction);
        break;
      case 'api':
        logger.debug(`API interaction: ${interaction.action}`, interaction);
        break;
      case 'custom':
        logger.debug(`${interaction.action}: ${interaction.target}`, interaction);
        break;
      default:
        logger.debug(`Interaction logged`, interaction);
    }
    
    // Store in history
    interactionHistory.current.push(interaction);
    
    // Keep history size reasonable
    if (interactionHistory.current.length > 100) {
      interactionHistory.current.shift();
    }
  }, [logger]);
  
  // Get interaction history
  const getInteractionHistory = useCallback(() => {
    return [...interactionHistory.current];
  }, []);
  
  // Clear interaction history
  const clearInteractionHistory = useCallback(() => {
    logger.debug('Clearing interaction history');
    interactionHistory.current = [];
  }, [logger]);
  
  // Set up global event tracking
  useEffect(() => {
    // Record page view when component mounts
    logInteraction({
      type: 'navigation',
      target: window.location.pathname,
      action: 'page_view',
      metadata: {
        referrer: document.referrer,
        userAgent: navigator.userAgent,
      },
    });
    
    // Track performance metrics
    if (typeof window !== 'undefined' && 'performance' in window) {
      if ('getEntriesByType' in performance) {
        // Log navigation timing data
        const navigationEntries = performance.getEntriesByType('navigation');
        if (navigationEntries && navigationEntries.length > 0) {
          const navigationTiming = navigationEntries[0];
          logger.debug('Page load performance metrics', navigationTiming);
        }
      }
    }
    
    return () => {
      // Record component unmount
      logInteraction({
        type: 'navigation',
        target: window.location.pathname,
        action: 'component_exit',
      });
    };
  }, []);
  
  return {
    logInteraction,
    getInteractionHistory,
    clearInteractionHistory,
  };
}

export default useInteractionLogger;
