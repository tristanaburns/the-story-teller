/**
 * AI Character Generation API Route
 * 
 * Provides an endpoint to generate character suggestions based on a story prompt
 * using OpenAI's GPT-4 model. The generated characters include detailed attributes
 * like personality, background, and relationships with existing characters.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import OpenAI from 'openai';
import { createLogger } from '@/lib/logging';

const logger = createLogger('API:AICharacterGeneration');

// Define interfaces for the request and response
interface ExistingCharacter {
  name: string;
  type?: string;
  story_role?: string;
}

interface GenerateCharactersRequest {
  prompt: string;
  storyId: string;
  existingCharacters?: ExistingCharacter[];
  characterType: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  count: number;
}

/**
 * POST handler for generating AI-powered character suggestions
 * 
 * @param request - The incoming request containing story details and generation parameters
 * @returns JSON response with generated characters or error information
 */
export async function POST(request: NextRequest) {
  logger.debug('Processing character generation request');
  
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      logger.warn('Unauthorized character generation attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user?.id;
    logger.debug('Authorized character generation request', { userId });

    // Parse request body
    const data = await request.json() as GenerateCharactersRequest;
    const { prompt, storyId, existingCharacters = [], characterType, count } = data;

    logger.debug('Character generation parameters received', { 
      storyId, 
      characterType, 
      count, 
      existingCharactersCount: existingCharacters.length 
    });

    // Validate required fields
    if (!storyId) {
      logger.warn('Missing story ID in request', { userId });
      return NextResponse.json({ error: 'Story ID is required' }, { status: 400 });
    }

    if (!prompt) {
      logger.warn('Missing prompt in request', { userId, storyId });
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    if (!openai.apiKey) {
      logger.error('OpenAI API key not configured');
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Build the full prompt with JSON format instructions
    const fullPrompt = `
You are a creative writing assistant specializing in character creation. Generate ${count} unique and interesting ${characterType} characters for a story based on the following prompt:

${prompt}

Return the characters as a JSON array of objects with the following structure:
{
  "name": "Character Name",
  "full_name": "Full Character Name (if applicable)",
  "type": "${characterType}",
  "description": "Brief character description",
  "physical_appearance": {
    "height": "Character's height",
    "build": "Character's build",
    "distinctive_features": ["Feature 1", "Feature 2"],
    "typical_attire": "Character's typical clothing"
  },
  "personality": {
    "traits": ["Trait 1", "Trait 2", "Trait 3"],
    "values": ["Value 1", "Value 2"],
    "motivations": ["Motivation 1", "Motivation 2"]
  },
  "background": {
    "birthplace": "Character's birthplace",
    "occupation": "Character's job or role",
    "significant_events": ["Event 1", "Event 2"]
  },
  "story_role": "Character's specific role in the story",
  "relationships": [
    {
      "character_name": "Name of related character (preferably from existing_characters if applicable)",
      "relationship_type": "Type of relationship (friend, enemy, mentor, etc.)",
      "dynamics": "Description of the relationship dynamics"
    }
  ]
}

Existing characters in the story: ${JSON.stringify(existingCharacters)}

IMPORTANT:
1. Make the characters believable, complex, and fitting for the story context
2. Do not include any explanations or additional text in your response, ONLY the JSON array
3. Ensure the JSON is valid and properly formatted
4. For relationships, prioritize connecting to existing characters when appropriate
`;

    logger.debug('Sending request to OpenAI', { 
      model: "gpt-4", 
      storyId, 
      characterType, 
      count 
    });

    // Make the API call to OpenAI
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a creative writing assistant that specializes in character creation." },
          { role: "user", content: fullPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      // Parse the response
      const responseText = completion.choices[0]?.message?.content || '';
      logger.debug('Received response from OpenAI', { 
        responseLength: responseText.length,
        storyId
      });
      
      // Extract JSON from the response
      let characters = [];
      try {
        // Look for a JSON array in the response using a regular expression
        // that supports matching across multiple lines
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          characters = JSON.parse(jsonMatch[0]);
        } else {
          // If no array found, try to parse the entire response as JSON
          characters = JSON.parse(responseText);
        }
        
        // Ensure characters is an array
        if (!Array.isArray(characters)) {
          characters = [characters];
        }
        
        logger.info('Successfully generated characters', { 
          storyId, 
          userId,
          count: characters.length, 
          characterType 
        });
      } catch (error) {
        logger.error('Error parsing OpenAI response', { 
          error: error instanceof Error ? error.message : String(error),
          responseText: responseText.substring(0, 200) + (responseText.length > 200 ? '...' : '')
        });
        
        return NextResponse.json(
          { error: 'Failed to parse AI response', details: responseText },
          { status: 500 }
        );
      }

      // Return the generated characters
      return NextResponse.json({ characters });
    } catch (openAiError) {
      logger.error('OpenAI API error', { 
        error: openAiError instanceof Error ? openAiError.message : String(openAiError),
        storyId
      });
      
      return NextResponse.json(
        { error: 'OpenAI API error', details: openAiError instanceof Error ? openAiError.message : String(openAiError) },
        { status: 502 }
      );
    }
  } catch (error) {
    logger.error('Unhandled error in character generation', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: 'Failed to generate characters', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
