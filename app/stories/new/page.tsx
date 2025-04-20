'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function NewStory() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverImage: '',
    content: '',
    status: 'draft',
    metadata: {
      genre: '',
      setting: '',
      tags: [] as string[]
    }
  });
  const [error, setError] = useState('');

  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  // Loading state
  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

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
    setIsSubmitting(true);
    setError('');

    if (!formData.title) {
      setError('Title is required');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create story');
      }

      const newStory = await response.json();
      router.push(`/stories/${newStory._id}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the story');
      console.error('Error creating story:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <Link href="/dashboard" className="hover:text-white">
            Dashboard
          </Link>
          <span>›</span>
          <span className="text-gray-300">New Story</span>
        </div>
        <h1 className="text-3xl font-bold text-white">Create New Story</h1>
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
              value={formData.metadata.genre}
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
              value={formData.metadata.setting}
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
              value={formData.metadata.tags.join(', ')}
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
              Initial Content (Markdown)
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

        <div className="flex gap-4 justify-end">
          <Link
            href="/dashboard"
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 font-medium flex items-center justify-center"
          >
            Cancel
          </Link>
          
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium flex items-center justify-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              'Create Story'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}