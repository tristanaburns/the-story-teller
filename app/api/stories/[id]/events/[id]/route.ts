import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
import { getUserDb } from '@/lib/user-db';

// GET a single timeline event by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string[] } }
) {
  try {
    // Get the current session
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const storyId = params.id[0];
    const eventId = params.id[1];
    
    // Validate the IDs
    if (!ObjectId.isValid(storyId) || !ObjectId.isValid(eventId)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
    
    const userDb = await getUserDb(userId);
    
    // Check if the story exists and belongs to the user
    const story = await userDb.collection('stories').findOne({ 
      _id: new ObjectId(storyId)
    });
    
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    
    // Find the event by ID
    const event = await userDb.collection('events').findOne({ 
      _id: new ObjectId(eventId),
      storyId: storyId
    });
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}

// PUT to update a timeline event
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string[] } }
) {
  try {
    // Get the current session
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const storyId = params.id[0];
    const eventId = params.id[1];
    
    // Validate the IDs
    if (!ObjectId.isValid(storyId) || !ObjectId.isValid(eventId)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
    
    const userDb = await getUserDb(userId);
    const data = await req.json();
    
    // Check if the story exists and belongs to the user
    const story = await userDb.collection('stories').findOne({ 
      _id: new ObjectId(storyId)
    });
    
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    
    // Check if the event exists
    const existingEvent = await userDb.collection('events').findOne({ 
      _id: new ObjectId(eventId),
      storyId: storyId
    });
    
    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    // Validate required fields
    if (!data.title) {
      return NextResponse.json({ error: 'Event title is required' }, { status: 400 });
    }
    
    // Prepare the update data
    const updateData = {
      title: data.title,
      date: data.date || existingEvent.date,
      description: data.description || existingEvent.description,
      characters_involved: data.characters_involved || existingEvent.characters_involved,
      locations_involved: data.locations_involved || existingEvent.locations_involved,
      impact_on_plot: data.impact_on_plot || existingEvent.impact_on_plot,
      updatedAt: new Date()
    };
    
    // Update the event
    const result = await userDb.collection('events').updateOne(
      { _id: new ObjectId(eventId), storyId: storyId },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    // Return the updated event
    const updatedEvent = await userDb.collection('events').findOne({
      _id: new ObjectId(eventId),
      storyId: storyId
    });
    
    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

// DELETE a timeline event
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string[] } }
) {
  try {
    // Get the current session
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const storyId = params.id[0];
    const eventId = params.id[1];
    
    // Validate the IDs
    if (!ObjectId.isValid(storyId) || !ObjectId.isValid(eventId)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
    
    const userDb = await getUserDb(userId);
    
    // Check if the story exists and belongs to the user
    const story = await userDb.collection('stories').findOne({ 
      _id: new ObjectId(storyId)
    });
    
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    
    // Find the event to confirm it exists
    const event = await userDb.collection('events').findOne({ 
      _id: new ObjectId(eventId),
      storyId: storyId
    });
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    // Delete the event
    await userDb.collection('events').deleteOne({ 
      _id: new ObjectId(eventId),
      storyId: storyId
    });
    
    return NextResponse.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
} 