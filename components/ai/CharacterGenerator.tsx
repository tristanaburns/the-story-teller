'use client';

import React, { useState } from 'react';
import { Wand2, PlusCircle, AlertCircle, Loader2 } from 'lucide-react';

interface Character {
  _id?: string;
  storyId: string;
  name: string;
  full_name?: string;
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

interface GeneratedCharacter extends Omit<Character, '_id' | 'storyId' | 'relationships'> {
  storyId?: string;
  relationships?: Array<{
    character_name: string;
    relationship_type: string;
    dynamics: string;
  }>;
}

interface CharacterGeneratorProps {
  storyId: string;
  storyGenre?: string;
  storySetting?: string;
  storyThemes?: string[];
  existingCharacters?: Character[];
  onSelectCharacter: (character: Character) => void;
}

export default function CharacterGenerator({
  storyId,
  storyGenre = '',
  storySetting = '',
  storyThemes = [],
  existingCharacters = [],
  onSelectCharacter
}: CharacterGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedCharacters, setGeneratedCharacters] = useState<GeneratedCharacter[]>([]);
  const [characterType, setCharacterType] = useState<'protagonist' | 'antagonist' | 'supporting' | 'minor'>('supporting');
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);

  // Function to generate characters
  const generateCharacters = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const existingCharacterNames = existingCharacters.map(char => char.name);
      const themesString = storyThemes.join(', ');
      
      const prompt = showCustomPrompt && customPrompt
        ? customPrompt
        : `Generate 3 unique ${characterType} characters for a ${storyGenre} story set in ${storySetting}${
            themesString ? ` with themes of ${themesString}` : ''
          }.${
            existingCharacterNames.length > 0
              ? ` The story already has these characters: ${existingCharacterNames.join(', ')}.`
              : ''
          } Make the characters interesting, complex, and suitable for the story context.`;
      
      const response = await fetch('/api/ai/generate-characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          storyId,
          existingCharacters: existingCharacters.map(char => ({
            name: char.name,
            type: char.type,
            story_role: char.story_role
          })),
          characterType,
          count: 3
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate characters');
      }
      
      const data = await response.json();
      setGeneratedCharacters(data.characters);
    } catch (err) {
      console.error('Error generating characters:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Function to transform a generated character to the format expected by the form
  const transformCharacter = (character: GeneratedCharacter): Character => {
    // Convert character_name to character_id for relationships
    const relationships = character.relationships?.map(rel => {
      // Try to find an existing character with this name
      const existingChar = existingCharacters.find(
        c => c.name.toLowerCase() === rel.character_name.toLowerCase()
      );
      
      return {
        character_id: existingChar?._id || '', // Empty if no match
        relationship_type: rel.relationship_type,
        dynamics: rel.dynamics
      };
    }) || [];
    
    // Remove relationships to non-existent characters
    const validRelationships = relationships.filter(rel => rel.character_id);
    
    return {
      ...character,
      storyId,
      relationships: validRelationships
    };
  };

  // Handle character selection
  const handleSelectCharacter = (character: GeneratedCharacter) => {
    const transformedCharacter = transformCharacter(character);
    onSelectCharacter(transformedCharacter);
  };

  return (
    <div className="bg-gray-800/40 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Wand2 className="mr-2 h-5 w-5 text-purple-400" />
          AI Character Generator
        </h2>
        <p className="text-gray-400 mt-1">
          Generate unique characters that fit your story's setting and themes.
        </p>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-300">
            Character Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => setCharacterType('protagonist')}
              className={`p-3 rounded-lg text-center ${
                characterType === 'protagonist'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Protagonist
            </button>
            <button
              type="button"
              onClick={() => setCharacterType('antagonist')}
              className={`p-3 rounded-lg text-center ${
                characterType === 'antagonist'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Antagonist
            </button>
            <button
              type="button"
              onClick={() => setCharacterType('supporting')}
              className={`p-3 rounded-lg text-center ${
                characterType === 'supporting'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Supporting
            </button>
            <button
              type="button"
              onClick={() => setCharacterType('minor')}
              className={`p-3 rounded-lg text-center ${
                characterType === 'minor'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Minor
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-300">
              Story Context
            </label>
            <button
              type="button"
              onClick={() => setShowCustomPrompt(!showCustomPrompt)}
              className="text-blue-400 text-sm hover:underline"
            >
              {showCustomPrompt ? 'Use Default Prompt' : 'Customize Prompt'}
            </button>
          </div>
          
          {showCustomPrompt ? (
            <div>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={4}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="Describe the type of character you want to generate. Be as specific as possible about personality, appearance, and role in your story."
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-gray-700/50 p-3 rounded-lg">
                <span className="text-gray-400 text-sm">Genre:</span>
                <p className="text-white">
                  {storyGenre || 'Not specified'}
                </p>
              </div>
              <div className="bg-gray-700/50 p-3 rounded-lg">
                <span className="text-gray-400 text-sm">Setting:</span>
                <p className="text-white">
                  {storySetting || 'Not specified'}
                </p>
              </div>
              <div className="bg-gray-700/50 p-3 rounded-lg">
                <span className="text-gray-400 text-sm">Themes:</span>
                <p className="text-white">
                  {storyThemes.length > 0
                    ? storyThemes.join(', ')
                    : 'Not specified'}
                </p>
              </div>
            </div>
          )}
        </div>
        
        {existingCharacters.length > 0 && (
          <div className="mb-6 bg-gray-700/30 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-300 mb-3">
              Existing Characters ({existingCharacters.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {existingCharacters.map(character => (
                <span
                  key={character._id}
                  className={`px-2 py-1 rounded-md text-xs ${
                    character.type === 'protagonist'
                      ? 'bg-blue-500/20 text-blue-300'
                      : character.type === 'antagonist'
                      ? 'bg-red-500/20 text-red-300'
                      : character.type === 'supporting'
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-yellow-500/20 text-yellow-300'
                  }`}
                >
                  {character.name}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-center">
          <button
            type="button"
            onClick={generateCharacters}
            disabled={loading}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 font-medium flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-5 w-5" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-5 w-5" />
                Generate Characters
              </>
            )}
          </button>
        </div>
        
        {error && (
          <div className="mt-6 p-4 bg-red-500/20 border border-red-400 rounded-lg text-red-200 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium">Error generating characters</h4>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
        
        {generatedCharacters.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-white mb-4">
              Generated Characters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {generatedCharacters.map((character, index) => (
                <div
                  key={index}
                  className="bg-gray-700/50 rounded-lg overflow-hidden border border-gray-600 hover:border-purple-500 transition-colors"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-lg font-medium text-white">
                        {character.name}
                      </h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          character.type === 'protagonist'
                            ? 'bg-blue-500/20 text-blue-300'
                            : character.type === 'antagonist'
                            ? 'bg-red-500/20 text-red-300'
                            : character.type === 'supporting'
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}
                      >
                        {character.type}
                      </span>
                    </div>
                    
                    {character.description && (
                      <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                        {character.description}
                      </p>
                    )}
                    
                    <div className="space-y-3">
                      {character.personality?.traits && (
                        <div>
                          <h5 className="text-sm text-gray-400 mb-1">Traits</h5>
                          <div className="flex flex-wrap gap-1">
                            {character.personality.traits.slice(0, 3).map((trait, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-gray-600 rounded-md text-xs text-white"
                              >
                                {trait}
                              </span>
                            ))}
                            {character.personality.traits.length > 3 && (
                              <span className="px-2 py-0.5 bg-gray-600 rounded-md text-xs text-white">
                                +{character.personality.traits.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {character.background?.occupation && (
                        <div>
                          <h5 className="text-sm text-gray-400 mb-1">Occupation</h5>
                          <p className="text-white text-sm">
                            {character.background.occupation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-600 p-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSelectCharacter(character)}
                      className="flex items-center text-purple-400 hover:text-purple-300 text-sm"
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Select Character
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
