'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useToast } from '@/components/ui/use-toast';

/**
 * Memory entry structure
 */
export interface MemoryEntry {
  id: string;
  story_id: string;
  content: string;
  type: 'character' | 'event' | 'location' | 'lore' | 'other';
  tags: string[];
  importance: number;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
}

/**
 * Memory entry creation payload
 */
export interface MemoryEntryInput {
  story_id: string;
  content: string;
  type: 'character' | 'event' | 'location' | 'lore' | 'other';
  tags?: string[];
  importance?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Memory context value interface
 */
interface MemoryContextValue {
  memories: MemoryEntry[];
  loading: boolean;
  loadMemories: (storyId: string) => Promise<void>;
  addMemory: (memory: MemoryEntryInput) => Promise<MemoryEntry | null>;
  updateMemory: (id: string, memory: Partial<MemoryEntryInput>) => Promise<MemoryEntry | null>;
  deleteMemory: (id: string) => Promise<boolean>;
  searchMemories: (query: string, storyId?: string) => Promise<MemoryEntry[]>;
}

/**
 * Memory provider props
 */
interface MemoryProviderProps {
  children: ReactNode;
}

const MemoryContext = createContext<MemoryContextValue | undefined>(undefined);

export function MemoryProvider({ children }: MemoryProviderProps) {
  const { toast } = useToast();
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const loadMemories = async (storyId: string): Promise<void> => {
    try {
      setLoading(true);
      
      if (!storyId) {
        setMemories([]);
        return;
      }

      const response = await fetch(`/api/mcp/memory?story_id=${storyId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load memories');
      }

      const data = await response.json();
      setMemories(data.memories || []);
    } catch (error) {
      console.error('Error loading memories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load memory entries',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addMemory = async (memory: MemoryEntryInput): Promise<MemoryEntry | null> => {
    try {
      const response = await fetch('/api/mcp/memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memory),
      });

      if (!response.ok) {
        throw new Error('Failed to add memory');
      }

      const data = await response.json();
      const newMemory = data.memory as MemoryEntry;
      
      setMemories((prev) => [...prev, newMemory]);
      
      toast({
        title: 'Success',
        description: 'Memory entry added successfully',
      });
      
      return newMemory;
    } catch (error) {
      console.error('Error adding memory:', error);
      toast({
        title: 'Error',
        description: 'Failed to add memory entry',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateMemory = async (
    id: string, 
    memory: Partial<MemoryEntryInput>
  ): Promise<MemoryEntry | null> => {
    try {
      const response = await fetch(`/api/mcp/memory/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memory),
      });

      if (!response.ok) {
        throw new Error('Failed to update memory');
      }

      const data = await response.json();
      const updatedMemory = data.memory as MemoryEntry;
      
      setMemories((prev) => 
        prev.map((m) => (m.id === id ? updatedMemory : m))
      );
      
      toast({
        title: 'Success',
        description: 'Memory entry updated successfully',
      });
      
      return updatedMemory;
    } catch (error) {
      console.error('Error updating memory:', error);
      toast({
        title: 'Error',
        description: 'Failed to update memory entry',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteMemory = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/mcp/memory/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete memory');
      }

      setMemories((prev) => prev.filter((memory) => memory.id !== id));
      
      toast({
        title: 'Success',
        description: 'Memory entry deleted successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting memory:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete memory entry',
        variant: 'destructive',
      });
      return false;
    }
  };

  const searchMemories = async (
    query: string, 
    storyId?: string
  ): Promise<MemoryEntry[]> => {
    try {
      if (!query) {
        return memories;
      }

      const params = new URLSearchParams({
        query,
        ...(storyId && { story_id: storyId }),
      });

      const response = await fetch(`/api/mcp/memory/search?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to search memories');
      }

      const data = await response.json();
      return data.memories || [];
    } catch (error) {
      console.error('Error searching memories:', error);
      toast({
        title: 'Error',
        description: 'Failed to search memory entries',
        variant: 'destructive',
      });
      return [];
    }
  };

  const value = {
    memories,
    loading,
    loadMemories,
    addMemory,
    updateMemory,
    deleteMemory,
    searchMemories,
  };

  return (
    <MemoryContext.Provider value={value}>
      {children}
    </MemoryContext.Provider>
  );
}

export function useMemory(): MemoryContextValue {
  const context = useContext(MemoryContext);
  
  if (context === undefined) {
    throw new Error('useMemory must be used within a MemoryProvider');
  }
  
  return context;
} 