'use client';

import Link from 'next/link';
import { useState } from 'react';

interface CharacterCardProps {
  character: {
    _id: string;
    id: string;
    storyId: string;
    name: string;
    full_name?: string | null;
    type?: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
    status?: 'alive' | 'deceased' | 'unknown';
    description?: string;
    story_role?: string;
  };
  onDelete?: (characterId: string) => void;
}

export default function CharacterCard({ character, onDelete }: CharacterCardProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
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

  const confirmDelete = () => {
    setIsDeleteModalOpen(false);
    if (onDelete) {
      onDelete(character._id);
    }
  };

  return (
    <>
      <div className="bg-gray-800/40 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-blue-900/20 transition-all duration-300 border border-gray-700/50 hover:border-blue-700/50 h-full flex flex-col">
        <div className="p-5 flex flex-col h-full">
          <div className="flex items-center mb-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mr-3 flex-shrink-0" 
              style={{ backgroundColor: getAvatarColor(character.name) }}
            >
              {getInitials(character.name)}
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-bold text-white">
                {character.name}
              </h3>
              {character.full_name && character.full_name !== character.name && (
                <p className="text-sm text-gray-400">
                  {character.full_name}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 mb-3 flex-wrap">
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
          
          {character.description && (
            <p className="text-gray-300 text-sm mb-4 line-clamp-3 flex-grow">
              {character.description}
            </p>
          )}
          
          {character.story_role && (
            <div className="mb-4">
              <span className="text-xs text-gray-400">Role:</span>
              <p className="text-gray-300 text-sm">{character.story_role}</p>
            </div>
          )}
          
          <div className="flex justify-between pt-4 mt-auto border-t border-gray-700/50">
            <Link 
              href={`/stories/${character.storyId}/characters/${character._id}`}
              className="text-xs px-2 py-1 rounded bg-gray-700/30 hover:bg-gray-700/50 text-gray-200 transition-colors"
            >
              View
            </Link>
            <Link 
              href={`/stories/${character.storyId}/characters/${character._id}/edit`}
              className="text-xs px-2 py-1 rounded bg-blue-700/30 hover:bg-blue-700/50 text-blue-200 transition-colors"
            >
              Edit
            </Link>
            {onDelete && (
              <button 
                onClick={() => setIsDeleteModalOpen(true)}
                className="text-xs px-2 py-1 rounded bg-red-700/30 hover:bg-red-700/50 text-red-200 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
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
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}