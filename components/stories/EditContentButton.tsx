'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Edit } from 'lucide-react';

interface EditContentButtonProps {
  storyId: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'icon';
  iconOnly?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function EditContentButton({
  storyId,
  className = '',
  variant = 'primary',
  iconOnly = false,
  size = 'medium'
}: EditContentButtonProps) {
  const router = useRouter();
  
  const handleClick = () => {
    router.push(`/stories/${storyId}/editor`);
  };
  
  // Get classes based on variant and size
  const getBaseClasses = () => {
    let baseClasses = 'flex items-center justify-center rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500';
    
    // Add variant-specific classes
    switch (variant) {
      case 'primary':
        baseClasses += ' bg-blue-600 hover:bg-blue-700 text-white';
        break;
      case 'secondary':
        baseClasses += ' bg-gray-700 hover:bg-gray-600 text-white';
        break;
      case 'outline':
        baseClasses += ' bg-transparent border border-gray-600 hover:bg-gray-700 text-gray-300 hover:text-white';
        break;
      case 'icon':
        baseClasses += ' bg-gray-800/40 hover:bg-gray-700 text-gray-300 hover:text-white';
        break;
      default:
        baseClasses += ' bg-blue-600 hover:bg-blue-700 text-white';
    }
    
    // Add size-specific classes
    switch (size) {
      case 'small':
        baseClasses += iconOnly ? ' p-1.5' : ' px-3 py-1.5 text-sm';
        break;
      case 'medium':
        baseClasses += iconOnly ? ' p-2' : ' px-4 py-2';
        break;
      case 'large':
        baseClasses += iconOnly ? ' p-3' : ' px-6 py-3 text-lg';
        break;
      default:
        baseClasses += iconOnly ? ' p-2' : ' px-4 py-2';
    }
    
    return baseClasses;
  };
  
  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${getBaseClasses()} ${className}`}
      aria-label="Edit story content"
    >
      <Edit className={`${iconOnly ? '' : 'mr-2'} ${size === 'small' ? 'h-4 w-4' : size === 'large' ? 'h-6 w-6' : 'h-5 w-5'}`} />
      {!iconOnly && <span>Edit Content</span>}
    </button>
  );
}
