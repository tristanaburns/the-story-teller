import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
import { getUserDb } from '@/lib/user-db';

// Define a type for the MongoDB $pull operation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PullOperator = {
  $pull: {
    [key: string]: any;
  };
};

// GET a single character by ID
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
    
    // Find the character by ID
    const character = await userDb.collection('characters').findOne({ 
      _id: new ObjectId(id),
      storyId: storyId
    });
    
    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }
    
    return NextResponse.json(character);
  } catch (error) {
    console.error('Error fetching character:', error);
    return NextResponse.json({ error: 'Failed to fetch character' }, { status: 500 });
  }
}

// PUT to update a character
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
    
    // Check if the character exists
    const existingCharacter = await userDb.collection('characters').findOne({ 
      _id: new ObjectId(id),
      storyId: storyId
    });
    
    if (!existingCharacter) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json({ error: 'Character name is required' }, { status: 400 });
    }
    
    // Prepare the update data
    const updateData = {
      name: data.name,
      full_name: data.full_name || null,
      type: data.type || existingCharacter.type,
      status: data.status || existingCharacter.status,
      description: data.description || existingCharacter.description,
      physical_appearance: data.physical_appearance || existingCharacter.physical_appearance,
      personality: data.personality || existingCharacter.personality,
      background: data.background || existingCharacter.background,
      relationships: data.relationships || existingCharacter.relationships,
      story_role: data.story_role || existingCharacter.story_role,
      updatedAt: new Date()
    };
    
    // Update the character
    const result = await userDb.collection('characters').updateOne(
      { _id: new ObjectId(id), storyId: storyId },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }
    
    // Return the updated character
    const updatedCharacter = await userDb.collection('characters').findOne({
      _id: new ObjectId(id),
      storyId: storyId
    });
    
    return NextResponse.json(updatedCharacter);
  } catch (error) {
    console.error('Error updating character:', error);
    return NextResponse.json({ error: 'Failed to update character' }, { status: 500 });
  }
}

// DELETE a character
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
    const storyId = params.storyId;
    const id = params.id;
    
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
    
    // Find the character to confirm it exists
    const character = await userDb.collection('characters').findOne({ 
      _id: new ObjectId(id),
      storyId: storyId
    });
    
    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }
    
    // Delete the character
    await userDb.collection('characters').deleteOne({ 
      _id: new ObjectId(id),
      storyId: storyId
    });
    
    // Update character relationships that reference this character
    const relationshipPull: PullOperator = {
      $pull: {
        relationships: {
          character_id: id
        }
      }
    };
    
    await userDb.collection('characters').updateMany(
      { storyId: storyId },
      relationshipPull
    );
    
    // Also remove this character from any timeline events
    const characterInvolvedPull: PullOperator = {
      $pull: {
        characters_involved: {
          id: id
        }
      }
    };
    
    await userDb.collection('events').updateMany(
      { storyId: storyId },
      characterInvolvedPull
    );
    
    return NextResponse.json({ success: true, message: 'Character deleted successfully' });
  } catch (error) {
    console.error('Error deleting character:', error);
    return NextResponse.json({ error: 'Failed to delete character' }, { status: 500 });
  }
}