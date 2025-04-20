'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

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

interface RelatedCharacter {
  id: string;
  name: string;
}

interface Story {
  _id: string;
  title: string;
}

export default function CharacterDetailPage({ params }: { params: { id: string; characterId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [character, setCharacter] = useState<Character | null>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [relatedCharacters, setRelatedCharacters] = useState<{ [key: string]: RelatedCharacter }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Redirect to signin if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }

    // Fetch data when authenticated
    if (status === 'authenticated' && params.id && params.characterId) {
      fetchStory();
      fetchCharacter();
      fetchAllCharacters();
    }
  }, [status, params.id, params.characterId, router]);

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

  const fetchCharacter = async () => {
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
  };

  const fetchAllCharacters = async () => {
    try {
      const response = await fetch(`/api/stories/${params.id}/characters`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch characters');
      }
      
      const data = await response.json();
      
      // Create a lookup map for character names by ID
      const characterMap: { [key: string]: RelatedCharacter } = {};
      data.forEach((char: Character) => {
        characterMap[char.id] = { id: char.id, name: char.name };
      });
      
      setRelatedCharacters(characterMap);
    } catch (error) {
      console.error('Error fetching characters:', error);
      // We can continue without this data, as it's only needed for displaying relationship names
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/stories/${params.id}/characters/${params.characterId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete character');
      }
      
      router.push(`/stories/${params.id}/characters`);
    } catch (error) {
      console.error('Error deleting character:', error);
      setError('Failed to delete character.');
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Generate avatar background color based on name hash
  const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    const saturation = 60 + (hash % 20);
    const lightness = 35 + (hash % 10);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const statusColors = {
    alive: 'bg-green-700/50 text-green-200',
    deceased: 'bg-red-700/50 text-red-200',
    unknown: 'bg-gray-700/50 text-gray-200',
  };

  const typeColors = {
    protagonist: 'bg-blue-700/50 text-blue-200',
    antagonist: 'bg-purple-700/50 text-purple-200',
    supporting: 'bg-amber-700/50 text-amber-200',
    minor: 'bg-gray-700/50 text-gray-200',
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
          <span className="text-gray-300">{character.name}</span>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <h1 className="text-3xl font-bold text-white">{character.name}</h1>
          
          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-4 py-2 bg-red-600/70 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 font-medium"
            >
              Delete
            </button>
            
            <Link
              href={`/stories/${params.id}/characters/${params.characterId}/edit`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
            >
              Edit Character
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-white p-4 rounded-lg mb-8">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-gray-800/40 rounded-xl p-6">
            <div className="flex items-start mb-6">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mr-4 flex-shrink-0" 
                style={{ backgroundColor: getAvatarColor(character.name) }}
              >
                {getInitials(character.name)}
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-white">{character.name}</h2>
                {character.full_name && character.full_name !== character.name && (
                  <p className="text-gray-300">{character.full_name}</p>
                )}
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {character.type && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${typeColors[character.type] || 'bg-gray-700/50 text-gray-200'}`}>
                      {character.type.charAt(0).toUpperCase() + character.type.slice(1)}
                    </span>
                  )}
                  {character.status && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[character.status] || 'bg-gray-700/50 text-gray-200'}`}>
                      {character.status.charAt(0).toUpperCase() + character.status.slice(1)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {character.description && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">Description</h3>
                <p className="text-gray-300">{character.description}</p>
              </div>
            )}
            
            {character.story_role && (
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Role in Story</h3>
                <p className="text-gray-300">{character.story_role}</p>
              </div>
            )}
          </div>
          
          {character.physical_appearance && (
            <div className="bg-gray-800/40 rounded-xl p-6">
              <h3 className="text-lg font-medium text-white mb-4">Physical Appearance</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {character.physical_appearance.height && (
                  <div>
                    <span className="text-gray-400 text-sm">Height</span>
                    <p className="text-white">{character.physical_appearance.height}</p>
                  </div>
                )}
                
                {character.physical_appearance.build && (
                  <div>
                    <span className="text-gray-400 text-sm">Build</span>
                    <p className="text-white">{character.physical_appearance.build}</p>
                  </div>
                )}
              </div>
              
              {character.physical_appearance.distinctive_features && character.physical_appearance.distinctive_features.length > 0 && (
                <div className="mb-4">
                  <span className="text-gray-400 text-sm">Distinctive Features</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {character.physical_appearance.distinctive_features.map((feature, index) => (
                      <span key={index} className="bg-gray-700/50 text-white px-2 py-1 rounded text-sm">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {character.physical_appearance.typical_attire && (
                <div>
                  <span className="text-gray-400 text-sm">Typical Attire</span>
                  <p className="text-white">{character.physical_appearance.typical_attire}</p>
                </div>
              )}
            </div>
          )}
          
          {character.personality && (
            <div className="bg-gray-800/40 rounded-xl p-6">
              <h3 className="text-lg font-medium text-white mb-4">Personality</h3>
              
              {character.personality.traits && character.personality.traits.length > 0 && (
                <div className="mb-4">
                  <span className="text-gray-400 text-sm">Personality Traits</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {character.personality.traits.map((trait, index) => (
                      <span key={index} className="bg-blue-700/30 text-blue-100 px-2 py-1 rounded text-sm">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {character.personality.values && character.personality.values.length > 0 && (
                <div className="mb-4">
                  <span className="text-gray-400 text-sm">Values</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {character.personality.values.map((value, index) => (
                      <span key={index} className="bg-purple-700/30 text-purple-100 px-2 py-1 rounded text-sm">
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {character.personality.motivations && character.personality.motivations.length > 0 && (
                <div>
                  <span className="text-gray-400 text-sm">Motivations</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {character.personality.motivations.map((motivation, index) => (
                      <span key={index} className="bg-amber-700/30 text-amber-100 px-2 py-1 rounded text-sm">
                        {motivation}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {character.background && (
            <div className="bg-gray-800/40 rounded-xl p-6">
              <h3 className="text-lg font-medium text-white mb-4">Background</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {character.background.birthplace && (
                  <div>
                    <span className="text-gray-400 text-sm">Birthplace</span>
                    <p className="text-white">{character.background.birthplace}</p>
                  </div>
                )}
                
                {character.background.occupation && (
                  <div>
                    <span className="text-gray-400 text-sm">Occupation</span>
                    <p className="text-white">{character.background.occupation}</p>
                  </div>
                )}
              </div>
              
              {character.background.significant_events && character.background.significant_events.length > 0 && (
                <div>
                  <span className="text-gray-400 text-sm">Significant Life Events</span>
                  <ul className="mt-2 space-y-2 list-disc list-inside">
                    {character.background.significant_events.map((event, index) => (
                      <li key={index} className="text-white">
                        {event}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-gray-800/40 rounded-xl p-6 sticky top-6">
            <h3 className="text-lg font-medium text-white mb-4">Relationships</h3>
            
            {character.relationships && character.relationships.length > 0 ? (
              <div className="space-y-4">
                {character.relationships.map((relationship, index) => {
                  const relatedChar = relatedCharacters[relationship.character_id];
                  return (
                    <div key={index} className="bg-gray-700/50 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="text-white font-medium">
                          {relatedChar?.name || 'Unknown Character'}
                        </div>
                        <span className="text-xs px-2 py-0.5 bg-gray-600 rounded-full capitalize">
                          {relationship.relationship_type}
                        </span>
                      </div>
                      {relationship.dynamics && (
                        <p className="text-gray-300 text-sm mt-1">
                          {relationship.dynamics}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>No relationships defined</p>
                <p className="text-sm mt-2">
                  Edit this character to add relationships.
                </p>
              </div>
            )}
            
            <div className="mt-6">
              <Link
                href={`/stories/${params.id}/characters`}
                className="block w-full text-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 text-sm"
              >
                Back to Characters
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">Delete Character</h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete <span className="font-semibold text-white">{character.name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2 inline-block"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}