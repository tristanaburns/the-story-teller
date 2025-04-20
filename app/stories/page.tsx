'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import StoriesGrid from '@/components/dashboard/StoriesGrid';
import StorySearch from '@/components/dashboard/StorySearch';

interface Story {
  _id: string;
  title: string;
  description: string;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
  status?: 'draft' | 'published' | 'archived';
}

export default function StoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to signin if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }

    // Fetch user's stories when authenticated
    if (status === 'authenticated') {
      fetchStories();
    }
  }, [status, router]);

  const fetchStories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/stories');
      
      if (!response.ok) {
        throw new Error('Failed to fetch stories');
      }
      
      const data = await response.json();
      setStories(data);
      setFilteredStories(data);
    } catch (error) {
      console.error('Error fetching stories:', error);
      setError('Failed to load stories. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredStories(stories);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const results = stories.filter(
      story => 
        story.title.toLowerCase().includes(lowerQuery) || 
        (story.description && story.description.toLowerCase().includes(lowerQuery))
    );
    setFilteredStories(results);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">My Stories</h1>
          <p className="text-gray-400 mt-1">
            View and manage all your stories
          </p>
        </div>
        <Link
          href="/stories/new"
          className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium flex items-center"
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
          Create New Story
        </Link>
      </div>

      <div className="mb-8">
        <StorySearch onSearch={handleSearch} />
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-white p-4 rounded-lg mb-8">
          {error}
          <button 
            onClick={fetchStories} 
            className="ml-4 underline text-red-200 hover:text-white"
          >
            Try again
          </button>
        </div>
      )}

      <StoriesGrid stories={filteredStories} />
    </div>
  );
}