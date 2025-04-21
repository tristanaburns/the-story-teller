import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
import { getUserDb } from '@/lib/user-db';

// GET a single location by ID
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
    const locationId = params.id[1];
    
    // Validate the IDs
    if (!ObjectId.isValid(storyId) || !ObjectId.isValid(locationId)) {
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
    
    // Find the location by ID
    const location = await userDb.collection('locations').findOne({ 
      _id: new ObjectId(locationId),
      storyId: storyId
    });
    
    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }
    
    return NextResponse.json(location);
  } catch (error) {
    console.error('Error fetching location:', error);
    return NextResponse.json({ error: 'Failed to fetch location' }, { status: 500 });
  }
}

// PUT to update a location
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
    const locationId = params.id[1];
    
    // Validate the IDs
    if (!ObjectId.isValid(storyId) || !ObjectId.isValid(locationId)) {
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
    
    // Check if the location exists
    const existingLocation = await userDb.collection('locations').findOne({ 
      _id: new ObjectId(locationId),
      storyId: storyId
    });
    
    if (!existingLocation) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json({ error: 'Location name is required' }, { status: 400 });
    }
    
    // Prepare the update data
    const updateData = {
      name: data.name,
      type: data.type || existingLocation.type,
      description: data.description || existingLocation.description,
      physical_features: data.physical_features || existingLocation.physical_features,
      cultural_notes: data.cultural_notes || existingLocation.cultural_notes,
      historical_notes: data.historical_notes || existingLocation.historical_notes,
      significance_to_plot: data.significance_to_plot || existingLocation.significance_to_plot,
      parent_location: data.parent_location || existingLocation.parent_location,
      updatedAt: new Date()
    };
    
    // Update the location
    const result = await userDb.collection('locations').updateOne(
      { _id: new ObjectId(locationId), storyId: storyId },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }
    
    // Return the updated location
    const updatedLocation = await userDb.collection('locations').findOne({
      _id: new ObjectId(locationId),
      storyId: storyId
    });
    
    return NextResponse.json(updatedLocation);
  } catch (error) {
    console.error('Error updating location:', error);
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
  }
}

// DELETE a location
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
    const locationId = params.id[1];
    
    // Validate the IDs
    if (!ObjectId.isValid(storyId) || !ObjectId.isValid(locationId)) {
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
    
    // Find the location to confirm it exists
    const location = await userDb.collection('locations').findOne({ 
      _id: new ObjectId(locationId),
      storyId: storyId
    });
    
    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }
    
    // Delete the location
    await userDb.collection('locations').deleteOne({ 
      _id: new ObjectId(locationId),
      storyId: storyId
    });
    
    // Also remove this location from any timeline events
    const locationInvolvedPull = { 
      $pull: { 
        locations_involved: location.id 
      } 
    };
    
    await userDb.collection('events').updateMany(
      { storyId: storyId },
      locationInvolvedPull
    );
    
    return NextResponse.json({ success: true, message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Error deleting location:', error);
    return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 });
  }
} 