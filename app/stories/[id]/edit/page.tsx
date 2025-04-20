'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

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

export default function EditStory({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Story>>({
    title: '',
    description: '',
    coverImage: '',
    content: '',
    status: 'draft',
    metadata: {
      genre: '',
      setting: '',
      tags: []
    }
  });

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
      setFormData({
        title: data.title || '',
        description: data.description || '',
        coverImage: data.coverImage || '',
        content: data.content || '',
        status: data.status || 'draft',
        metadata: {
          genre: data.metadata?.genre || '',
          setting: data.metadata?.setting || '',
          tags: data.metadata?.tags || []
        }
      });
    } catch (error) {
      console.error('Error fetching story:', error);
      setError('Failed to load story. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('metadata.')) {
      const metadataField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          [metadataField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        tags
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    if (!formData.title) {
      setError('Title is required');
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch(`/api/stories/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update story');
      }

      router.push(`/stories/${params.id}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating the story');
      console.error('Error updating story:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/stories/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete story');
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting the story');
      console.error('Error deleting story:', err);
      setIsDeleteModalOpen(false);
    } finally {
      setIsSaving(false);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <Link href="/dashboard" className="hover:text-white">
            Dashboard
          </Link>
          <span>›</span>
          <Link href={`/stories/${params.id}`} className="hover:text-white">
            Story
          </Link>
          <span>›</span>
          <span className="text-gray-300">Edit</span>
        </div>
        <h1 className="text-3xl font-bold text-white">Edit Story</h1>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-white p-4 rounded-lg mb-8">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-gray-800/40 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Basic Information</h2>
          
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="Enter story title"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="Enter a brief description of your story"
              rows={3}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="coverImage" className="block text-sm font-medium mb-2">
              Cover Image URL
            </label>
            <input
              type="text"
              id="coverImage"
              name="coverImage"
              value={formData.coverImage}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="Enter an image URL for your story cover"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="status" className="block text-sm font-medium mb-2">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="bg-gray-800/40 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Metadata</h2>
          
          <div className="mb-6">
            <label htmlFor="metadata.genre" className="block text-sm font-medium mb-2">
              Genre
            </label>
            <input
              type="text"
              id="metadata.genre"
              name="metadata.genre"
              value={formData.metadata?.genre}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="e.g., Fantasy, Sci-Fi, Mystery"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="metadata.setting" className="block text-sm font-medium mb-2">
              Setting
            </label>
            <input
              type="text"
              id="metadata.setting"
              name="metadata.setting"
              value={formData.metadata?.setting}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="e.g., Medieval Europe, Future Mars Colony"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="tags" className="block text-sm font-medium mb-2">
              Tags (comma separated)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.metadata?.tags?.join(', ')}
              onChange={handleTagsChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="e.g., adventure, magic, epic"
            />
          </div>
        </div>

        <div className="bg-gray-800/40 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Content</h2>
          
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium mb-2">
              Story Content (Markdown)
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="# Chapter 1 

This is where your story begins..."
              rows={15}
            />
            <p className="text-xs text-gray-400 mt-2">
              Supports Markdown formatting for rich text.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-6 py-2 bg-red-600/70 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 font-medium"
          >
            Delete Story
          </button>
          
          <div className="flex gap-4">
            <Link
              href={`/stories/${params.id}`}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 font-medium flex items-center justify-center"
            >
              Cancel
            </Link>
            
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium flex items-center justify-center"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">Delete Story</h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this story? This action cannot be undone, and all associated data
              (characters, locations, timeline events) will be permanently removed.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2 inline-block"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Permanently'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}