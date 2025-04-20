import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import clientPromise from '@/lib/mongodb';
import { getUserDb } from '@/lib/user-db';

// GET handler to fetch all stories for the current user
export async function GET(req: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const userDb = await getUserDb(userId);
    
    // Fetch all stories for this user
    const stories = await userDb.collection('stories').find({}).toArray();
    
    return NextResponse.json(stories);
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 });
  }
}

// POST handler to create a new story
export async function POST(req: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const userDb = await getUserDb(userId);
    
    const data = await req.json();
    
    // Validate input
    if (!data.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    // Create story document
    const newStory = {
      title: data.title,
      description: data.description || '',
      coverImage: data.coverImage || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: userId,
      content: data.content || ''
    };
    
    // Insert story into database
    const result = await userDb.collection('stories').insertOne(newStory);
    
    // Update user metadata with new story count
    await userDb.collection('metadata').updateOne(
      { userId: userId },
      { $inc: { storiesCount: 1 }, $set: { updatedAt: new Date() } }
    );
    
    // Return created story
    return NextResponse.json({
      _id: result.insertedId,
      ...newStory
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating story:', error);
    return NextResponse.json({ error: 'Failed to create story' }, { status: 500 });
  }
}