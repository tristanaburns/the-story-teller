'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import CharacterForm from '@/components/characters/CharacterForm';

interface Character {
  _id?: string;
  id?: string;
  storyId: string;
  name: string;
  // ... other character properties
}

interface RelatedCharacter {
  _id: string;
  id: string;
  name: string;
}

interface Story {
  _id: string;
  title: string;
}

export default function NewCharacterPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [story, setStory] = useState<Story | null>(null);
  const [relatedCharacters, setRelatedCharacters] = useState<RelatedCharacter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to signin if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }

    // Fetch data when authenticated
    if (status === 'authenticated' && params.id) {
      fetchStory();
      fetchCharacters();
    }
  }, [status, params.id, router]);

  const fetchStory = async () => {
    try {
      const response = await fetch(`/api/stories/${params.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch story');
      }
      
      const data = await response.json();
      setStory(data);
    } catch (error) {
      console.error('Error fetching story:', error);
      setError('Failed to load story information.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCharacters = async () => {
    try {
      const response = await fetch(`/api/stories/${params.id}/characters`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch characters');
      }
      
      const data = await response.json();
      
      // Format characters for relationship selection
      setRelatedCharacters(data.map((char: any) => ({
        _id: char._id,
        id: char.id,
        name: char.name
      })));
      
    } catch (error) {
      console.error('Error fetching characters:', error);
      // We can continue without this data, as it's only needed for relationships
    }
  };

  const handleSubmit = async (characterData: Character) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const response = await fetch(`/api/stories/${params.id}/characters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(characterData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create character');
      }

      const newCharacter = await response.json();
      router.push(`/stories/${params.id}/characters`);
      
    } catch (error: any) {
      console.error('Error creating character:', error);
      setError(error.message || 'An error occurred while creating the character');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error && !story) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-500/20 border border-red-500/50 text-white p-4 rounded-lg mb-8">
          {error}
          <button 
            onClick={() => router.push('/dashboard')} 
            className="ml-4 underline text-red-200 hover:text-white"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <Link href="/dashboard" className="hover:text-white">
            Dashboard
          </Link>
          <span>›</span>
          <Link href={`/stories/${params.id}`} className="hover:text-white">
            {story?.title || 'Story'}
          </Link>
          <span>›</span>
          <Link href={`/stories/${params.id}/characters`} className="hover:text-white">
            Characters
          </Link>
          <span>›</span>
          <span className="text-gray-300">New</span>
        </div>
        
        <h1 className="text-3xl font-bold text-white">Create New Character</h1>
        <p className="text-gray-400 mt-1">
          Add a character to {story?.title || 'your story'}
        </p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-white p-4 rounded-lg mb-8">
          {error}
        </div>
      )}

      <CharacterForm 
        storyId={params.id}
        relatedCharacters={relatedCharacters}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
    </div>
  );
}