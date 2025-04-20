import React from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getUserDb } from '@/lib/user-db';
import { ObjectId } from 'mongodb';
import StoryEditorClient from './client';

interface StoryData {
  _id: string;
  title: string;
  description?: string;
  genre?: string;
  setting?: string;
  themes?: string[];
}

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

export default async function StoryEditorPage({ params }: { params: { storyId: string } }) {
  // Check for authentication
  const session = await getServerSession(authOptions);
  
  // Redirect to login if no session
  if (!session || !session.user) {
    redirect('/api/auth/signin');
  }
  
  const { storyId } = params;
  
  // Validate story ID
  if (!storyId || !ObjectId.isValid(storyId)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-500/20 text-red-300 border border-red-500 p-4 rounded-lg">
          <h2 className="text-xl font-bold">Invalid Story ID</h2>
          <p>The provided story ID is not valid.</p>
        </div>
      </div>
    );
  }
  
  try {
    // Get user's database
    const db = await getUserDb(session.user.email as string);
    
    // Check if story exists and belongs to user
    const story: StoryData | null = await db.collection('stories').findOne({
      _id: new ObjectId(storyId)
    }) as unknown as StoryData | null;
    
    if (!story) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-500/20 text-red-300 border border-red-500 p-4 rounded-lg">
            <h2 className="text-xl font-bold">Story Not Found</h2>
            <p>The requested story was not found or you don't have access to it.</p>
          </div>
        </div>
      );
    }
    
    // Get story content
    const content: StoryContent | null = await db.collection('storyContent').findOne({
      storyId: storyId
    }) as unknown as StoryContent | null;
    
    // Prepare default content if none exists
    const initialSections = content?.sections || [
      {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        title: 'Chapter 1',
        content: '',
        type: 'chapter'
      }
    ];
    
    // Prepare initial metadata
    const initialMetadata = content?.metadata || {
      title: story.title,
      genre: story.genre,
      setting: story.setting,
      themes: story.themes
    };
    
    return (
      <div className="container mx-auto py-4 px-4 max-w-full">
        <StoryEditorClient
          storyId={storyId}
          initialSections={initialSections}
          initialMetadata={initialMetadata}
        />
      </div>
    );
  } catch (error) {
    console.error('Error loading story editor:', error);
    
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-500/20 text-red-300 border border-red-500 p-4 rounded-lg">
          <h2 className="text-xl font-bold">Error Loading Editor</h2>
          <p>There was an error loading the story editor. Please try again later.</p>
          <p className="text-sm mt-2">Error details: {error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    );
  }
}
