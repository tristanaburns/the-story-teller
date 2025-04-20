/**
 * OpenAI API client with integrated logging
 */

import { createLogger, logAiOperation, AiOperation } from '@/lib/logging';
import OpenAI from 'openai';

// Create OpenAI-specific logger
const logger = createLogger('OpenAI');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY || '',
});

/**
 * Create a chat completion with logging
 */
export async function createChatCompletion(
  messages: any[],
  options: any = {}
) {
  // Validate API key
  if (!process.env.AI_API_KEY) {
    logger.error('OpenAI API key is not defined');
    throw new Error('OpenAI API key is not defined');
  }
  
  // Set default options
  const defaultOptions = {
    model: 'gpt-4-turbo',
    temperature: 0.7,
    max_tokens: 1000,
  };
  
  // Merge options
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    messages,
  };
  
  // Get model name for logging
  const model = mergedOptions.model;
  
  // Create chat completion with logging
  return logAiOperation(
    AiOperation.COMPLETION,
    model,
    mergedOptions,
    async () => {
      try {
        const completion = await openai.chat.completions.create(mergedOptions);
        logger.debug(`Received response from ${model}`, {
          choices: completion.choices.length,
          finish_reason: completion.choices[0]?.finish_reason,
        });
        return completion;
      } catch (error) {
        logger.error(`Error calling OpenAI API (${model})`, error);
        throw error;
      }
    }
  );
}

/**
 * Create an embedding with logging
 */
export async function createEmbedding(
  input: string | string[],
  options: any = {}
) {
  // Validate API key
  if (!process.env.AI_API_KEY) {
    logger.error('OpenAI API key is not defined');
    throw new Error('OpenAI API key is not defined');
  }
  
  // Set default options
  const defaultOptions = {
    model: 'text-embedding-ada-002',
  };
  
  // Merge options
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    input,
  };
  
  // Get model name for logging
  const model = mergedOptions.model;
  
  // Create embedding with logging
  return logAiOperation(
    AiOperation.EMBEDDING,
    model,
    { ...mergedOptions, input: Array.isArray(input) ? `${input.length} texts` : '1 text' },
    async () => {
      try {
        const embedding = await openai.embeddings.create(mergedOptions);
        logger.debug(`Received embeddings from ${model}`, {
          count: embedding.data.length,
        });
        return embedding;
      } catch (error) {
        logger.error(`Error creating embeddings with ${model}`, error);
        throw error;
      }
    }
  );
}

/**
 * Generate content based on a prompt template
 */
export async function generateFromTemplate(
  templateName: string,
  template: string,
  variables: Record<string, any> = {},
  options: any = {}
) {
  // Log the prompt template being used
  logger.debug(`Using template: ${templateName}`);
  
  // Perform variable substitution
  let prompt = template;
  for (const [key, value] of Object.entries(variables)) {
    prompt = prompt.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), String(value));
  }
  
  // Create messages for chat completion
  const messages = [
    { role: 'system', content: 'You are a helpful assistant for narrative creation.' },
    { role: 'user', content: prompt }
  ];
  
  // Log the prompt template and variables
  logAiOperation(
    AiOperation.PROMPT_GENERATION,
    'template-processor',
    { templateName, variables: Object.keys(variables) },
    async () => ({ success: true, templateProcessed: templateName })
  );
  
  // Create chat completion
  const completion = await createChatCompletion(messages, options);
  
  // Extract and return the content
  return completion.choices[0]?.message.content || '';
}

/**
 * Validate generated content against a schema
 */
export async function validateContentAgainstSchema(
  content: any,
  schema: any
) {
  logger.debug('Validating content against schema');
  
  // Define validation prompt
  const messages = [
    { role: 'system', content: 'You are a schema validation assistant. Your job is to check if content meets the specified schema requirements and if not, explain what corrections are needed.' },
    { role: 'user', content: `
Validate the following content against the given schema:

Content:
\`\`\`json
${JSON.stringify(content, null, 2)}
\`\`\`

Schema:
\`\`\`json
${JSON.stringify(schema, null, 2)}
\`\`\`

Check if the content:
1. Has all required fields
2. Contains valid data types for each field
3. Follows the format/pattern specified in the schema

Respond with one of these formats:
- "VALID" if the content fully complies with the schema
- "INVALID: [explanation of what's wrong and how to fix it]" if the content doesn't comply
` }
  ];
  
  // Create chat completion for validation
  return logAiOperation(
    AiOperation.VALIDATION,
    'schema-validator',
    { contentType: typeof content, schemaSize: JSON.stringify(schema).length },
    async () => {
      const validation = await createChatCompletion(messages, {
        model: 'gpt-4-turbo',
        temperature: 0.1,
        max_tokens: 500
      });
      
      const result = validation.choices[0]?.message.content || '';
      return {
        valid: result.trim().startsWith('VALID'),
        message: result,
        original: content
      };
    }
  );
}

export default {
  createChatCompletion,
  createEmbedding,
  generateFromTemplate,
  validateContentAgainstSchema
};
