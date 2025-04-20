import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import OpenAI from 'openai';

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

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const data = await request.json() as GenerateCharactersRequest;
    const { prompt, storyId, existingCharacters = [], characterType, count } = data;

    if (!storyId) {
      return NextResponse.json({ error: 'Story ID is required' }, { status: 400 });
    }

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    if (!openai.apiKey) {
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

    // Make the API call to OpenAI
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
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      return NextResponse.json(
        { error: 'Failed to parse AI response', details: responseText },
        { status: 500 }
      );
    }

    // Return the generated characters
    return NextResponse.json({ characters });
  } catch (error) {
    console.error('Error in character generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate characters', details: (error as Error).message },
      { status: 500 }
    );
  }
}
