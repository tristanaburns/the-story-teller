import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import CharacterForm from '@/components/characters/CharacterForm';
import { Character, Story, RelatedCharacter } from '@/types/models';

export default function EditCharacterPage({ params }: { params: { id: string[] } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [character, setCharacter] = useState<Character | null>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [relatedCharacters, setRelatedCharacters] = useState<RelatedCharacter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      fetchCharacters();
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

  const fetchCharacters = async () => {
    try {
      const response = await fetch(`/api/stories/${storyId}/characters`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch characters');
      }
      
      const data = await response.json();
      
      // Filter out the current character from related characters
      const filteredCharacters = data.filter((char: Character) => 
        char._id !== characterId
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
  };

  const handleSubmit = async (characterData: Character) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const response = await fetch(`/api/stories/${storyId}/characters/${characterId}`, {
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

      router.push(`/stories/${storyId}/characters/${characterId}`);
    } catch (error: unknown) {
      console.error('Error updating character:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while updating the character');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <Link href={`/stories/${storyId}/characters/${characterId}`} className="hover:text-white">
            {character?.name}
          </Link>
          <span>›</span>
          <span className="text-gray-300">Edit</span>
        </div>
        
        <h1 className="text-3xl font-bold text-white">Edit Character</h1>
        <p className="text-gray-400 mt-1">
          Update character details for {character?.name}
        </p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-white p-4 rounded-lg mb-8">
          {error}
        </div>
      )}

      {character && (
        <CharacterForm 
          storyId={storyId}
          character={character}
          relatedCharacters={relatedCharacters}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
} 