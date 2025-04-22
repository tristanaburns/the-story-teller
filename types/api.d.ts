// API response and request type definitions

// Common types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: number;
    message: string;
    details?: string;
    stack?: string;
  };
}

// Story-related types
export interface Story {
  _id: string;
  title: string;
  content: string;
  summary?: string;
  author: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  status: 'draft' | 'published' | 'archived';
  readTime?: number;
  genre?: string;
  likes?: number;
  views?: number;
}

export interface StoryCreateRequest {
  title: string;
  content: string;
  summary?: string;
  tags?: string[];
  genre?: string;
  status?: 'draft' | 'published';
}

export interface StoryUpdateRequest {
  title?: string;
  content?: string;
  summary?: string;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
  genre?: string;
}

// User-related types
export interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  role: 'user' | 'admin';
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  emailNotifications?: boolean;
  language?: string;
}

export interface UserUpdateRequest {
  name?: string;
  image?: string;
  preferences?: Partial<UserPreferences>;
}

// Comment-related types
export interface Comment {
  _id: string;
  content: string;
  authorId: string;
  authorName: string;
  storyId: string;
  createdAt: string;
  updatedAt: string;
  likes?: number;
}

export interface CommentCreateRequest {
  content: string;
  storyId: string;
}

export interface CommentUpdateRequest {
  content: string;
}

// Logging-related types
export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  source?: string;
  userId?: string;
}

export interface LogQueryParams {
  level?: 'debug' | 'info' | 'warn' | 'error';
  startDate?: string;
  endDate?: string;
  source?: string;
  userId?: string;
  limit?: number;
  skip?: number;
}

// Pagination types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  sortDirection?: 'asc' | 'desc';
} 