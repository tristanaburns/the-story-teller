# The Story Teller - Next.js Application

This is the Next.js application for The Story Teller, an advanced narrative schema system for AI-assisted storytelling.

## Features

- **Authentication**: Login with Google or GitHub accounts
- **User-Specific MongoDB Databases**: Each user gets their own MongoDB database for their stories
- **Schema-Driven Structure**: Built around the existing JSON schemas
- **AI Integration**: API endpoint for OpenAI's custom GPT to perform CRUD operations
- **Markdown Support**: Story content is stored in markdown format for rich text display

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- MongoDB Atlas account
- Google OAuth credentials
- GitHub OAuth credentials

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/the-story-teller.git
   cd the-story-teller
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Configure environment variables
   ```
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add your:
   - MongoDB connection string
   - NextAuth secret
   - Google OAuth credentials
   - GitHub OAuth credentials
   - Custom API key for AI integration

4. Run the development server
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/app` - Next.js App Router
  - `/api` - API routes
    - `/auth` - Authentication API
    - `/stories` - Story management API
    - `/ai` - OpenAI integration API
  - `/auth` - Authentication pages
  - `/dashboard` - User dashboard
  - `/stories` - Story management pages

- `/components` - React components
- `/lib` - Utility functions
  - `mongodb.ts` - MongoDB connection
  - `user-db.ts` - User database management

## MongoDB Structure

Each user gets their own MongoDB database with the following collections:

- `metadata` - User metadata
- `stories` - Stories collection
- `characters` - Characters in stories
- `locations` - Locations in stories
- `timelines` - Timelines for stories
- `events` - Events in the storylines

## API Endpoints

### Stories API

- `GET /api/stories` - Get all stories for the current user
- `POST /api/stories` - Create a new story

### AI Integration API

- `POST /api/ai` - Endpoint for AI to perform CRUD operations
  - Required headers: `Authorization: Bearer YOUR_AI_API_KEY`
  - Required body: `{ userId, operation, collection, document?, query?, update? }`

## Deployment

This application is configured for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables in the Vercel dashboard
3. Deploy

## License

See the LICENSE file for details.
