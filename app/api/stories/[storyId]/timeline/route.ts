import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
import { getUserDb, generateEntityId } from '@/lib/user-db';

// GET all timeline events for a story
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
    
    // Fetch all events for this story
    const events = await userDb.collection('events').find({ 
      storyId: storyId 
    }).toArray();
    
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching timeline events:', error);
    return NextResponse.json({ error: 'Failed to fetch timeline events' }, { status: 500 });
  }
}

// POST to create a new timeline event
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
    if (!data.title) {
      return NextResponse.json({ error: 'Event title is required' }, { status: 400 });
    }
    
    // Create the timeline event document
    const newEvent = {
      id: generateEntityId(), // Generate a unique ID for references
      storyId: storyId,
      title: data.title,
      description: data.description || '',
      date: data.date || '',
      chronology_date: data.chronology_date ? new Date(data.chronology_date) : null,
      significance: data.significance || '',
      characters_involved: data.characters_involved || [],
      locations_involved: data.locations_involved || [],
      preceding_events: data.preceding_events || [],
      following_events: data.following_events || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert the event into the database
    const result = await userDb.collection('events').insertOne(newEvent);
    
    // Return the created event
    return NextResponse.json({
      _id: result.insertedId,
      ...newEvent
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating timeline event:', error);
    return NextResponse.json({ error: 'Failed to create timeline event' }, { status: 500 });
  }
}