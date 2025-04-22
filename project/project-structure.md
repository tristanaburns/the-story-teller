# The Story Teller: Project Structure

This document outlines the project structure for The Story Teller application. It provides details on how the codebase is organized, the purpose of each directory, and the architectural design of the application.

## Directory Structure Overview

```
the-story-teller/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication API
│   │   ├── stories/              # Story management API
│   │   │   └── [storyId]/        # Story-specific API routes
│   │   └── ai/                   # AI integration API
│   ├── auth/                     # Authentication pages
│   ├── dashboard/                # Dashboard pages
│   ├── stories/                  # Story management pages
│   │   └── [id]/                 # Story detail pages
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   └── page.tsx                  # Homepage
│
├── components/                   # React components
│   ├── ui/                       # UI components
│   ├── forms/                    # Form components
│   ├── editor/                   # Content editor components
│   ├── visualization/            # Data visualization components
│   └── ai/                       # AI-related components
│
├── lib/                          # Utility functions
│   ├── mongodb.ts                # MongoDB connection utilities for application data
│   ├── auth-mongodb.ts           # Deprecated re-export for backward compatibility
│   ├── user-db.ts                # User-specific database management
│   ├── auth/                     # Authentication-related utilities
│   │   └── index.ts              # Central exports for auth functionality
│   ├── auth.ts                   # Authentication utilities
│   └── ai.ts                     # AI integration utilities
│
├── types/                        # TypeScript type definitions
│   ├── story.ts                  # Story-related types
│   ├── character.ts              # Character-related types
│   ├── location.ts               # Location-related types
│   └── timeline.ts               # Timeline-related types
│
├── public/                       # Static assets
│
├── database_schemas/             # JSON schemas for MongoDB validation
│   ├── character/
│   ├── location/
│   ├── timeline/
│   └── common/
│
├── AI_INSTRUCTION_TEMPLATES/     # Templates for AI prompts
│
├── CONTENT/                      # Sample content
│
├── documentation/                # Project documentation
│
├── .env.local.example            # Environment variables template
├── .gitignore                    # Git ignore file
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies
├── postcss.config.js             # PostCSS configuration
├── tailwind.config.js            # Tailwind CSS configuration
└── tsconfig.json                 # TypeScript configuration
```

## Core Application Structure

### App Directory (Next.js App Router)

The `app` directory follows Next.js 13+ App Router architecture, which uses file-system based routing and React Server Components.

#### Key Directories:

- **api/**: Server-side API routes
  - **auth/**: Authentication API endpoints (handled by NextAuth.js)
  - **stories/**: Story management API endpoints
  - **ai/**: API endpoints for AI integration with OpenAI

- **auth/**: Authentication-related pages
  - **signin/**: Sign-in page with OAuth providers

- **dashboard/**: User dashboard pages
  - **page.tsx**: Main dashboard view listing user's stories

- **stories/**: Story management pages
  - **new/**: New story creation page
  - **[id]/**: Dynamic routes for individual stories
    - **characters/**: Character management for a specific story
    - **locations/**: Location management for a specific story
    - **timeline/**: Timeline management for a specific story
    - **editor/**: Content editor for a specific story

### Components Directory

The `components` directory contains reusable React components organized by function:

- **ui/**: Basic UI components (buttons, cards, inputs, etc.)
- **forms/**: Form components for data entry
- **editor/**: Components related to the content editor
- **visualization/**: Data visualization components (graphs, timelines, etc.)
- **ai/**: Components related to AI integration

### Lib Directory

The `lib` directory contains utility functions and services:

- **mongodb.ts**: MongoDB connection utilities for application data
- **auth-mongodb.ts**: Deprecated re-export for backward compatibility
- **user-db.ts**: User-specific database management
- **auth/**: Authentication-related utilities
  - **index.ts**: Central exports for auth functionality
  - **options.ts**: NextAuth.js configuration
  - **session.ts**: Session utility functions
  - **mongodb.ts**: Dedicated MongoDB connection for AuthJS authentication
- **ai.ts**: AI integration utilities

### Types Directory

The `types` directory contains TypeScript type definitions:

- **story.ts**: Types for story data
- **character.ts**: Types for character data
- **location.ts**: Types for location data
- **timeline.ts**: Types for timeline data

### Existing Project Structure Integration

The application is built around the existing project structure:

- **database_schemas/**: JSON schemas for MongoDB validation
- **AI_INSTRUCTION_TEMPLATES/**: Templates for AI prompts
- **CONTENT/**: Sample content for the application
- **documentation/**: Project documentation

## Architecture Overview

### Frontend Architecture

The application follows a component-based architecture using React and Next.js:

1. **Pages**: Defined by the App Router file system
2. **Components**: Reusable UI elements
3. **Hooks**: Custom React hooks for shared logic
4. **Context**: React Context API for state management across components

### Backend Architecture

The backend is implemented using Next.js API routes:

1. **API Routes**: Server-side endpoints for data operations
2. **Database Access**: MongoDB Atlas for data storage
3. **Authentication**: NextAuth.js for OAuth integration
4. **Middleware**: Request validation and authentication checking

### Database Architecture

Each user has their own MongoDB database with collections for:

1. **metadata**: User metadata
2. **stories**: Stories collection
3. **characters**: Characters in stories
4. **locations**: Locations in stories
5. **timelines**: Timelines for stories
6. **events**: Events in the storylines

### Authentication Flow

1. User initiates sign-in with Google or GitHub
2. NextAuth.js handles OAuth flow using dedicated auth-mongodb client
3. Auth data is stored in separate MongoDB collections from application data
4. On successful authentication, a session is created
5. User-specific database is created if it doesn't exist using the application MongoDB client
6. User is redirected to the dashboard

### Data Flow

1. **User Interface**: React components render UI
2. **API Requests**: UI components make requests to API routes
3. **API Handlers**: Process requests and interact with the database
4. **Database Operations**: Perform CRUD operations on MongoDB
5. **Response**: Data is returned to the UI components
6. **State Update**: UI components update their state with the new data

### AI Integration Flow

1. Custom GPT makes requests to the AI integration API
2. API validates the request and authentication
3. Database operations are performed based on the request
4. Response is sent back to the custom GPT
5. The custom GPT processes the response and generates content
6. Content is validated against schemas and stored in the database

## Component Structure

### UI Components

UI components follow a modular structure:

```typescript
// Example: Button component
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
}) => {
  // Component implementation
};
```

### Page Components

Page components connect to data sources and integrate UI components:

```typescript
// Example: Story listing page
export default function StoriesPage() {
  const { data: stories, isLoading, error } = useSWR('/api/stories', fetcher);

  if (isLoading) return <Loading />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div>
      <h1>Your Stories</h1>
      <StoryGrid stories={stories} />
    </div>
  );
}
```

### API Route Structure

API routes follow a consistent pattern:

```typescript
// Example: GET /api/stories endpoint
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const userDb = await getUserDb(userId);
    
    const stories = await userDb.collection('stories').find({}).toArray();
    
    return NextResponse.json(stories);
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 });
  }
}
```

## Database Schema Examples

### Story Schema

```json
{
  "title": "string",
  "description": "string",
  "coverImage": "string?",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "userId": "string",
  "content": "string",
  "status": "enum: ['draft', 'published', 'archived']",
  "metadata": {
    "genre": "string?",
    "setting": "string?",
    "timeline": "string?",
    "tags": ["string"]
  }
}
```

### Character Schema

```json
{
  "id": "string",
  "storyId": "string",
  "name": "string",
  "full_name": "string?",
  "type": "enum: ['protagonist', 'antagonist', 'supporting', 'minor']",
  "status": "enum: ['alive', 'deceased', 'unknown']",
  "description": "string",
  "physical_appearance": {
    "height": "string?",
    "build": "string?",
    "distinctive_features": ["string"],
    "typical_attire": "string?"
  },
  "personality": {
    "traits": ["string"],
    "values": ["string"],
    "motivations": ["string"]
  },
  "relationships": [
    {
      "character_id": "string",
      "relationship_type": "string",
      "dynamics": "string"
    }
  ]
}
```

## Environment Configuration

The application uses environment variables for configuration:

```
# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/your-database?retryWrites=true&w=majority

# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# API Key for AI Integration
AI_API_KEY=your-custom-api-key-for-openai-integration
```

## Deployment Architecture

The application is designed for deployment on Vercel:

1. **Next.js Application**: Deployed on Vercel
2. **Database**: MongoDB Atlas for database hosting
3. **Environment Variables**: Configured in Vercel dashboard
4. **CI/CD**: Automated deployment on commits to main branch
5. **Domain**: Custom domain configuration in Vercel
6. **SSL**: Automatic SSL certificate management by Vercel

## Development Workflow

1. **Local Development**: Use `npm run dev` to start development server
2. **Testing**: Run tests with `npm test`
3. **Linting**: Ensure code quality with `npm run lint`
4. **Build**: Create production build with `npm run build`
5. **Deployment**: Automatic deployment on push to main branch

## Conclusion

This project structure provides a scalable and maintainable architecture for The Story Teller application. It leverages modern technologies like Next.js and MongoDB while integrating with the existing schema-driven approach for narrative content management.
