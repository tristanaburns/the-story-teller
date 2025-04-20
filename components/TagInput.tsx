'use client';

import React, { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  disabled?: boolean;
}

/**
 * A component for inputting and managing tags.
 * Allows adding tags by typing and pressing Enter, and removing tags by clicking their X button.
 */
export default function TagInput({
  tags,
  setTags,
  placeholder = 'Add a tag...',
  maxTags = 10,
  disabled = false
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // If Enter is pressed and there's a value
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      
      // Prevent adding if we've reached the max number of tags
      if (tags.length >= maxTags) return;
      
      // Don't add duplicates
      if (!tags.includes(inputValue.trim())) {
        setTags([...tags, inputValue.trim()]);
      }
      
      // Clear the input
      setInputValue('');
    }
    
    // If Backspace is pressed and there's no input value, remove the last tag
    if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      const newTags = [...tags];
      newTags.pop();
      setTags(newTags);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex flex-wrap gap-2 min-h-[36px] p-1 border rounded-md bg-background">
        {tags.map((tag, i) => (
          <Badge 
            key={`${tag}-${i}`} 
            variant="secondary"
            className="flex items-center gap-1 px-3 py-1"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-muted-foreground hover:text-foreground transition-colors ml-1"
              disabled={disabled}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove {tag}</span>
            </button>
          </Badge>
        ))}
        
        {tags.length < maxTags && (
          <Input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            placeholder={tags.length === 0 ? placeholder : ''}
            className="flex-grow border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-1 py-0 h-8"
            disabled={disabled}
          />
        )}
      </div>
      
      <div className="text-xs text-muted-foreground">
        {tags.length}/{maxTags} tags • Press Enter to add
      </div>
    </div>
  );
} 