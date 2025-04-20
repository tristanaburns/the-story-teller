import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
import { getUserDb } from '@/lib/user-db';

// GET a single timeline event by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { storyId: string; id: string } }
) {
  try {
    // Get the current session
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { storyId, id } = params;
    
    // Validate the IDs
    if (!ObjectId.isValid(storyId) || !ObjectId.isValid(id)) {
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
      _id: new ObjectId(id),
      storyId: storyId
    });
    
    if (!event) {
      return NextResponse.json({ error: 'Timeline event not found' }, { status: 404 });
    }
    
    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching timeline event:', error);
    return NextResponse.json({ error: 'Failed to fetch timeline event' }, { status: 500 });
  }
}

// PUT to update a timeline event
export async function PUT(
  req: NextRequest,
  { params }: { params: { storyId: string; id: string } }
) {
  try {
    // Get the current session
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { storyId, id } = params;
    
    // Validate the IDs
    if (!ObjectId.isValid(storyId) || !ObjectId.isValid(id)) {
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
      _id: new ObjectId(id),
      storyId: storyId
    });
    
    if (!existingEvent) {
      return NextResponse.json({ error: 'Timeline event not found' }, { status: 404 });
    }
    
    // Validate required fields
    if (!data.title) {
      return NextResponse.json({ error: 'Event title is required' }, { status: 400 });
    }
    
    // Process the chronology_date if provided
    let chronology_date = existingEvent.chronology_date;
    if (data.chronology_date) {
      chronology_date = new Date(data.chronology_date);
      if (isNaN(chronology_date.getTime())) {
        return NextResponse.json({ error: 'Invalid chronology date format' }, { status: 400 });
      }
    }
    
    // Prepare the update data
    const updateData = {
      title: data.title,
      description: data.description || existingEvent.description,
      date: data.date || existingEvent.date,
      chronology_date: chronology_date,
      significance: data.significance || existingEvent.significance,
      characters_involved: data.characters_involved || existingEvent.characters_involved,
      locations_involved: data.locations_involved || existingEvent.locations_involved,
      preceding_events: data.preceding_events || existingEvent.preceding_events,
      following_events: data.following_events || existingEvent.following_events,
      updatedAt: new Date()
    };
    
    // Update the event
    const result = await userDb.collection('events').updateOne(
      { _id: new ObjectId(id), storyId: storyId },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Timeline event not found' }, { status: 404 });
    }
    
    // Return the updated event
    const updatedEvent = await userDb.collection('events').findOne({
      _id: new ObjectId(id),
      storyId: storyId
    });
    
    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Error updating timeline event:', error);
    return NextResponse.json({ error: 'Failed to update timeline event' }, { status: 500 });
  }
}

// DELETE a timeline event
export async function DELETE(
  req: NextRequest,
  { params }: { params: { storyId: string; id: string } }
) {
  try {
    // Get the current session
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { storyId, id } = params;
    
    // Validate the IDs
    if (!ObjectId.isValid(storyId) || !ObjectId.isValid(id)) {
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
      _id: new ObjectId(id),
      storyId: storyId
    });
    
    if (!event) {
      return NextResponse.json({ error: 'Timeline event not found' }, { status: 404 });
    }
    
    // Delete the event
    await userDb.collection('events').deleteOne({ 
      _id: new ObjectId(id),
      storyId: storyId
    });
    
    // Update any events that reference this event
    await userDb.collection('events').updateMany(
      { storyId: storyId },
      { 
        $pull: { 
          preceding_events: event.id,
          following_events: event.id
        } 
      }
    );
    
    return NextResponse.json({ success: true, message: 'Timeline event deleted successfully' });
  } catch (error) {
    console.error('Error deleting timeline event:', error);
    return NextResponse.json({ error: 'Failed to delete timeline event' }, { status: 500 });
  }
}