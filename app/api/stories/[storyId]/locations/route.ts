import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
import { getUserDb, generateEntityId } from '@/lib/user-db';

// GET all locations for a story
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
    
    // Fetch all locations for this story
    const locations = await userDb.collection('locations').find({ 
      storyId: storyId 
    }).toArray();
    
    return NextResponse.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
}

// POST to create a new location
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
      return NextResponse.json({ error: 'Location name is required' }, { status: 400 });
    }
    
    // Create the location document
    const newLocation = {
      id: generateEntityId(), // Generate a unique ID for references
      storyId: storyId,
      name: data.name,
      type: data.type || '',
      description: data.description || '',
      physical_characteristics: data.physical_characteristics || {
        size: null,
        climate: null,
        notable_features: []
      },
      cultural_aspects: data.cultural_aspects || {
        inhabitants: [],
        customs: [],
        history: null
      },
      related_locations: data.related_locations || [],
      appeared_in: data.appeared_in || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert the location into the database
    const result = await userDb.collection('locations').insertOne(newLocation);
    
    // Return the created location
    return NextResponse.json({
      _id: result.insertedId,
      ...newLocation
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json({ error: 'Failed to create location' }, { status: 500 });
  }
}