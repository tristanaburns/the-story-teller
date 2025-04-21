declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.scss' {
  const content: string;
  export default content;
}

// This allows imports from @/types
declare module '@/types' {
  export * from './types';
}

// Continue supporting the existing app-types module
declare module 'app-types' {
  export * from './types';
} 