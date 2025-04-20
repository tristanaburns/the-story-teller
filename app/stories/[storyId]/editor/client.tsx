'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Save, Clock } from 'lucide-react';
import Link from 'next/link';
import StoryEditor from '@/components/editor/StoryEditor';

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

interface StoryEditorClientProps {
  storyId: string;
  initialSections: ContentSection[];
  initialMetadata: StoryMetadata;
}

export default function StoryEditorClient({
  storyId,
  initialSections,
  initialMetadata
}: StoryEditorClientProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Save content to the server
  const handleSave = async (sections: ContentSection[], metadata: StoryMetadata) => {
    setIsSaving(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/stories/${storyId}/content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sections, metadata }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save content');
      }
      
      const result = await response.json();
      setLastSaved(new Date());
      
      // Update document title
      if (metadata.title) {
        document.title = `Editing: ${metadata.title} | The Story Teller`;
      }
      
      return result;
    } catch (err) {
      console.error('Error saving content:', err);
      setError(err instanceof Error ? err.message : 'Failed to save content');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle errors
  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };
  
  return (
    <div className="flex flex-col h-screen -mt-4 -ml-4 -mr-4">
      {/* Header Bar */}
      <div className="bg-gray-900 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center">
          <Link
            href={`/stories/${storyId}`}
            className="flex items-center text-gray-300 hover:text-white mr-4"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            <span>Back to Story</span>
          </Link>
          
          <h1 className="text-xl font-bold text-white truncate">
            {initialMetadata.title || 'Untitled Story'}
          </h1>
        </div>
        
        <div className="flex items-center text-sm">
          {lastSaved && (
            <div className="flex items-center text-gray-400 mr-4">
              <Clock className="h-4 w-4 mr-1" />
              <span>Last saved {lastSaved.toLocaleTimeString()}</span>
            </div>
          )}
          
          {isSaving && (
            <div className="flex items-center text-blue-400 mr-4">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-1"></div>
              <span>Saving...</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 text-red-300 border border-red-500 p-3 mx-4 mt-4 rounded-lg">
          <h3 className="font-bold">Error</h3>
          <p>{error}</p>
        </div>
      )}
      
      {/* Editor */}
      <div className="flex-grow overflow-hidden p-4">
        <StoryEditor
          storyId={storyId}
          initialSections={initialSections}
          initialMetadata={initialMetadata}
          onSave={handleSave}
          onError={handleError}
        />
      </div>
    </div>
  );
}
