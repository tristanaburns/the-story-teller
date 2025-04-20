'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Character {
  _id?: string;
  id?: string;
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

interface RelatedCharacter {
  _id: string;
  id: string;
  name: string;
}

interface CharacterFormProps {
  storyId: string;
  character?: Character;
  relatedCharacters?: RelatedCharacter[];
  isSubmitting?: boolean;
  onSubmit: (character: Character) => void;
}

export default function CharacterForm({ 
  storyId, 
  character, 
  relatedCharacters = [],
  isSubmitting = false,
  onSubmit 
}: CharacterFormProps) {
  const isEditing = !!character?._id;
  
  const [formData, setFormData] = useState<Character>({
    storyId,
    name: '',
    full_name: '',
    type: 'supporting',
    status: 'alive',
    description: '',
    physical_appearance: {
      height: '',
      build: '',
      distinctive_features: [],
      typical_attire: '',
    },
    personality: {
      traits: [],
      values: [],
      motivations: [],
    },
    background: {
      birthplace: '',
      occupation: '',
      significant_events: [],
    },
    relationships: [],
    story_role: '',
  });

  // Initialize form data if editing an existing character
  useEffect(() => {
    if (character) {
      setFormData({
        ...character,
        // Ensure all nested objects exist
        physical_appearance: character.physical_appearance || {
          height: '',
          build: '',
          distinctive_features: [],
          typical_attire: '',
        },
        personality: character.personality || {
          traits: [],
          values: [],
          motivations: [],
        },
        background: character.background || {
          birthplace: '',
          occupation: '',
          significant_events: [],
        },
        relationships: character.relationships || [],
      });
    }
  }, [character]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties
      const [parent, child] = name.split('.');
      setFormData(prev => {
        // Create an empty object for the parent if it doesn't exist
        const parentObj = (prev[parent as keyof Character] || {}) as Record<string, string | string[]>;
        
        return {
          ...prev,
          [parent]: {
            ...parentObj,
            [child]: value
          }
        };
      });
    } else {
      // Handle top-level properties
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
    const value = e.target.value;
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    
    if (field.includes('.')) {
      // Handle nested array properties
      const [parent, child] = field.split('.');
      setFormData(prev => {
        // Create an empty object for the parent if it doesn't exist
        const parentObj = (prev[parent as keyof Character] || {}) as Record<string, string | string[]>;
        
        return {
          ...prev,
          [parent]: {
            ...parentObj,
            [child]: items
          }
        };
      });
    } else {
      // Handle top-level array properties
      setFormData(prev => ({
        ...prev,
        [field]: items
      }));
    }
  };

  const handleRelationshipChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const updatedRelationships = [...(prev.relationships || [])];
      updatedRelationships[index] = {
        ...updatedRelationships[index],
        [field]: value
      };
      return {
        ...prev,
        relationships: updatedRelationships
      };
    });
  };

  const addRelationship = () => {
    setFormData(prev => ({
      ...prev,
      relationships: [
        ...(prev.relationships || []),
        { character_id: '', relationship_type: 'other', dynamics: '' }
      ]
    }));
  };

  const removeRelationship = (index: number) => {
    setFormData(prev => {
      const updatedRelationships = [...(prev.relationships || [])];
      updatedRelationships.splice(index, 1);
      return {
        ...prev,
        relationships: updatedRelationships
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-gray-800/40 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4 text-white">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-300">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="Character name"
            />
          </div>
          
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium mb-2 text-gray-300">
              Full Name
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name || ''}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="Complete name (if different)"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="type" className="block text-sm font-medium mb-2 text-gray-300">
              Character Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type || 'supporting'}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="protagonist">Protagonist</option>
              <option value="antagonist">Antagonist</option>
              <option value="supporting">Supporting</option>
              <option value="minor">Minor</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-2 text-gray-300">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status || 'alive'}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="alive">Alive</option>
              <option value="deceased">Deceased</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="story_role" className="block text-sm font-medium mb-2 text-gray-300">
            Role in Story
          </label>
          <input
            type="text"
            id="story_role"
            name="story_role"
            value={formData.story_role || ''}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            placeholder="Character's role or function in the story"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2 text-gray-300">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            rows={4}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            placeholder="Brief character description"
          />
        </div>
      </div>
      
      <div className="bg-gray-800/40 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4 text-white">Physical Appearance</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="physical_appearance.height" className="block text-sm font-medium mb-2 text-gray-300">
              Height
            </label>
            <input
              type="text"
              id="physical_appearance.height"
              name="physical_appearance.height"
              value={formData.physical_appearance?.height || ''}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="Character's height"
            />
          </div>
          
          <div>
            <label htmlFor="physical_appearance.build" className="block text-sm font-medium mb-2 text-gray-300">
              Build
            </label>
            <input
              type="text"
              id="physical_appearance.build"
              name="physical_appearance.build"
              value={formData.physical_appearance?.build || ''}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="Body type/build"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="distinctive_features" className="block text-sm font-medium mb-2 text-gray-300">
            Distinctive Features (comma separated)
          </label>
          <input
            type="text"
            id="distinctive_features"
            value={formData.physical_appearance?.distinctive_features?.join(', ') || ''}
            onChange={(e) => handleArrayChange(e, 'physical_appearance.distinctive_features')}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            placeholder="Scars, tattoos, unique physical traits"
          />
        </div>
        
        <div>
          <label htmlFor="physical_appearance.typical_attire" className="block text-sm font-medium mb-2 text-gray-300">
            Typical Attire
          </label>
          <input
            type="text"
            id="physical_appearance.typical_attire"
            name="physical_appearance.typical_attire"
            value={formData.physical_appearance?.typical_attire || ''}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            placeholder="Usual clothing or style"
          />
        </div>
      </div>
      
      <div className="bg-gray-800/40 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4 text-white">Personality</h2>
        
        <div className="mb-6">
          <label htmlFor="traits" className="block text-sm font-medium mb-2 text-gray-300">
            Personality Traits (comma separated)
          </label>
          <input
            type="text"
            id="traits"
            value={formData.personality?.traits?.join(', ') || ''}
            onChange={(e) => handleArrayChange(e, 'personality.traits')}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            placeholder="Brave, cautious, impulsive, etc."
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="values" className="block text-sm font-medium mb-2 text-gray-300">
            Values (comma separated)
          </label>
          <input
            type="text"
            id="values"
            value={formData.personality?.values?.join(', ') || ''}
            onChange={(e) => handleArrayChange(e, 'personality.values')}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            placeholder="Family, honor, wealth, freedom, etc."
          />
        </div>
        
        <div>
          <label htmlFor="motivations" className="block text-sm font-medium mb-2 text-gray-300">
            Motivations (comma separated)
          </label>
          <input
            type="text"
            id="motivations"
            value={formData.personality?.motivations?.join(', ') || ''}
            onChange={(e) => handleArrayChange(e, 'personality.motivations')}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            placeholder="Revenge, discovery, proving themselves, etc."
          />
        </div>
      </div>
      
      <div className="bg-gray-800/40 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4 text-white">Background</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="background.birthplace" className="block text-sm font-medium mb-2 text-gray-300">
              Birthplace
            </label>
            <input
              type="text"
              id="background.birthplace"
              name="background.birthplace"
              value={formData.background?.birthplace || ''}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="Place of birth"
            />
          </div>
          
          <div>
            <label htmlFor="background.occupation" className="block text-sm font-medium mb-2 text-gray-300">
              Occupation
            </label>
            <input
              type="text"
              id="background.occupation"
              name="background.occupation"
              value={formData.background?.occupation || ''}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="Job or role in society"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="significant_events" className="block text-sm font-medium mb-2 text-gray-300">
            Significant Life Events (comma separated)
          </label>
          <textarea
            id="significant_events"
            value={formData.background?.significant_events?.join(', ') || ''}
            onChange={(e) => handleArrayChange(e, 'background.significant_events')}
            rows={3}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            placeholder="Major events that shaped the character"
          />
        </div>
      </div>
      
      <div className="bg-gray-800/40 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Relationships</h2>
          <button 
            type="button"
            onClick={addRelationship}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            Add Relationship
          </button>
        </div>
        
        {formData.relationships && formData.relationships.length > 0 ? (
          <div className="space-y-4">
            {formData.relationships.map((relationship, index) => (
              <div key={index} className="bg-gray-700/50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-white">Relationship #{index + 1}</h3>
                  <button 
                    type="button" 
                    onClick={() => removeRelationship(index)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">
                      Character
                    </label>
                    <select
                      value={relationship.character_id}
                      onChange={(e) => handleRelationshipChange(index, 'character_id', e.target.value)}
                      className="w-full bg-gray-600 border border-gray-500 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select a character</option>
                      {relatedCharacters.map(char => (
                        <option key={char.id} value={char.id}>
                          {char.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">
                      Relationship Type
                    </label>
                    <select
                      value={relationship.relationship_type}
                      onChange={(e) => handleRelationshipChange(index, 'relationship_type', e.target.value)}
                      className="w-full bg-gray-600 border border-gray-500 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                      <option value="family">Family</option>
                      <option value="friend">Friend</option>
                      <option value="enemy">Enemy</option>
                      <option value="ally">Ally</option>
                      <option value="rival">Rival</option>
                      <option value="romantic">Romantic</option>
                      <option value="professional">Professional</option>
                      <option value="acquaintance">Acquaintance</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Dynamics
                  </label>
                  <input
                    type="text"
                    value={relationship.dynamics || ''}
                    onChange={(e) => handleRelationshipChange(index, 'dynamics', e.target.value)}
                    className="w-full bg-gray-600 border border-gray-500 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="Describe the dynamics of this relationship"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>No relationships added yet.</p>
            <p className="text-sm mt-2">Click &ldquo;Add Relationship&rdquo; to define connections with other characters.</p>
          </div>
        )}
      </div>
      
      <div className="flex gap-4 justify-end">
        <Link
          href={isEditing ? `/stories/${storyId}/characters/${character?._id}` : `/stories/${storyId}/characters`}
          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 font-medium"
        >
          Cancel
        </Link>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium flex items-center"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              {isEditing ? 'Saving...' : 'Creating...'}
            </>
          ) : (
            isEditing ? 'Save Changes' : 'Create Character'
          )}
        </button>
      </div>
    </form>
  );
}