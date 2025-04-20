'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import CharacterForm from '@/components/characters/CharacterForm';
import { Character, Story, RelatedCharacter } from '@/types';

export default function EditCharacterPage({ params }: { params: { id: string; characterId: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [story, setStory] = useState<Story | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [relatedCharacters, setRelatedCharacters] = useState<RelatedCharacter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStory = useCallback(async () => {
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
    }
  }, [params.id]);

  const fetchCharacter = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/stories/${params.id}/characters/${params.characterId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch character');
      }
      
      const data = await response.json();
      setCharacter(data);
    } catch (error) {
      console.error('Error fetching character:', error);
      setError('Failed to load character. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [params.id, params.characterId]);

  const fetchCharacters = useCallback(async () => {
    try {
      const response = await fetch(`/api/stories/${params.id}/characters`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch characters');
      }
      
      const data = await response.json();
      
      // Filter out the current character from related characters
      const filteredCharacters = data.filter((char: Character) => 
        char._id !== params.characterId
      ).map((char: Character) => ({
        _id: char._id,
        id: char.id,
        name: char.name
      }));
      
      setRelatedCharacters(filteredCharacters);
    } catch (error) {
      console.error('Error fetching characters:', error);
      // We can continue without this data, as it's only needed for relationships
    }
  }, [params.id, params.characterId]);

  useEffect(() => {
    // Redirect to signin if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }

    // Fetch data when authenticated
    if (status === 'authenticated' && params.id && params.characterId) {
      fetchStory();
      fetchCharacter();
      fetchCharacters();
    }
  }, [status, params.id, params.characterId, router, fetchStory, fetchCharacter, fetchCharacters]);

  const handleSubmit = async (characterData: Character) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const response = await fetch(`/api/stories/${params.id}/characters/${params.characterId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(characterData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update character');
      }

      router.push(`/stories/${params.id}/characters/${params.characterId}`);
    } catch (error: unknown) {
      console.error('Error updating character:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while updating the character');
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

  if (error && !character) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-500/20 border border-red-500/50 text-white p-4 rounded-lg mb-8">
          {error}
          <button 
            onClick={() => router.push(`/stories/${params.id}/characters`)} 
            className="ml-4 underline text-red-200 hover:text-white"
          >
            Return to Characters
          </button>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-500/20 border border-yellow-500/50 text-white p-4 rounded-lg mb-8">
          Character not found
          <button 
            onClick={() => router.push(`/stories/${params.id}/characters`)} 
            className="ml-4 underline text-yellow-200 hover:text-white"
          >
            Return to Characters
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
          <Link href={`/stories/${params.id}/characters/${params.characterId}`} className="hover:text-white">
            {character.name}
          </Link>
          <span>›</span>
          <span className="text-gray-300">Edit</span>
        </div>
        
        <h1 className="text-3xl font-bold text-white">Edit Character</h1>
        <p className="text-gray-400 mt-1">
          Update character details for {character.name}
        </p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-white p-4 rounded-lg mb-8">
          {error}
        </div>
      )}

      <CharacterForm 
        storyId={params.id}
        character={character}
        relatedCharacters={relatedCharacters}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
    </div>
  );
}