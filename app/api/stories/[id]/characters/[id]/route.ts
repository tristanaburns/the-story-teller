import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
import { getUserDb } from '@/lib/user-db';

// GET a single character by ID
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
    const characterId = params.id[1];
    
    // Validate the IDs
    if (!ObjectId.isValid(storyId) || !ObjectId.isValid(characterId)) {
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
      _id: new ObjectId(characterId),
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
    const characterId = params.id[1];
    
    // Validate the IDs
    if (!ObjectId.isValid(storyId) || !ObjectId.isValid(characterId)) {
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
      _id: new ObjectId(characterId),
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
      role: data.role || existingCharacter.role,
      description: data.description || existingCharacter.description,
      physical_traits: data.physical_traits || existingCharacter.physical_traits,
      personality: data.personality || existingCharacter.personality,
      background: data.background || existingCharacter.background,
      goals: data.goals || existingCharacter.goals,
      relationships: data.relationships || existingCharacter.relationships,
      updatedAt: new Date()
    };
    
    // Update the character
    const result = await userDb.collection('characters').updateOne(
      { _id: new ObjectId(characterId), storyId: storyId },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }
    
    // Return the updated character
    const updatedCharacter = await userDb.collection('characters').findOne({
      _id: new ObjectId(characterId),
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
    const characterId = params.id[1];
    
    // Validate the IDs
    if (!ObjectId.isValid(storyId) || !ObjectId.isValid(characterId)) {
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
      _id: new ObjectId(characterId),
      storyId: storyId
    });
    
    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }
    
    // Delete the character
    await userDb.collection('characters').deleteOne({ 
      _id: new ObjectId(characterId),
      storyId: storyId
    });
    
    // Update any events that reference this character
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateQuery = { 
      $pull: { 
        characters_involved: { 
          id: characterId 
        } 
      } 
    };
    
    await userDb.collection('events').updateMany(
      { storyId: storyId, 'characters_involved.id': characterId },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateQuery as any
    );
    
    return NextResponse.json({ success: true, message: 'Character deleted successfully' });
  } catch (error) {
    console.error('Error deleting character:', error);
    return NextResponse.json({ error: 'Failed to delete character' }, { status: 500 });
  }
} 