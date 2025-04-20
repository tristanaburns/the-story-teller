'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Edit, Trash2, Book } from "lucide-react";

interface StoryCardProps {
  story: {
    _id: string;
    title: string;
    description: string;
    coverImage?: string | null;
    createdAt: string;
    updatedAt: string;
    status?: 'draft' | 'published' | 'archived';
  };
}

export default function StoryCard({ story }: StoryCardProps) {
  const formattedDate = formatDistanceToNow(new Date(story.updatedAt), { addSuffix: true });

  // Default gradient background colors based on title (simple hash function)
  const getHashColor = (title: string) => {
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    const saturation = 30 + (hash % 20);
    const lightness = 15 + (hash % 15);
    return `hsla(${hue}, ${saturation}%, ${lightness}%, 0.6)`;
  };

  const gradientStyle = {
    background: `linear-gradient(135deg, ${getHashColor(story.title)}, rgba(50, 50, 80, 0.8))`,
  };

  const statusColors = {
    draft: 'bg-yellow-700/50 text-yellow-200',
    published: 'bg-green-700/50 text-green-200',
    archived: 'bg-gray-700/50 text-gray-200',
  };

  return (
    <div className="bg-gray-800/40 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-blue-900/20 transition-all duration-300 h-full flex flex-col group border border-gray-700/50 hover:border-blue-700/50">
      <div
        className="h-40 relative"
      >
        {story.coverImage ? (
          <div className="w-full aspect-video bg-gray-800 rounded-t-lg overflow-hidden relative">
            <Image
              src={story.coverImage}
              alt={`Cover image for ${story.title}`}
              fill
              style={{ objectFit: 'cover' }}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-t-lg flex items-center justify-center">
            <Book className="h-12 w-12 text-gray-600" />
          </div>
        )}

        {story.status && (
          <div className={`absolute top-3 right-3 ${statusColors[story.status] || statusColors.draft} px-2 py-1 text-xs rounded-full font-medium`}>
            {story.status}
          </div>
        )}
      </div>

      <div className="p-5 flex-grow flex flex-col">
        <h3 className="text-xl font-bold mb-2 text-white group-hover:text-blue-400 transition-colors">
          {story.title}
        </h3>
        
        <p className="text-gray-400 mb-4 text-sm line-clamp-2 flex-grow">
          {story.description || "No description provided."}
        </p>
        
        <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Updated {formattedDate}
          </span>
        </div>
      </div>

      <div className="border-t border-gray-700 p-3 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800/80">
        <Link 
          href={`/stories/${story._id}/edit`}
          className="text-xs px-2 py-1 rounded bg-blue-700/30 hover:bg-blue-700/50 text-blue-200 transition-colors"
        >
          Edit
        </Link>
        <Link 
          href={`/stories/${story._id}`}
          className="text-xs px-2 py-1 rounded bg-gray-700/30 hover:bg-gray-700/50 text-gray-200 transition-colors"
        >
          View
        </Link>
      </div>
    </div>
  );
}