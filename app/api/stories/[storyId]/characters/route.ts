import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
import { getUserDb, generateEntityId } from '@/lib/user-db';

// GET all characters for a story
export async function GET(
  req: NextRequest,
  { params }: { params: { storyId: string } }
) {
  try {
    // Get the current session
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { storyId } = params;
    
    // Validate the story ID format
    if (!ObjectId.isValid(storyId)) {
      return NextResponse.json({ error: 'Invalid story ID format' }, { status: 400 });
    }
    
    const userDb = await getUserDb(userId);
    
    // Check if the story exists and belongs to the user
    const story = await userDb.collection('stories').findOne({ 
      _id: new ObjectId(storyId)
    });
    
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    
    // Fetch all characters for this story
    const characters = await userDb.collection('characters').find({ 
      storyId: storyId 
    }).toArray();
    
    return NextResponse.json(characters);
  } catch (error) {
    console.error('Error fetching characters:', error);
    return NextResponse.json({ error: 'Failed to fetch characters' }, { status: 500 });
  }
}

// POST to create a new character
export async function POST(
  req: NextRequest,
  { params }: { params: { storyId: string } }
) {
  try {
    // Get the current session
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { storyId } = params;
    
    // Validate the story ID format
    if (!ObjectId.isValid(storyId)) {
      return NextResponse.json({ error: 'Invalid story ID format' }, { status: 400 });
    }
    
    const userDb = await getUserDb(userId);
    
    // Check if the story exists and belongs to the user
    const story = await userDb.collection('stories').findOne({ 
      _id: new ObjectId(storyId)
    });
    
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    
    const data = await req.json();
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json({ error: 'Character name is required' }, { status: 400 });
    }
    
    // Create the character document
    const newCharacter = {
      id: generateEntityId(), // Generate a unique ID for references
      storyId: storyId,
      name: data.name,
      full_name: data.full_name || null,
      type: data.type || 'supporting',
      status: data.status || 'alive',
      description: data.description || '',
      physical_appearance: data.physical_appearance || {
        height: null,
        build: null,
        distinctive_features: [],
        typical_attire: null
      },
      personality: data.personality || {
        traits: [],
        values: [],
        motivations: []
      },
      background: data.background || {
        birthplace: null,
        occupation: null,
        significant_events: []
      },
      relationships: data.relationships || [],
      story_role: data.story_role || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert the character into the database
    const result = await userDb.collection('characters').insertOne(newCharacter);
    
    // Return the created character
    return NextResponse.json({
      _id: result.insertedId,
      ...newCharacter
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating character:', error);
    return NextResponse.json({ error: 'Failed to create character' }, { status: 500 });
  }
}