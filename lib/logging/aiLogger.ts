/**
 * aiLogger.ts
 * 
 * A utility for logging AI operations and integrations with detailed metrics
 */

import { createLogger, LogLevel, LogContext } from './logger';

// Create an AI logger
const aiLogger = createLogger('AI');

/**
 * AI operation types
 */
export enum AiOperation {
  COMPLETION = 'COMPLETION',
  CHAT_COMPLETION = 'CHAT_COMPLETION',
  EMBEDDING = 'EMBEDDING',
  CLASSIFICATION = 'CLASSIFICATION',
  PROMPT_GENERATION = 'PROMPT_GENERATION',
  MODEL_SELECTION = 'MODEL_SELECTION',
  TOKEN_USAGE = 'TOKEN_USAGE',
  VALIDATION = 'VALIDATION',
  SUMMARY = 'SUMMARY',
  VISION = 'VISION',
  FUNCTION_CALL = 'FUNCTION_CALL'
}

/**
 * AI operation context
 */
export interface AiContext extends LogContext {
  operation: AiOperation;
  model: string;
  prompt?: any;
  params?: any;
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
  functionCalls?: string[];
  promptTemplate?: string;
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
    // Log the operation start with sanitized parameters
    modelLogger.debug(`${operation} started`, {
      operation,
      model,
      params: sanitizeParams(params)
    });
    
    // Execute the AI operation
    const result = await callback();
    
    // Calculate duration
    const duration = performance.now() - startTime;
    
    // Extract token usage if available
    const tokenUsage = extractTokenUsage(result);
    
    // Extract function calls if available
    const functionCalls = extractFunctionCalls(result);
    
    // Create context for completion log
    const context: AiContext = {
      operation,
      model,
      duration,
      params: sanitizeParams(params)
    };
    
    // Add token usage if available
    if (tokenUsage) {
      context.tokenUsage = tokenUsage;
    }
    
    // Add function calls if available
    if (functionCalls && functionCalls.length > 0) {
      context.functionCalls = functionCalls;
    }
    
    // Determine log level based on operation duration
    let logLevel = LogLevel.DEBUG;
    if (duration > 5000) {
      logLevel = LogLevel.WARN; // Warn for operations taking more than 5 seconds
    }
    
    // Log the operation completion
    modelLogger.log(
      logLevel,
      `${operation} completed in ${duration.toFixed(2)}ms${
        tokenUsage ? ` with ${tokenUsage.total} tokens (${tokenUsage.prompt} prompt, ${tokenUsage.completion} completion)` : ''
      }`,
      context
    );
    
    return result;
  } catch (error) {
    // Calculate duration
    const duration = performance.now() - startTime;
    
    // Log the error
    modelLogger.error(`${operation} failed after ${duration.toFixed(2)}ms`, {
      error,
      model,
      operation,
      duration,
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
  
  // Handle chat format
  if (result.choices && Array.isArray(result.choices) && result.usage) {
    const { prompt_tokens, completion_tokens, total_tokens } = result.usage;
    
    if (typeof total_tokens === 'number') {
      return {
        prompt: prompt_tokens || 0,
        completion: completion_tokens || 0,
        total: total_tokens
      };
    }
  }
  
  return null;
}

/**
 * Extract function calls from the result if available
 */
function extractFunctionCalls(result: any): string[] | null {
  // Check if the result has function call information
  if (!result || typeof result !== 'object') {
    return null;
  }
  
  // Handle OpenAI response format
  if (result.choices && Array.isArray(result.choices)) {
    const functionCalls: string[] = [];
    
    // Iterate through choices to find function calls
    for (const choice of result.choices) {
      if (choice.message && 
          choice.message.function_call && 
          choice.message.function_call.name) {
        functionCalls.push(choice.message.function_call.name);
      }
      
      if (choice.message && 
          choice.message.tool_calls && 
          Array.isArray(choice.message.tool_calls)) {
        for (const toolCall of choice.message.tool_calls) {
          if (toolCall.function && toolCall.function.name) {
            functionCalls.push(toolCall.function.name);
          }
        }
      }
    }
    
    return functionCalls.length > 0 ? functionCalls : null;
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
          ? `${message.content.slice(0, 100)}${message.content.length > 100 ? '...' : ''}`
          : message.content,
        // Keep function calls intact for debugging
        function_call: message.function_call,
        tool_calls: message.tool_calls
      }));
    } else if (key === 'prompt' && typeof sanitized[key] === 'string') {
      // For text completions, summarize the prompt
      sanitized[key] = `${sanitized[key].slice(0, 100)}${sanitized[key].length > 100 ? '...' : ''}`;
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
  
  // Sanitize the template and variables for logging
  const sanitizedTemplate = typeof template === 'string'
    ? `${template.slice(0, 200)}${template.length > 200 ? '...' : ''}`
    : template;
  
  const sanitizedVariables = sanitizeParams(variables);
  
  // Log the template usage
  templateLogger.debug(`Using prompt template: ${templateName}`, {
    templateName,
    template: sanitizedTemplate,
    variables: sanitizedVariables
  });
}

/**
 * Log AI-related errors with context
 * 
 * @param errorType - Type of error (e.g., 'API Error', 'Validation Error')
 * @param message - Error message
 * @param error - The error object
 * @param context - Additional context
 */
export function logAiError(
  errorType: string,
  message: string,
  error: any,
  context: any = {}
): void {
  const errorLogger = aiLogger.createChildLogger('Errors');
  
  // Extract useful information from the error
  const errorInfo = error instanceof Error
    ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
        ...(error as any)
      }
    : error;
  
  // Log the error with context
  errorLogger.error(`AI ${errorType}: ${message}`, {
    error: errorInfo,
    context: sanitizeParams(context)
  });
}

/**
 * Calculate token usage for a string
 * This is a rough estimate based on GPT tokenization rules
 * 
 * @param text - The text to calculate token usage for
 * @returns Approximate token count
 */
export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  
  // Rule of thumb: A token is ~4 characters of text for English
  return Math.ceil(text.length / 4);
}

export default {
  aiLogger,
  logAiOperation,
  logPromptTemplate,
  logAiError,
  estimateTokenCount,
  AiOperation
};
