import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
import { getUserDb } from '@/lib/user-db';

// GET a single story by ID
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
    const storyId = params.storyId;
    
    // Validate the story ID format
    if (!ObjectId.isValid(storyId)) {
      return NextResponse.json({ error: 'Invalid story ID format' }, { status: 400 });
    }
    
    const userDb = await getUserDb(userId);
    
    // Find the story by ID
    const story = await userDb.collection('stories').findOne({ 
      _id: new ObjectId(storyId)
    });
    
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    
    return NextResponse.json(story);
  } catch (error) {
    console.error('Error fetching story:', error);
    return NextResponse.json({ error: 'Failed to fetch story' }, { status: 500 });
  }
}

// PUT to update a story
export async function PUT(
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
    const storyId = params.storyId;
    
    // Validate the story ID format
    if (!ObjectId.isValid(storyId)) {
      return NextResponse.json({ error: 'Invalid story ID format' }, { status: 400 });
    }
    
    const userDb = await getUserDb(userId);
    const data = await req.json();
    
    // Basic validation
    if (!data.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    // Update fields
    const updateData = {
      title: data.title,
      description: data.description || '',
      coverImage: data.coverImage || null,
      content: data.content || '',
      updatedAt: new Date(),
      // If metadata was provided, update it
      ...(data.metadata && { metadata: data.metadata }),
    };
    
    // Update the story
    const result = await userDb.collection('stories').updateOne(
      { _id: new ObjectId(storyId) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    
    // Return the updated story
    const updatedStory = await userDb.collection('stories').findOne({
      _id: new ObjectId(storyId)
    });
    
    return NextResponse.json(updatedStory);
  } catch (error) {
    console.error('Error updating story:', error);
    return NextResponse.json({ error: 'Failed to update story' }, { status: 500 });
  }
}

// DELETE a story
export async function DELETE(
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
    const storyId = params.storyId;
    
    // Validate the story ID format
    if (!ObjectId.isValid(storyId)) {
      return NextResponse.json({ error: 'Invalid story ID format' }, { status: 400 });
    }
    
    const userDb = await getUserDb(userId);
    
    // Find the story to confirm it exists and belongs to the user
    const story = await userDb.collection('stories').findOne({ 
      _id: new ObjectId(storyId)
    });
    
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    
    // Delete the story
    await userDb.collection('stories').deleteOne({ 
      _id: new ObjectId(storyId)
    });
    
    // Also delete related data for this story
    await Promise.all([
      userDb.collection('characters').deleteMany({ storyId }),
      userDb.collection('locations').deleteMany({ storyId }),
      userDb.collection('timelines').deleteMany({ storyId }),
      userDb.collection('events').deleteMany({ storyId })
    ]);
    
    // Update user metadata with reduced story count
    await userDb.collection('metadata').updateOne(
      { userId },
      { $inc: { storiesCount: -1 }, $set: { updatedAt: new Date() } }
    );
    
    return NextResponse.json({ success: true, message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Error deleting story:', error);
    return NextResponse.json({ error: 'Failed to delete story' }, { status: 500 });
  }
} 