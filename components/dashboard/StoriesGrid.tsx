'use client';

import { useState } from 'react';
import StoryCard from './StoryCard';
import Link from 'next/link';

interface Story {
  _id: string;
  title: string;
  description: string;
  coverImage?: string | null;
  createdAt: string;
  updatedAt: string;
  status?: 'draft' | 'published' | 'archived';
}

interface StoriesGridProps {
  stories: Story[];
}

export default function StoriesGrid({ stories }: StoriesGridProps) {
  const [sortBy, setSortBy] = useState<'updatedAt' | 'createdAt' | 'title'>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as 'updatedAt' | 'createdAt' | 'title');
  };

  const handleDirectionChange = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
  };

  const sortedAndFilteredStories = [...stories]
    .filter(story => filterStatus === 'all' || story.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'title') {
        return sortDirection === 'asc' 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else {
        const dateA = new Date(a[sortBy]);
        const dateB = new Date(b[sortBy]);
        return sortDirection === 'asc' 
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      }
    });

  if (stories.length === 0) {
    return (
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-8 text-center">
        <h2 className="text-xl font-semibold mb-3">No stories yet</h2>
        <p className="text-gray-400 mb-6">
          Get started by creating your first story
        </p>
        <Link
          href="/stories/new"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 inline-block font-medium"
        >
          Create Your First Story
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-3 items-center justify-between bg-gray-800/30 p-3 rounded-lg">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label htmlFor="sortBy" className="text-sm text-gray-400">Sort by:</label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={handleSortChange}
              className="bg-gray-700 text-white text-sm rounded-md px-3 py-1 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="updatedAt">Last Updated</option>
              <option value="createdAt">Created Date</option>
              <option value="title">Title</option>
            </select>
          </div>
          
          <button
            onClick={handleDirectionChange}
            className="bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md px-3 py-1 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 flex items-center gap-1"
          >
            {sortDirection === 'asc' ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                Ascending
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Descending
              </>
            )}
          </button>
          
          <div className="flex items-center gap-2">
            <label htmlFor="statusFilter" className="text-sm text-gray-400">Status:</label>
            <select
              id="statusFilter"
              value={filterStatus}
              onChange={handleStatusFilterChange}
              className="bg-gray-700 text-white text-sm rounded-md px-3 py-1 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
        
        <div className="text-sm text-gray-400">
          {sortedAndFilteredStories.length} {sortedAndFilteredStories.length === 1 ? 'story' : 'stories'}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedAndFilteredStories.map((story) => (
          <StoryCard key={story._id} story={story} />
        ))}
      </div>
    </div>
  );
}