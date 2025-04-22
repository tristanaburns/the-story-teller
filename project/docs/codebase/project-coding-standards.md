# The Story Teller: Coding Standards

*Last Updated: 2025-04-22*

This document outlines the coding standards and best practices for The Story Teller application. These standards ensure code quality, maintainability, and consistency across the codebase.

## General Principles

### Code Quality

All code in The Story Teller application must adhere to the following principles:

1. **Readability**: Code should be written for humans first, machines second
2. **Simplicity**: Choose simple solutions over complex ones when possible
3. **Maintainability**: Code should be easy to understand, modify, and extend
4. **Performance**: Optimize for performance where it matters most
5. **Testing**: All code should be testable and have appropriate test coverage

### File Organization

- One component per file
- Files should be named according to their purpose
- Keep files focused on a single responsibility
- Group related files in appropriate directories

## TypeScript Standards

### Type Safety

- Enable strict type checking in `tsconfig.json`
- Explicitly type all function parameters and return values
- Avoid using `any` type; use `unknown` if the type is truly unknown
- Use interfaces for object shapes and types for unions/primitives
- Create domain-specific types for complex business logic

```typescript
// Bad
function processUser(user: any): any {
  // ...
}

// Good
interface User {
  id: string;
  name: string;
  email: string;
  preferences: UserPreferences;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
}

function processUser(user: User): ProcessedUser {
  // ...
}
```

### Null and Undefined

- Use optional chaining (`?.`) and nullish coalescing (`??`) instead of verbose conditionals
- Be explicit about nullable types using union types with `null` or `undefined`

```typescript
// Bad
if (user && user.preferences && user.preferences.theme) {
  const theme = user.preferences.theme;
}

// Good
const theme = user?.preferences?.theme ?? 'light';
```

### Type Assertions

- Avoid type assertions (`as`) when possible
- If type assertions are necessary, use type guards instead

```typescript
// Bad
const element = document.getElementById('root') as HTMLDivElement;

// Good
const element = document.getElementById('root');
if (element instanceof HTMLDivElement) {
  // Use element as HTMLDivElement
}
```

## React and Next.js Standards

### Component Structure

- Use functional components with hooks instead of class components
- Group related hooks at the beginning of the component
- Destructure props and state for clarity
- Extract complex logic into custom hooks

```tsx
// Example component structure
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useCustomHook } from '@/hooks/useCustomHook';

interface ComponentProps {
  title: string;
  onAction: () => void;
}

export function ExampleComponent({ title, onAction }: ComponentProps) {
  // Hooks
  const [state, setState] = useState<string>('');
  const router = useRouter();
  const { data, loading } = useCustomHook();
  
  // Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // Event handlers
  const handleClick = () => {
    setState('new value');
    onAction();
  };
  
  // Conditional rendering
  if (loading) {
    return <LoadingSpinner />;
  }
  
  // JSX
  return (
    <div>
      <h1>{title}</h1>
      <p>{state}</p>
      <button onClick={handleClick}>Click me</button>
    </div>
  );
}
```

### Data Fetching

- Use server components for data fetching when possible
- For client components, use React Query or SWR for data fetching and caching
- Handle loading and error states explicitly

```tsx
// Server Component example
import { db } from '@/lib/db';

export default async function PostPage({ params }: { params: { id: string } }) {
  const post = await db.post.findUnique({ where: { id: params.id } });
  
  if (!post) {
    return <div>Post not found</div>;
  }
  
  return <PostDisplay post={post} />;
}

// Client Component example
import { useQuery } from '@tanstack/react-query';
import { fetchPost } from '@/lib/api';

function PostClient({ id }: { id: string }) {
  const { data: post, isLoading, error } = useQuery({
    queryKey: ['post', id],
    queryFn: () => fetchPost(id),
  });
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!post) return <NotFound />;
  
  return <PostDisplay post={post} />;
}
```

### State Management

- Use React's built-in state management (useState, useReducer) for component-level state
- Use Context API for sharing state between related components
- Use Zustand for global application state
- Avoid prop drilling by using composition or context

```tsx
// Component state
const [count, setCount] = useState(0);

// Complex state with useReducer
const [state, dispatch] = useReducer(reducer, initialState);

// Context for shared state
export const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

// Zustand for global state
import { create } from 'zustand';

interface StoreState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export const useStore = create<StoreState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));
```

## CSS and Styling

### Tailwind CSS

- Use Tailwind CSS for styling components
- Follow responsive design principles (mobile-first approach)
- Use Tailwind's utility classes for layout, spacing, typography, and colors
- Extract common patterns to components or apply utility classes directly

```tsx
// Example of Tailwind usage
<button
  className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 
             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
             disabled:opacity-50 disabled:cursor-not-allowed
             transition-colors duration-200"
  disabled={isLoading}
>
  {isLoading ? 'Loading...' : 'Submit'}
</button>
```

### Component Variants

- Use cva (class-variance-authority) for component variants
- Define consistent API for component variations

```tsx
// Button component with variants
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  "px-4 py-2 rounded-md transition-colors duration-200 font-medium",
  {
    variants: {
      intent: {
        primary: "bg-blue-500 text-white hover:bg-blue-600",
        secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
        danger: "bg-red-500 text-white hover:bg-red-600",
      },
      size: {
        sm: "text-sm px-2 py-1",
        md: "text-base px-4 py-2",
        lg: "text-lg px-6 py-3",
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "md",
    },
  }
);

interface ButtonProps extends 
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
}

export function Button({ intent, size, className, children, ...props }: ButtonProps) {
  return (
    <button
      className={buttonVariants({ intent, size, className })}
      {...props}
    >
      {children}
    </button>
  );
}
```

## Form Handling

### Form Validation

- Use Zod for schema validation
- Integrate with React Hook Form for form state management
- Provide detailed error messages for validation failures

```tsx
// Form with validation
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormValues = z.infer<typeof formSchema>;

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });
  
  const onSubmit = (data: FormValues) => {
    // Handle form submission
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" {...register('email')} />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}
      </div>
      
      <div>
        <label htmlFor="password">Password</label>
        <input id="password" type="password" {...register('password')} />
        {errors.password && <p className="text-red-500">{errors.password.message}</p>}
      </div>
      
      <button type="submit">Login</button>
    </form>
  );
}
```

## Error Handling

### Error Boundaries

- Use Error Boundaries to catch and handle runtime errors
- Create fallback UIs for error states
- Log errors for debugging and monitoring

```tsx
// Error Boundary Component
import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to monitoring service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
```

### API Error Handling

- Define consistent error response structure
- Handle different error types appropriately
- Provide user-friendly error messages

```typescript
// API error handling
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

async function fetchWithErrorHandling<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(`API Error: ${errorData.message}`);
    }
    
    return await response.json() as T;
  } catch (error) {
    // Log error
    logger.error('API request failed', { url, error });
    
    // Re-throw for component handling
    throw error;
  }
}
```

## Testing Standards

### Unit Testing

- Use Jest for unit testing
- Test all utility functions, hooks, and small components
- Mock external dependencies
- Focus on testing behavior, not implementation details

```typescript
// Unit test example
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  test('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });
  
  test('calls onClick handler when clicked', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  test('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Integration Testing

- Test how components work together
- Focus on user workflows and features
- Use React Testing Library for component testing

```typescript
// Integration test example
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';
import { AuthProvider } from '@/contexts/AuthContext';

describe('LoginForm', () => {
  test('submits form with valid data', async () => {
    const mockLogin = jest.fn();
    
    render(
      <AuthProvider login={mockLogin}>
        <LoginForm />
      </AuthProvider>
    );
    
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));
    
    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });
  
  test('shows validation errors for invalid data', async () => {
    render(<LoginForm />);
    
    await userEvent.type(screen.getByLabelText(/email/i), 'invalid-email');
    await userEvent.type(screen.getByLabelText(/password/i), 'short');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));
    
    expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
  });
});
```

### End-to-End Testing

- Use Cypress for end-to-end testing
- Test critical user flows across the application
- Test in environments as close to production as possible

```typescript
// Cypress E2E test example
describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/');
  });
  
  it('allows users to login', () => {
    cy.get('[data-testid=login-button]').click();
    cy.get('input[name=email]').type('test@example.com');
    cy.get('input[name=password]').type('password123{enter}');
    
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid=user-menu]').should('contain', 'Test User');
  });
  
  it('shows validation errors for invalid login', () => {
    cy.get('[data-testid=login-button]').click();
    cy.get('input[name=email]').type('invalid-email');
    cy.get('input[name=password]').type('short{enter}');
    
    cy.get('[data-testid=form-error]').should('be.visible');
    cy.url().should('include', '/login');
  });
});
```

## Documentation

### Code Comments

- Use JSDoc for documenting functions, classes, and interfaces
- Document complex algorithms and business logic
- Avoid obvious comments that don't add value

```typescript
/**
 * Calculates the user's reading progress for a story.
 * 
 * @param {Story} story - The story object
 * @param {UserProgress} progress - The user's reading progress data
 * @returns {number} Progress percentage from 0 to 100
 * 
 * @example
 * const progress = calculateReadingProgress(story, userProgress);
 * console.log(`You've read ${progress}% of the story`);
 */
function calculateReadingProgress(story: Story, progress: UserProgress): number {
  // Implementation
}
```

### Component Documentation

- Document all components with description, props, and examples
- Use Storybook for living documentation

```typescript
/**
 * Card component for displaying content in a contained box.
 * 
 * @component
 * @example
 * <Card
 *   title="Card Title"
 *   footer={<Button>Action</Button>}
 * >
 *   <p>Card content goes here</p>
 * </Card>
 */
export interface CardProps {
  /** The card's title displayed at the top */
  title?: string;
  /** Main content of the card */
  children: React.ReactNode;
  /** Optional footer for actions */
  footer?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function Card({ title, children, footer, className }: CardProps) {
  // Implementation
}
```

## Performance

### Code Optimization

- Use React.memo for pure components that render often
- Optimize re-renders with useCallback and useMemo for expensive computations or object creation
- Use proper key props for lists to optimize rendering
- Avoid unnecessary re-renders by stabilizing props and dependencies

```typescript
// Optimized component example
import { memo, useCallback, useMemo } from 'react';

interface ItemProps {
  data: ItemData;
  onSelect: (id: string) => void;
}

export const Item = memo(function Item({ data, onSelect }: ItemProps) {
  const handleClick = useCallback(() => {
    onSelect(data.id);
  }, [data.id, onSelect]);
  
  const formattedData = useMemo(() => {
    // Expensive calculation or formatting
    return transformData(data);
  }, [data]);
  
  return (
    <div onClick={handleClick}>
      <h3>{data.title}</h3>
      <p>{formattedData.description}</p>
    </div>
  );
});

// Usage in list
function ItemList({ items }: { items: ItemData[] }) {
  const handleSelect = useCallback((id: string) => {
    // Handle selection
  }, []);
  
  return (
    <div>
      {items.map((item) => (
        <Item 
          key={item.id} 
          data={item} 
          onSelect={handleSelect} 
        />
      ))}
    </div>
  );
}
```

### Rendering Optimizations

- Use Next.js Image component for optimized images
- Implement lazy loading for components not needed on initial render
- Virtualize long lists with react-virtualized or react-window

```typescript
// Lazy loading example
import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false,
});

// Virtualized list example
import { FixedSizeList } from 'react-window';

function VirtualizedList({ items }: { items: string[] }) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      {items[index]}
    </div>
  );
  
  return (
    <FixedSizeList
      height={500}
      width="100%"
      itemCount={items.length}
      itemSize={35}
    >
      {Row}
    </FixedSizeList>
  );
}
```

## Security

### Input Validation

- Validate all user inputs on both client and server sides
- Use Zod or similar libraries for schema validation
- Sanitize HTML content to prevent XSS attacks

```typescript
// Input validation example
import { z } from 'zod';
import DOMPurify from 'dompurify';

const userInputSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(1000),
});

function processUserInput(input: unknown) {
  // Validate structure and types
  const result = userInputSchema.safeParse(input);
  
  if (!result.success) {
    throw new Error('Invalid input');
  }
  
  // Sanitize HTML content
  const sanitizedMessage = DOMPurify.sanitize(result.data.message);
  
  // Process validated and sanitized input
  return {
    ...result.data,
    message: sanitizedMessage,
  };
}
```

### Authentication and Authorization

- Use NextAuth.js for secure authentication
- Implement proper role-based access control
- Use HttpOnly cookies for storing sensitive data
- Protect API routes and server actions

```typescript
// Protected API route
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Check for specific permissions if needed
  if (session.user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }
  
  // Continue with authorized request
  return NextResponse.json({ data: 'Protected data' });
}
```

## Code Reviews

### Review Process

All code contributions must go through a review process:

1. Create a pull request with a clear description of changes
2. Ensure all tests pass and there are no linting errors
3. Request review from at least one team member
4. Address all feedback and comments
5. Merge only after approval from reviewer(s)

### Review Checklist

Reviewers should check for:

- Code meets all the standards in this document
- Proper test coverage for new code
- No security vulnerabilities
- Performance implications are considered
- Documentation is updated as necessary
- No commented-out code or debug logs
- Code is DRY and follows SOLID principles

## Tooling

### Code Formatting

- Use Prettier for automatic code formatting
- Configure ESLint for static code analysis
- Use TypeScript for type checking

### Git Workflow

- Follow conventional commits format
- Keep pull requests focused on a single feature or bug fix
- Write descriptive commit messages
- Rebase and squash commits before merging

### CI/CD

- All code must pass automated tests before merging
- Run linting, type checking, and tests in CI pipeline
- Automate deployment process

## Conclusion

Following these coding standards ensures that The Story Teller application remains maintainable, scalable, and of high quality. All developers working on the project are expected to adhere to these standards.

## Relation to Other Documentation

This coding standards document connects to:

- **Architecture Documentation**: For understanding the overall system design
- **Build Process**: For information on how to build and deploy the application
- **Component Library**: For reference implementations of UI components
- **Team Workflow**: For understanding the development process 