'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Character, Story, RelatedCharacter } from '@/types';

export default function CharacterPage({ params }: { params: { id: string[] } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [character, setCharacter] = useState<Character | null>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [allCharacters, setAllCharacters] = useState<RelatedCharacter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Extract storyId and characterId from the params
  const storyId = params.id[0];
  const characterId = params.id[1];

  useEffect(() => {
    // Redirect to signin if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }

    // Fetch data when authenticated
    if (status === 'authenticated' && storyId && characterId) {
      fetchStory();
      fetchCharacter();
      fetchAllCharacters();
    }
  }, [status, storyId, characterId, router]);

  const fetchStory = async () => {
    try {
      const response = await fetch(`/api/stories/${storyId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch story');
      }
      
      const data = await response.json();
      setStory(data);
    } catch (error) {
      console.error('Error fetching story:', error);
      setError('Failed to load story information.');
    }
  };

  const fetchCharacter = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/stories/${storyId}/characters/${characterId}`);
      
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
  };

  const fetchAllCharacters = async () => {
    try {
      const response = await fetch(`/api/stories/${storyId}/characters`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch characters');
      }
      
      const data = await response.json();
      
      // Filter out the current character and map to simplified format
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filteredCharacters = data
        .filter((char: any) => char._id !== characterId)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((char: any) => ({
          _id: char._id,
          id: char.id,
          name: char.name
        }));
      
      setAllCharacters(filteredCharacters);
    } catch (error) {
      console.error('Error fetching characters:', error);
      // Non-critical, so we don't set the error state
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/stories/${storyId}/characters/${characterId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete character');
      }
      
      router.push(`/stories/${storyId}/characters`);
    } catch (error) {
      console.error('Error deleting character:', error);
      setError('Failed to delete character.');
      setIsDeleteModalOpen(false);
    }
  };
  
  // ... rest of component ...
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <Link href="/dashboard" className="hover:text-white">
            Dashboard
          </Link>
          <span>›</span>
          <Link href={`/stories/${storyId}`} className="hover:text-white">
            {story?.title || 'Story'}
          </Link>
          <span>›</span>
          <Link href={`/stories/${storyId}/characters`} className="hover:text-white">
            Characters
          </Link>
          <span>›</span>
          <span className="text-gray-300">{character?.name || 'Character'}</span>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <h1 className="text-3xl font-bold text-white">{character?.name || 'Character Details'}</h1>
          
          <div className="flex gap-3 mt-4 md:mt-0">
            <Link
              href={`/stories/${storyId}/characters/${characterId}/edit`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit
            </Link>
            
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 font-medium flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>
      
      {/* ... rest of component ... */}
    </div>
  );
} 