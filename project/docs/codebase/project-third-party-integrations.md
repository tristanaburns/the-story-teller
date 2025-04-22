# The Story Teller: Third-Party Integrations

*Last Updated: 2025-04-22*

This document provides a comprehensive overview of all third-party integrations used within The Story Teller application, including configuration details, usage patterns, and implementation considerations.

## Authentication and Authorization

### NextAuth.js

**Purpose**: Handles authentication flows, session management, and integration with OAuth providers.

**Integration Details**:
- **Version**: 4.24.5
- **Configuration File**: `app/api/auth/[...nextauth]/route.ts`
- **Providers Configured**:
  - Email/Password
  - Google OAuth
  - GitHub OAuth

**Implementation Notes**:
- Custom session handling using JWT strategy
- Extended user profile with role-based permissions
- Middleware implementation for protected routes

**Example Configuration**:
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { authConfig } from "@/config/auth";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Authorization logic
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string
    })
  ],
  // Additional configuration options
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

## Database and Storage

### MongoDB

**Purpose**: Primary database for user data, stories, characters, and other entities.

**Integration Details**:
- **Version**: MongoDB 6.0+
- **Client Library**: mongodb 6.3.0
- **Configuration**: `lib/db/connection.ts`

**Implementation Notes**:
- Connection pooling configured for optimal performance
- Mongoose schemas used for data validation
- Indexes on frequently queried fields for performance

**Example Usage**:
```typescript
// lib/db/repositories/StoryRepository.ts
import { connectDB } from "@/lib/db/connection";
import { Story } from "@/models/Story";

export class StoryRepository {
  async findByAuthor(userId: string) {
    await connectDB();
    return Story.find({ author: userId }).sort({ updatedAt: -1 });
  }
  
  async findById(id: string) {
    await connectDB();
    return Story.findById(id);
  }
  
  // Additional methods
}
```

### Amazon S3

**Purpose**: Storage for user-uploaded images and story assets.

**Integration Details**:
- **SDK**: AWS SDK v3 (@aws-sdk/client-s3)
- **Configuration**: `lib/services/s3.ts`

**Implementation Notes**:
- Pre-signed URLs for secure direct uploads
- Image optimization before storage
- Content-Type and metadata handling

**Example Usage**:
```typescript
// lib/services/s3.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
  }
});

export async function getImageUploadUrl(key: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `images/${key}`,
    ContentType: 'image/jpeg'
  });
  
  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

// Additional methods
```

## AI and Machine Learning

### OpenAI API

**Purpose**: Powers story suggestions, character development, and AI assistant functionality.

**Integration Details**:
- **SDK**: openai 4.12.0
- **Models Used**: GPT-4, GPT-3.5-Turbo, DALL-E 3
- **Configuration**: `lib/services/openai.ts`

**Implementation Notes**:
- Rate limiting and usage tracking
- Retry logic for API failures
- Content moderation for generated text

**Example Usage**:
```typescript
// lib/services/openai.ts
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateStoryIdea(genre: string, theme: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a creative writing assistant." },
        { role: "user", content: `Generate a story idea for a ${genre} story with the theme: ${theme}` }
      ],
      max_tokens: 500
    });
    
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate story idea');
  }
}

// Additional methods for character generation, etc.
```

### Everart MCP (Model Context Protocol)

**Purpose**: Specialized AI capabilities for creative writing, character visualization, and worldbuilding.

**Integration Details**:
- **Client Library**: everart-mcp-client 1.0.5
- **Configuration**: `lib/services/mcp.ts`

**Implementation Notes**:
- Websocket connection for streaming responses
- Custom prompt templates for creative writing
- Asset generation and management

**Example Usage**:
```typescript
// lib/services/mcp.ts
import { MCPClient } from 'everart-mcp-client';

const mcpClient = new MCPClient({
  apiKey: process.env.EVERART_MCP_API_KEY,
  endpoint: process.env.EVERART_MCP_ENDPOINT
});

export async function generateCharacterImage(description: string) {
  try {
    const response = await mcpClient.generateImage({
      prompt: `Character portrait: ${description}`,
      size: "1024x1024",
      style: "realistic"
    });
    
    return response.imageUrl;
  } catch (error) {
    console.error('MCP API error:', error);
    throw new Error('Failed to generate character image');
  }
}

// Additional methods
```

## UI and Components

### Tailwind CSS

**Purpose**: Utility-first CSS framework for styling components.

**Integration Details**:
- **Version**: 3.3.3
- **Configuration**: `tailwind.config.js`
- **Custom Theme**: `styles/theme.js`

**Implementation Notes**:
- Custom color scheme and typography
- Responsive design utilities
- Dark mode support

**Example Configuration**:
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          // Additional shades
        },
        secondary: {
          // Color shades
        },
        // Additional custom colors
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif']
      },
      // Additional customizations
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms')
  ]
};
```

### Radix UI

**Purpose**: Unstyled, accessible components for building high-quality UIs.

**Integration Details**:
- **Version**: Various (@radix-ui/react-*)
- **Components Used**: Dialog, Dropdown Menu, Slider, Tabs, etc.

**Implementation Notes**:
- Custom styling with Tailwind CSS
- Accessibility compliance
- Animation integration

**Example Usage**:
```tsx
// components/ui/Dialog.tsx
import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = ({
  className,
  children,
  ...props
}: DialogPrimitive.DialogPortalProps) => (
  <DialogPrimitive.Portal className={cn(className)} {...props}>
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {children}
    </div>
  </DialogPrimitive.Portal>
);

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-all duration-100 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

// Additional components and exports
```

### React DnD

**Purpose**: Drag and drop functionality for story organization and timeline management.

**Integration Details**:
- **Version**: 16.0.1
- **Configuration**: `lib/dnd/index.ts`

**Implementation Notes**:
- Custom drag preview components
- Touch device support
- Performance optimizations

**Example Usage**:
```tsx
// components/story/StoryOrganizer.tsx
import { useDrag, useDrop } from 'react-dnd';
import { ItemTypes } from '@/lib/dnd/itemTypes';

const ChapterItem = ({ chapter, index, moveChapter }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CHAPTER,
    item: { id: chapter.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemTypes.CHAPTER,
    hover: (item, monitor) => {
      // Drag and drop logic
    },
  });

  return (
    <div 
      ref={(node) => drag(drop(node))}
      className={`p-4 mb-2 bg-white rounded shadow ${isDragging ? 'opacity-50' : ''}`}
    >
      <h3>{chapter.title}</h3>
      <p className="text-sm text-gray-600">{chapter.scenes.length} scenes</p>
    </div>
  );
};

// Rest of the component
```

## Text Editing

### Slate.js

**Purpose**: Framework for building rich text editors.

**Integration Details**:
- **Version**: 0.95.0
- **Configuration**: `lib/editor/config.ts`
- **Custom Plugins**: `lib/editor/plugins/`

**Implementation Notes**:
- Custom serialization for HTML and Markdown
- Toolbar integration
- Collaborative editing support

**Example Usage**:
```tsx
// components/editor/TextEditor.tsx
import React, { useMemo, useState } from 'react';
import { createEditor, Descendant } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { EditorToolbar } from './EditorToolbar';
import { withCustomPlugins } from '@/lib/editor/plugins';

interface TextEditorProps {
  initialContent: Descendant[];
  onSave?: (content: Descendant[]) => void;
  autoSave?: boolean;
}

export function TextEditor({ initialContent, onSave, autoSave = false }: TextEditorProps) {
  const [value, setValue] = useState<Descendant[]>(initialContent);
  
  const editor = useMemo(() => {
    const baseEditor = withCustomPlugins(withHistory(withReact(createEditor())));
    return baseEditor;
  }, []);

  // Additional editor logic

  return (
    <div className="border rounded-lg overflow-hidden">
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => {
          setValue(newValue);
          // Auto-save logic
        }}
      >
        <EditorToolbar />
        <div className="p-4">
          <Editable
            className="prose max-w-none focus:outline-none"
            placeholder="Begin your story..."
            spellCheck
            autoFocus
            // Additional props
          />
        </div>
      </Slate>
    </div>
  );
}
```

## Data Visualization

### Visx (by Airbnb)

**Purpose**: Low-level visualization components for custom charts and graphs.

**Integration Details**:
- **Version**: @visx/* packages at 3.5.0
- **Configuration**: `lib/visualization/config.ts`

**Implementation Notes**:
- Custom timeline visualization components
- Character relationship graph visualizations
- Theme integration with application design

**Example Usage**:
```tsx
// components/analytics/WordCountChart.tsx
import React from 'react';
import { Group } from '@visx/group';
import { Bar } from '@visx/shape';
import { scaleLinear, scaleBand } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';

interface WordCountData {
  date: string;
  count: number;
}

interface WordCountChartProps {
  data: WordCountData[];
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}

export function WordCountChart({
  data,
  width,
  height,
  margin = { top: 20, right: 20, bottom: 50, left: 50 }
}: WordCountChartProps) {
  // Chart setup and rendering logic
  
  const xScale = scaleBand<string>({
    range: [0, xMax],
    domain: data.map(d => d.date),
    padding: 0.2
  });
  
  const yScale = scaleLinear<number>({
    range: [yMax, 0],
    domain: [0, Math.max(...data.map(d => d.count))],
    nice: true
  });

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        {/* Chart rendering code */}
        {data.map((d) => {
          const barHeight = yMax - yScale(d.count);
          return (
            <Bar
              key={d.date}
              x={xScale(d.date)}
              y={yMax - barHeight}
              height={barHeight}
              width={xScale.bandwidth()}
              fill="rgba(23, 233, 217, .5)"
            />
          );
        })}
        <AxisLeft scale={yScale} />
        <AxisBottom scale={xScale} top={yMax} />
      </Group>
    </svg>
  );
}
```

## Form Handling and Validation

### Zod

**Purpose**: TypeScript-first schema validation library.

**Integration Details**:
- **Version**: 3.22.4
- **Schema Definitions**: `lib/validation/schemas/`

**Implementation Notes**:
- Shared validation schemas between client and server
- Custom validation error messages
- Integration with form handling

**Example Usage**:
```typescript
// lib/validation/schemas/story.ts
import { z } from 'zod';

export const storySchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be 100 characters or less'),
  description: z.string()
    .max(500, 'Description must be 500 characters or less')
    .optional(),
  genre: z.string()
    .min(1, 'Genre is required'),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  ageRating: z.enum(['G', 'PG', 'PG-13', 'R']).optional()
});

export type StoryFormData = z.infer<typeof storySchema>;

// Server-side validation
export async function validateStoryData(data: unknown) {
  return storySchema.parseAsync(data);
}
```

### React Hook Form

**Purpose**: Form state management and validation.

**Integration Details**:
- **Version**: 7.46.1
- **Configuration**: `hooks/useForm.ts` (custom wrapper)

**Implementation Notes**:
- Integration with Zod for schema validation
- Custom error handling and display
- Form submission handling

**Example Usage**:
```tsx
// components/story/StoryForm.tsx
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { storySchema, StoryFormData } from '@/lib/validation/schemas/story';
import { Button, Input, TextArea, Select } from '@/components/ui';

interface StoryFormProps {
  initialData?: Partial<StoryFormData>;
  onSubmit: (data: StoryFormData) => void;
  isSubmitting?: boolean;
}

export function StoryForm({ initialData = {}, onSubmit, isSubmitting }: StoryFormProps) {
  const { 
    control, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<StoryFormData>({
    resolver: zodResolver(storySchema),
    defaultValues: {
      title: '',
      description: '',
      genre: '',
      isPublic: false,
      ...initialData
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Controller
        name="title"
        control={control}
        render={({ field }) => (
          <Input
            label="Title"
            error={errors.title?.message}
            {...field}
          />
        )}
      />
      
      {/* Additional form fields */}
      
      <Button type="submit" isLoading={isSubmitting}>
        {initialData.title ? 'Update Story' : 'Create Story'}
      </Button>
    </form>
  );
}
```

## Testing Libraries

### Jest

**Purpose**: JavaScript testing framework for unit and integration tests.

**Integration Details**:
- **Version**: 29.7.0
- **Configuration**: `jest.config.js`

**Implementation Notes**:
- Custom test environment setup
- Mock implementations for services
- Test coverage reporting

**Example Configuration**:
```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
    '^@/models/(.*)$': '<rootDir>/models/$1'
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverage: true,
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ]
};

module.exports = createJestConfig(customJestConfig);
```

### Cypress

**Purpose**: End-to-end testing framework.

**Integration Details**:
- **Version**: 13.6.1
- **Configuration**: `cypress.config.ts`

**Implementation Notes**:
- Custom commands for authentication
- Page object models for test organization
- Visual regression testing configuration

**Example Test**:
```typescript
// cypress/e2e/story-creation.cy.ts
describe('Story Creation', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password123');
    cy.visit('/dashboard');
  });

  it('allows user to create a new story', () => {
    // Test steps
    cy.findByText('Create New Story').click();
    
    cy.findByLabelText('Title').type('My Test Story');
    cy.findByLabelText('Description').type('This is a test story created by Cypress');
    cy.findByLabelText('Genre').select('Fantasy');
    
    cy.findByRole('button', { name: 'Create Story' }).click();
    
    // Assertions
    cy.url().should('include', '/stories/');
    cy.findByText('My Test Story').should('be.visible');
    cy.findByText('This is a test story created by Cypress').should('be.visible');
  });
  
  // Additional tests
});
```

## Monitoring and Analytics

### Sentry

**Purpose**: Error tracking and performance monitoring.

**Integration Details**:
- **Version**: @sentry/nextjs 7.80.0
- **Configuration**: `sentry.client.config.js` and `sentry.server.config.js`

**Implementation Notes**:
- Custom error boundaries and error handling
- Performance monitoring for critical operations
- Environment-based configuration

**Example Configuration**:
```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  integrations: [
    new Sentry.BrowserTracing({
      // Additional configuration
    }),
  ],
  // Additional configuration options
});
```

### Plausible Analytics

**Purpose**: Privacy-focused web analytics.

**Integration Details**:
- **Version**: Next.js integration script
- **Configuration**: `components/analytics/Plausible.tsx`

**Implementation Notes**:
- Custom event tracking
- Goal conversion tracking
- GDPR-compliant implementation

**Example Usage**:
```tsx
// components/analytics/Plausible.tsx
export function PlausibleAnalytics() {
  return (
    <>
      <script
        defer
        data-domain="thestoryteller.app"
        src="https://plausible.io/js/script.js"
      ></script>
    </>
  );
}

// Custom event tracking function
export function trackEvent(eventName: string, props?: Record<string, string | number | boolean>) {
  if (window.plausible) {
    window.plausible(eventName, { props });
  }
}
```

## Deployment and Infrastructure

### Vercel

**Purpose**: Deployment platform for Next.js applications.

**Integration Details**:
- **Configuration**: `vercel.json`
- **Environment Variables**: Configured in Vercel dashboard

**Implementation Notes**:
- CI/CD pipeline integration
- Preview deployments for pull requests
- Custom domain configuration

**Example Configuration**:
```json
// vercel.json
{
  "version": 2,
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## Integration Management

### Environmental Variables

The application uses environment variables for managing integration configurations. The following files handle environmental variables:

- `.env.example`: Template for required environment variables
- `.env.local`: Local development environment variables
- `.env.test`: Testing environment variables

Example `.env.example`:

```
# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Database
MONGODB_URI=mongodb://localhost:27017/storyteller

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Storage
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket-name

# Analytics
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=localhost:3000
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# MCP
EVERART_MCP_API_KEY=your-mcp-api-key
EVERART_MCP_ENDPOINT=https://api.everart.io/v1
```

## Security Considerations

When implementing third-party integrations, we follow these security principles:

1. **Principle of Least Privilege**: API keys and access tokens have the minimum permissions necessary.
2. **No Client-Side Secrets**: API keys and secrets are never exposed in client-side code.
3. **Regular Dependency Updates**: Dependencies are regularly updated to address security vulnerabilities.
4. **Rate Limiting**: API requests are rate-limited to prevent abuse.
5. **Input Validation**: All inputs from third-party services are validated before use.

## Relation to Other Documentation

This third-party integrations document connects to:

- **Architecture Documentation**: For understanding how these integrations fit into the overall system design
- **Security Documentation**: For detailed security considerations when using these integrations
- **Environment Setup**: For instructions on configuring the necessary environment variables
- **Core Modules Documentation**: For understanding how these integrations interact with core application modules 