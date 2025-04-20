'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { marked } from 'marked';

interface Story {
  _id: string;
  title: string;
  description: string;
  coverImage?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  status?: 'draft' | 'published' | 'archived';
  metadata?: {
    genre?: string;
    setting?: string;
    timeline?: string;
    tags?: string[];
  };
}

export default function StoryDetail({ params }: { params: { id: string } }) {
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
    if (status === 'authenticated' && params.id) {
      fetchStory();
    }
  }, [status, params.id, router]);

  const fetchStory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/stories/${params.id}`);
      
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

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-500/20 border border-red-500/50 text-white p-4 rounded-lg mb-8">
          {error || 'Story not found'}
          <button 
            onClick={() => router.push('/dashboard')} 
            className="ml-4 underline text-red-200 hover:text-white"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row justify-between md:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <Link href="/dashboard" className="hover:text-white">
              Dashboard
            </Link>
            <span>›</span>
            <span className="text-gray-300">Story</span>
          </div>
          <h1 className="text-3xl font-bold text-white">{story.title}</h1>
          {story.description && (
            <p className="text-gray-300 mt-2 max-w-3xl">{story.description}</p>
          )}
        </div>
        
        <div className="flex gap-3 mt-4 md:mt-0">
          <Link
            href={`/stories/${story._id}/edit`}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Story
          </Link>
          
          <Link
            href={`/stories/${story._id}/characters`}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 font-medium flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Characters
          </Link>
        </div>
      </div>

      {story.coverImage && (
        <div className="mb-8 rounded-xl overflow-hidden max-h-80 bg-gray-800">
          <img 
            src={story.coverImage} 
            alt={story.title}
            className="w-full h-full object-cover" 
          />
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-3/4">
          <div className="bg-gray-800/40 rounded-xl p-6 prose prose-invert prose-blue max-w-none">
            {story.content ? (
              <div dangerouslySetInnerHTML={{ __html: marked(story.content) }} />
            ) : (
              <div className="text-gray-400 italic">
                No content has been added to this story yet.
              </div>
            )}
          </div>
        </div>

        <div className="lg:w-1/4">
          <div className="bg-gray-800/40 rounded-xl p-6 sticky top-6">
            <h2 className="text-xl font-bold mb-4">Story Information</h2>
            
            <div className="mb-4">
              <div className="text-sm text-gray-400">Status</div>
              <div className="mt-1">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  story.status === 'published' ? 'bg-green-700/50 text-green-200' :
                  story.status === 'archived' ? 'bg-gray-700/50 text-gray-200' :
                  'bg-yellow-700/50 text-yellow-200'
                }`}>
                  {story.status || 'Draft'}
                </span>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="text-sm text-gray-400">Created</div>
              <div className="mt-1 text-white">
                {new Date(story.createdAt).toLocaleDateString()}
              </div>
            </div>
            
            <div className="mb-4">
              <div className="text-sm text-gray-400">Last Updated</div>
              <div className="mt-1 text-white">
                {new Date(story.updatedAt).toLocaleDateString()}
              </div>
            </div>
            
            {story.metadata?.genre && (
              <div className="mb-4">
                <div className="text-sm text-gray-400">Genre</div>
                <div className="mt-1 text-white">{story.metadata.genre}</div>
              </div>
            )}
            
            {story.metadata?.setting && (
              <div className="mb-4">
                <div className="text-sm text-gray-400">Setting</div>
                <div className="mt-1 text-white">{story.metadata.setting}</div>
              </div>
            )}
            
            {story.metadata?.tags && story.metadata.tags.length > 0 && (
              <div className="mb-4">
                <div className="text-sm text-gray-400 mb-2">Tags</div>
                <div className="flex flex-wrap gap-2">
                  {story.metadata.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href={`/stories/${story._id}/locations`}
                className="text-sm px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 font-medium flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Manage Locations
              </Link>
              
              <Link
                href={`/stories/${story._id}/timeline`}
                className="text-sm px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 font-medium flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                View Timeline
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}