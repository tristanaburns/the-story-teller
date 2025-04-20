/**
 * aiLogger.ts
 * 
 * A utility for logging AI operations and integrations
 */

import { createLogger } from './logger';

// Create an AI logger
const aiLogger = createLogger('AI');

/**
 * AI operation types
 */
export enum AiOperation {
  COMPLETION = 'COMPLETION',
  EMBEDDING = 'EMBEDDING',
  CLASSIFICATION = 'CLASSIFICATION',
  PROMPT_GENERATION = 'PROMPT_GENERATION',
  MODEL_SELECTION = 'MODEL_SELECTION',
  TOKEN_USAGE = 'TOKEN_USAGE',
  VALIDATION = 'VALIDATION'
}

/**
 * Log an AI operation with timing and token usage information
 * 
 * @param operation - The type of AI operation
 * @param model - The AI model being used
 * @param params - Parameters for the operation
 * @param callback - The function that performs the actual AI operation
 * @returns The result of the AI operation
 */
export async function logAiOperation<T>(
  operation: AiOperation,
  model: string,
  params: any,
  callback: () => Promise<T>
): Promise<T> {
  // Create a model-specific logger
  const modelLogger = aiLogger.createChildLogger(model);
  
  // Start timing
  const startTime = performance.now();
  
  try {
    // Log the operation start
    modelLogger.debug(`${operation} started`, sanitizeParams(params));
    
    // Execute the AI operation
    const result = await callback();
    
    // Calculate duration
    const duration = performance.now() - startTime;
    
    // Extract token usage if available
    const tokenUsage = extractTokenUsage(result);
    
    // Log the operation completion with token usage if available
    if (tokenUsage) {
      modelLogger.debug(`${operation} completed in ${duration.toFixed(2)}ms with ${tokenUsage.total} tokens (${tokenUsage.prompt} prompt, ${tokenUsage.completion} completion)`);
      
      // Log detailed token usage
      modelLogger.debug('Token usage details', tokenUsage);
    } else {
      modelLogger.debug(`${operation} completed in ${duration.toFixed(2)}ms`);
    }
    
    return result;
  } catch (error) {
    // Calculate duration
    const duration = performance.now() - startTime;
    
    // Log the error
    modelLogger.error(`${operation} failed after ${duration.toFixed(2)}ms`, {
      error,
      model,
      params: sanitizeParams(params)
    });
    
    // Re-throw the error
    throw error;
  }
}

/**
 * Extract token usage information from the result if available
 */
function extractTokenUsage(result: any): { prompt: number; completion: number; total: number } | null {
  // Check if the result has token usage information
  if (!result || typeof result !== 'object') {
    return null;
  }
  
  // Handle OpenAI response format
  if (result.usage && typeof result.usage === 'object') {
    const { prompt_tokens, completion_tokens, total_tokens } = result.usage;
    
    if (typeof total_tokens === 'number') {
      return {
        prompt: prompt_tokens || 0,
        completion: completion_tokens || 0,
        total: total_tokens
      };
    }
  }
  
  // Handle custom format
  if (result.tokenUsage && typeof result.tokenUsage === 'object') {
    const { prompt, completion, total } = result.tokenUsage;
    
    if (typeof total === 'number') {
      return {
        prompt: prompt || 0,
        completion: completion || 0,
        total
      };
    }
  }
  
  return null;
}

/**
 * Sanitize AI operation parameters for logging
 */
function sanitizeParams(params: any): any {
  if (!params || typeof params !== 'object') {
    return params;
  }
  
  // Create a shallow copy
  const sanitized = { ...params };
  
  // List of potentially sensitive fields
  const sensitiveFields = ['api_key', 'apiKey', 'key', 'secret', 'token'];
  
  // Replace sensitive fields
  for (const key in sanitized) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (key === 'messages' && Array.isArray(sanitized[key])) {
      // For chat completions, keep message structure but summarize content
      sanitized[key] = sanitized[key].map((message: any) => ({
        role: message.role,
        content: typeof message.content === 'string'
          ? `${message.content.slice(0, 50)}${message.content.length > 50 ? '...' : ''}`
          : message.content
      }));
    } else if (key === 'prompt' && typeof sanitized[key] === 'string') {
      // For text completions, summarize the prompt
      sanitized[key] = `${sanitized[key].slice(0, 50)}${sanitized[key].length > 50 ? '...' : ''}`;
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeParams(sanitized[key]);
    }
  }
  
  return sanitized;
}

/**
 * Log a prompt template with its variables
 * 
 * @param templateName - The name of the prompt template
 * @param template - The template string or object
 * @param variables - Variables used in the template
 */
export function logPromptTemplate(templateName: string, template: any, variables: any = {}): void {
  const templateLogger = aiLogger.createChildLogger('Templates');
  
  templateLogger.debug(`Using prompt template: ${templateName}`, {
    template: typeof template === 'string'
      ? `${template.slice(0, 100)}${template.length > 100 ? '...' : ''}`
      : template,
    variables: sanitizeParams(variables)
  });
}

export default {
  aiLogger,
  logAiOperation,
  logPromptTemplate,
  AiOperation
};
