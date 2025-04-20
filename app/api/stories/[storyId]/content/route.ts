import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getUserDb } from '@/lib/user-db';
import { ObjectId } from 'mongodb';

// Define interfaces for the request and response
interface ContentSection {
  id: string;
  title: string;
  content: string;
  type: 'chapter' | 'scene' | 'note' | 'description';
  metadata?: {
    [key: string]: any;
  };
}

interface StoryMetadata {
  title: string;
  genre?: string;
  setting?: string;
  themes?: string[];
  timeframe?: string;
  pov?: 'first_person' | 'second_person' | 'third_person_limited' | 'third_person_omniscient';
  [key: string]: any;
}

interface StoryContent {
  sections: ContentSection[];
  metadata: StoryMetadata;
  lastUpdated: Date;
  version: number;
}

// GET route - Retrieve story content
export async function GET(
  request: NextRequest,
  { params }: { params: { storyId: string } }
) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get story ID from params
    const { storyId } = params;
    
    // Get version from query params if it exists
    const { searchParams } = new URL(request.url);
    const version = searchParams.get('version');
    
    // Validate story ID
    if (!storyId || !ObjectId.isValid(storyId)) {
      return NextResponse.json({ error: 'Invalid story ID' }, { status: 400 });
    }
    
    // Get user's database
    const db = await getUserDb(session.user.email as string);
    
    // Check if story exists and belongs to user
    const story = await db.collection('stories').findOne({
      _id: new ObjectId(storyId)
    });
    
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    
    // If version is specified, get that specific version from history
    if (version) {
      const versionNumber = parseInt(version, 10);
      
      if (isNaN(versionNumber)) {
        return NextResponse.json({ error: 'Invalid version number' }, { status: 400 });
      }
      
      // If requesting the latest version
      if (versionNumber === story.contentVersion) {
        const content = await db.collection('storyContent').findOne({
          storyId: new ObjectId(storyId)
        });
        
        if (!content) {
          return NextResponse.json({ error: 'Content not found' }, { status: 404 });
        }
        
        return NextResponse.json(content);
      }
      
      // Get historical version
      const historicalContent = await db.collection('storyContentHistory').findOne({
        storyId: new ObjectId(storyId),
        version: versionNumber
      });
      
      if (!historicalContent) {
        return NextResponse.json({ error: 'Version not found' }, { status: 404 });
      }
      
      return NextResponse.json(historicalContent);
    } else {
      // No version specified, get current content
      // Get story content
      const content = await db.collection('storyContent').findOne({
        storyId: new ObjectId(storyId)
      });
      
      // If no content exists yet, return default empty content
      if (!content) {
        const defaultContent: StoryContent = {
          sections: [
            {
              id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
              title: 'Chapter 1',
              content: '',
              type: 'chapter'
            }
          ],
          metadata: {
            title: story.title || 'Untitled Story'
          },
          lastUpdated: new Date(),
          version: 1
        };
        
        return NextResponse.json(defaultContent);
      }
      
      // Return the story content
      return NextResponse.json(content);
    }
  } catch (error) {
    console.error('Error retrieving story content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST route - Save story content
export async function POST(
  request: NextRequest,
  { params }: { params: { storyId: string } }
) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get story ID from params
    const { storyId } = params;
    
    // Validate story ID
    if (!storyId || !ObjectId.isValid(storyId)) {
      return NextResponse.json({ error: 'Invalid story ID' }, { status: 400 });
    }
    
    // Parse request body
    const { sections, metadata } = await request.json();
    
    // Validate request data
    if (!sections || !Array.isArray(sections)) {
      return NextResponse.json({ error: 'Invalid content sections' }, { status: 400 });
    }
    
    if (!metadata || typeof metadata !== 'object') {
      return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 });
    }
    
    // Get user's database
    const db = await getUserDb(session.user.email as string);
    
    // Check if story exists and belongs to user
    const story = await db.collection('stories').findOne({
      _id: new ObjectId(storyId)
    });
    
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    
    // Get existing content to determine version
    const existingContent = await db.collection('storyContent').findOne({
      storyId: new ObjectId(storyId)
    });
    
    const newVersion = existingContent ? existingContent.version + 1 : 1;
    
    // Prepare content object
    const contentToSave: StoryContent = {
      sections,
      metadata,
      lastUpdated: new Date(),
      version: newVersion
    };
    
    // Insert or update content in database
    if (existingContent) {
      // Save previous version to history
      await db.collection('storyContentHistory').insertOne({
        storyId: new ObjectId(storyId),
        sections: existingContent.sections,
        metadata: existingContent.metadata,
        savedAt: existingContent.lastUpdated,
        version: existingContent.version
      });
      
      // Update current content
      await db.collection('storyContent').updateOne(
        { storyId: new ObjectId(storyId) },
        { $set: contentToSave }
      );
    } else {
      // Insert new content
      await db.collection('storyContent').insertOne({
        storyId: new ObjectId(storyId),
        ...contentToSave
      });
    }
    
    // Update story metadata in stories collection
    await db.collection('stories').updateOne(
      { _id: new ObjectId(storyId) },
      { 
        $set: { 
          title: metadata.title,
          updatedAt: new Date(),
          contentLastUpdated: new Date(),
          contentVersion: newVersion,
          genre: metadata.genre || story.genre,
          setting: metadata.setting || story.setting,
          themes: metadata.themes || story.themes
        } 
      }
    );
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Content saved successfully',
      version: newVersion,
      lastUpdated: contentToSave.lastUpdated
    });
  } catch (error) {
    console.error('Error saving story content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
