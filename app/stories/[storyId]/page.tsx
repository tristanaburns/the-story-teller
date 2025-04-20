'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Story } from '@/types';

export default function StoryPage({ params }: { params: { storyId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to signin if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }

    // Fetch story when authenticated
    if (status === 'authenticated' && params.storyId) {
      fetchStory();
    }
  }, [status, params.storyId, router]);

  const fetchStory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/stories/${params.storyId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch story');
      }
      
      const data = await response.json();
      setStory(data);
    } catch (error) {
      console.error('Error fetching story:', error);
      setError('Failed to load story. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
      <Link
        href={`/stories/${params.storyId}/edit`}
        className="flex flex-col items-center p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-blue-500/50 hover:bg-blue-900/20 transition-all duration-200"
      >
        Edit Story
      </Link>
      <Link
        href={`/stories/${params.storyId}/characters`}
        className="flex flex-col items-center p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-blue-500/50 hover:bg-blue-900/20 transition-all duration-200"
      >
        Characters
      </Link>
      <Link
        href={`/stories/${params.storyId}/editor`}
        className="flex flex-col items-center p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-blue-500/50 hover:bg-blue-900/20 transition-all duration-200"
      >
        Editor
      </Link>
    </div>
  );
} 