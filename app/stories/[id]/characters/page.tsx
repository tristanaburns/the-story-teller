'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import CharactersGrid from '@/components/characters/CharactersGrid';
import CharacterRelationships from '@/components/characters/CharacterRelationships';

interface Character {
  _id: string;
  id: string;
  storyId: string;
  name: string;
  full_name?: string | null;
  type?: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  status?: 'alive' | 'deceased' | 'unknown';
  description?: string;
  physical_appearance?: {
    height?: string;
    build?: string;
    distinctive_features?: string[];
    typical_attire?: string;
  };
  personality?: {
    traits?: string[];
    values?: string[];
    motivations?: string[];
  };
  background?: {
    birthplace?: string;
    occupation?: string;
    significant_events?: string[];
  };
  relationships?: Array<{
    character_id: string;
    relationship_type: string;
    dynamics: string;
  }>;
  story_role?: string;
}

interface Story {
  _id: string;
  title: string;
}

interface Relationship {
  source: string;
  target: string;
  type: string;
  dynamics?: string;
}

export default function CharactersPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [story, setStory] = useState<Story | null>(null);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVisualization, setShowVisualization] = useState(false);

  useEffect(() => {
    // Redirect to signin if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }

    // Fetch data when authenticated
    if (status === 'authenticated' && params.id) {
      fetchCharacters();
      fetchStory();
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
    }
  };

  const fetchCharacters = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/stories/${params.id}/characters`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch characters');
      }
      
      const data = await response.json();
      setCharacters(data);
      
      // Process relationships for visualization
      const relationshipArray: Relationship[] = [];
      data.forEach((character: Character) => {
        if (character.relationships && character.relationships.length > 0) {
          character.relationships.forEach(rel => {
            relationshipArray.push({
              source: character.id,
              target: rel.character_id,
              type: rel.relationship_type,
              dynamics: rel.dynamics
            });
          });
        }
      });
      setRelationships(relationshipArray);
      
    } catch (error) {
      console.error('Error fetching characters:', error);
      setError('Failed to load characters. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCharacter = async (characterId: string) => {
    try {
      const response = await fetch(`/api/stories/${params.id}/characters/${characterId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete character');
      }
      
      // Remove the deleted character from the state
      setCharacters(prev => prev.filter(character => character._id !== characterId));
      
      // Update relationships array
      const deletedCharacter = characters.find(c => c._id === characterId);
      if (deletedCharacter) {
        setRelationships(prev => prev.filter(rel => 
          rel.source !== deletedCharacter.id && rel.target !== deletedCharacter.id
        ));
      }
      
    } catch (error) {
      console.error('Error deleting character:', error);
      setError('Failed to delete character.');
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
          <span className="text-gray-300">Characters</span>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Characters</h1>
            <p className="text-gray-400 mt-1">
              Manage characters for {story?.title || 'your story'}
            </p>
          </div>
          
          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={() => setShowVisualization(!showVisualization)}
              className={`px-4 py-2 ${
                showVisualization 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'bg-gray-700 hover:bg-gray-600'
              } text-white rounded-lg transition-colors duration-200 font-medium flex items-center`}
            >
              {showVisualization ? 'Hide' : 'Show'} Relationship Map
            </button>
            
            <Link
              href={`/stories/${params.id}/characters/new`}
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Character
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-white p-4 rounded-lg mb-8">
          {error}
          <button 
            onClick={fetchCharacters} 
            className="ml-4 underline text-red-200 hover:text-white"
          >
            Try again
          </button>
        </div>
      )}
      
      {showVisualization && relationships.length > 0 && (
        <div className="mb-8">
          <CharacterRelationships 
            characters={characters.map(char => ({
              _id: char._id,
              id: char.id,
              name: char.name,
              type: char.type
            }))} 
            relationships={relationships}
          />
        </div>
      )}
      
      {showVisualization && relationships.length === 0 && (
        <div className="bg-gray-800/30 p-6 rounded-xl mb-8 text-center">
          <h3 className="text-lg font-medium text-white mb-2">No Character Relationships</h3>
          <p className="text-gray-400">
            Define relationships between characters to visualize their connections.
          </p>
        </div>
      )}

      <CharactersGrid 
        characters={characters}
        storyId={params.id}
        onDelete={handleDeleteCharacter}
      />
    </div>
  );
}