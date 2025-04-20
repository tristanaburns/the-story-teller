'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Story {
  _id: string;
  title: string;
  description: string;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      const response = await fetch('/api/stories');
      if (!response.ok) throw new Error('Failed to fetch stories');
      
      const data = await response.json();
      setStories(data);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">Your Stories</h1>
            <p className="text-gray-400 mt-1">
              Create and manage your narrative content
            </p>
          </div>
          <Link
            href="/stories/new"
            className="mt-4 md:mt-0 px-4 py-2 bg-primary hover:bg-blue-700 rounded-lg transition-colors duration-200 font-medium"
          >
            Create New Story
          </Link>
        </div>

        {stories.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 text-center">
            <h2 className="text-xl font-semibold mb-3">No stories yet</h2>
            <p className="text-gray-400 mb-6">
              Get started by creating your first story
            </p>
            <Link
              href="/stories/new"
              className="px-6 py-3 bg-primary hover:bg-blue-700 rounded-lg transition-colors duration-200 inline-block font-medium"
            >
              Create Your First Story
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <Link 
                href={`/stories/${story._id}`} 
                key={story._id}
                className="group bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-white/10 transition-colors duration-200"
              >
                <div 
                  className="h-48 bg-gradient-to-br from-blue-600/20 to-purple-600/20 relative"
                >
                  {story.coverImage && (
                    <img 
                      src={story.coverImage} 
                      alt={story.title} 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-200">
                    {story.title}
                  </h2>
                  <p className="text-gray-400 line-clamp-2 mb-4">
                    {story.description}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>
                      Last edited: {new Date(story.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}