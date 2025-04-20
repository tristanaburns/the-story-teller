'use client';

import { useState } from 'react';
import Link from 'next/link';
import CharacterCard from './CharacterCard';

interface Character {
  _id: string;
  id: string;
  storyId: string;
  name: string;
  full_name?: string | null;
  type?: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  status?: 'alive' | 'deceased' | 'unknown';
  description?: string;
  story_role?: string;
}

interface CharactersGridProps {
  characters: Character[];
  storyId: string;
  onDelete?: (characterId: string) => void;
}

export default function CharactersGrid({ characters, storyId, onDelete }: CharactersGridProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'status'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as 'name' | 'type' | 'status');
  };

  const handleDirectionChange = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const filteredCharacters = characters
    .filter(character => 
      (filterType === 'all' || character.type === filterType) &&
      (filterStatus === 'all' || character.status === filterStatus) &&
      (
        searchQuery === '' || 
        character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (character.full_name && character.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (character.description && character.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'type') {
        const typeA = a.type || '';
        const typeB = b.type || '';
        return sortDirection === 'asc' 
          ? typeA.localeCompare(typeB)
          : typeB.localeCompare(typeA);
      } else {
        const statusA = a.status || '';
        const statusB = b.status || '';
        return sortDirection === 'asc' 
          ? statusA.localeCompare(statusB)
          : statusB.localeCompare(statusA);
      }
    });

  if (characters.length === 0) {
    return (
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-8 text-center">
        <h2 className="text-xl font-semibold mb-3">No characters yet</h2>
        <p className="text-gray-400 mb-6">
          Start building your story world by creating your first character
        </p>
        <Link
          href={`/stories/${storyId}/characters/new`}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 inline-block font-medium"
        >
          Create Your First Character
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 bg-gray-800/30 p-4 rounded-lg space-y-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-grow max-w-md">
            <label htmlFor="search" className="block text-sm font-medium mb-1 text-gray-400">
              Search Characters
            </label>
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by name or description"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div>
              <label htmlFor="filterType" className="block text-sm font-medium mb-1 text-gray-400">
                Type
              </label>
              <select
                id="filterType"
                value={filterType}
                onChange={handleTypeFilterChange}
                className="bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Types</option>
                <option value="protagonist">Protagonist</option>
                <option value="antagonist">Antagonist</option>
                <option value="supporting">Supporting</option>
                <option value="minor">Minor</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="filterStatus" className="block text-sm font-medium mb-1 text-gray-400">
                Status
              </label>
              <select
                id="filterStatus"
                value={filterStatus}
                onChange={handleStatusFilterChange}
                className="bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="alive">Alive</option>
                <option value="deceased">Deceased</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-between items-center pt-3 border-t border-gray-700">
          <div className="flex gap-3 items-center">
            <label htmlFor="sortBy" className="text-sm text-gray-400">Sort by:</label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={handleSortChange}
              className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-sm text-white"
            >
              <option value="name">Name</option>
              <option value="type">Type</option>
              <option value="status">Status</option>
            </select>
            
            <button
              onClick={handleDirectionChange}
              className="bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md px-2 py-1 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 flex items-center gap-1"
            >
              {sortDirection === 'asc' ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  Asc
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Desc
                </>
              )}
            </button>
          </div>
          
          <div className="text-sm text-gray-400">
            {filteredCharacters.length} {filteredCharacters.length === 1 ? 'character' : 'characters'}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCharacters.map((character) => (
          <CharacterCard
            key={character._id}
            character={character}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}