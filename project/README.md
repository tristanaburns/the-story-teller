# The Story Teller

<div align="center">
  <h3>A structured approach to AI-assisted narrative creation</h3>
  <p>Next.js application with MongoDB Atlas and OpenAI integration</p>
</div>

## 🌟 Overview

The Story Teller is an advanced schema-driven web application designed to create rich, consistent narrative content with AI assistance. It combines structured metadata, standardized writing patterns, and comprehensive documentation to enable the creation of complex, interconnected stories while maintaining continuity and quality.

This application is built on the foundation of [The Story Teller schema system](../README.md), implementing a web interface with Next.js, MongoDB Atlas for database management, and OpenAI integration for AI-assisted content generation.

## ✨ Key Features

- **Schema-Driven Development**: Create narratives using structured schemas for characters, locations, events, and more
- **AI-Assisted Content Generation**: Integrate with OpenAI for AI-powered narrative development
- **User-Specific Databases**: Each user gets their own MongoDB database for unlimited story creation
- **Timeline Visualization**: Visualize and manage your story timeline
- **Relationship Mapping**: Track and visualize relationships between narrative elements
- **Content Editor**: Write and edit your story with markdown support
- **Export Options**: Export your stories in various formats
- **MCP Integration**: Enhanced functionality through Model Context Protocol servers

## 🚀 Getting Started

### Prerequisites

1. Node.js 20.x or later
2. MongoDB Atlas account
3. Google and/or GitHub OAuth credentials
4. OpenAI API key (for AI integration)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/the-story-teller.git
   cd the-story-teller
   ```

2. Run the initialization script:
   ```bash
   # On Windows
   .\init-project.ps1
   
   # On macOS/Linux
   ./init-project.sh
   ```

3. Create a `.env.local` file with the following variables:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/your-database?retryWrites=true&w=majority
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-generated-secret
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GITHUB_ID=your-github-client-id
   GITHUB_SECRET=your-github-client-secret
   AI_API_KEY=your-custom-api-key-for-openai-integration
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application

### Setting Up MongoDB Atlas

1. Create a MongoDB Atlas account at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (the free tier is sufficient for development)
3. Create a database user with read/write access
4. Configure network access (allow access from your IP or anywhere for development)
5. Get your connection string and add it to the `.env.local` file

### Setting Up OAuth Providers

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Navigate to "APIs & Services" > "Credentials"
4. Create an OAuth client ID
5. Add authorized JavaScript origins: `http://localhost:3000`
6. Add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
7. Copy the Client ID and Client Secret to your `.env.local` file

#### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set the homepage URL to `http://localhost:3000`
4. Set the authorization callback URL to `http://localhost:3000/api/auth/callback/github`
5. Copy the Client ID and Client Secret to your `.env.local` file

## 📋 Project Structure

```
the-story-teller/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication API
│   │   ├── stories/              # Story management API
│   │   ├── mcp/                  # MCP API routes
│   │   └── ai/                   # AI integration API
│   ├── auth/                     # Authentication pages
│   ├── dashboard/                # Dashboard pages
│   ├── stories/                  # Story management pages
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Homepage
│
├── components/                   # React components
├── lib/                          # Utility functions
├── mcp-servers/                  # MCP server implementations
├── types/                        # TypeScript type definitions
├── public/                       # Static assets
│
├── project/                      # Project documentation
│   ├── project-requirements.md   # Project requirements
│   ├── project-structure.md      # Structure documentation
│   ├── service-deployment-guide.md # Deployment guide
│   ├── test-implementation-plan.md # Testing plan
│   ├── DEVLOG_INDEX.md           # Development log index
│   ├── DEVLOG_INSTRUCTIONS.md    # Development logging guidelines
│   ├── docs/                     # Detailed documentation
│   │   ├── plan/                 # Planning documentation
│   │   │   ├── project-plan-overview.md      # Project overview
│   │   │   ├── project-plan-phases.md        # Implementation phases
│   │   │   ├── project-plan-milestones.md    # Project milestones
│   │   │   ├── project-plan-testing.md       # Testing philosophy
│   │   │   └── project-plan-extensions.md    # Future extensions
│   │   ├── architecture/         # Architecture documentation
│   │   ├── status/               # Status documentation
│   │   └── structure/            # Structure documentation
│   └── devlogs/                  # Individual development log entries
│
├── scripts/                      # Utility scripts
│   ├── create-devlog-entry.ps1   # PowerShell script for creating devlog entries
│   └── create-devlog-entry.sh    # Bash script for creating devlog entries
│
├── database_schemas/             # JSON schemas for MongoDB validation
├── AI_INSTRUCTION_TEMPLATES/     # Templates for AI prompts
├── CONTENT/                      # Sample content
├── documentation/                # Original schema documentation
│
├── .env.local.example            # Environment variables template
├── init-project.ps1              # Windows initialization script
├── init-project.sh               # Unix initialization script
├── package.json                  # Dependencies
└── next.config.js                # Next.js configuration
```

## 💻 Development

### MongoDB Client Architecture

The application uses two separate MongoDB clients:

1. **Application MongoDB Client** (`lib/mongodb.ts`): Used for all application data operations including user databases, stories, characters, etc.

2. **Auth MongoDB Client** (`lib/auth-mongodb.ts`): Dedicated client for AuthJS authentication, ensuring separation of auth operations from application data.

This separation improves security, maintainability, and performance by isolating authentication concerns from application data management.

### Adding Development Log Entries

The project maintains a detailed development log with individual files for each significant change. To add a new entry:

#### Using Scripts

```bash
# On Windows
.\scripts\create-devlog-entry.ps1 -category "feature" -title "My New Feature"

# On macOS/Linux
./scripts/create-devlog-entry.sh feature "My New Feature"
```

#### Manual Creation

1. Create a new file in the `project/devlogs/` directory
2. Name it using the format: `YYYY-MM-DD-HH-MM-category-brief-title.md`
3. Follow the template in [DEVLOG_INSTRUCTIONS.md](./DEVLOG_INSTRUCTIONS.md)
4. Update the DEVLOG_INDEX.md file to include your new entry

See [DEVLOG_INSTRUCTIONS.md](./DEVLOG_INSTRUCTIONS.md) for comprehensive documentation on development logging.

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run end-to-end tests
npm run test:e2e
```

### Linting

```bash
npm run lint
```

### Building for Production

```bash
npm run build
```

### Starting Production Server

```bash
npm start
```

## 🚢 Deployment

The Story Teller is configured for deployment on Vercel:

1. Fork this repository to your GitHub account
2. Create a new project in Vercel and import your GitHub repository
3. Configure environment variables in the Vercel dashboard
4. Deploy

For detailed deployment instructions, see the [Service Deployment Guide](service-deployment-guide.md).

## 🧩 AI Integration

The Story Teller includes an API endpoint for integration with OpenAI's Custom GPT:

1. Create a Custom GPT in OpenAI
2. Add an action with the base URL: `https://your-domain.vercel.app/api/ai`
3. Configure the OpenAPI schema as described in the [Service Deployment Guide](service-deployment-guide.md)
4. Generate an API key and add it to your environment variables

## 📄 Documentation

- [Requirements Overview](docs/requirements/project-requirements-overview.md)
- [Functional Requirements](docs/requirements/functional-requirements.md)
- [Non-Functional Requirements](docs/requirements/non-functional-requirements.md)
- [Technical Requirements](docs/requirements/technical-requirements.md)
- [MCP Server Requirements](docs/requirements/mcp-requirements.md)

## 🧠 Efficient Documentation Navigation

For AI assistants and developers, follow this priority sequence to quickly understand the project:

### Documentation Hierarchy (Most Important First)

1. **Current Status** - Start here for immediate context:
   - [Status Overview](docs/status/project-status-overview.md) - High-level status
   - [In-Progress Items](docs/status/project-status-in-progress.md) - Active work
   - [Planned Items](docs/status/project-status-planned.md) - Upcoming work

2. **Planning Documentation** - For sprint details and feature specifications:
   - [Project Roadmap](docs/planning/project-roadmap.md) - Timeline and goals
   - [Sprint Planning](docs/planning/project-sprint-planning.md) - Current sprint details
   - [Feature Specifications](docs/planning/project-feature-specifications.md) - Detailed feature specs

3. **Project Plan** - For high-level planning:
   - [Project Overview](docs/plan/project-plan-overview.md) - The big picture
   - [Project Milestones](docs/plan/project-plan-milestones.md) - Major achievements
   - [Implementation Phases](docs/plan/project-plan-phases.md) - Detailed phases

4. **Requirements** - For detailed specifications:
   - [Requirements Overview](docs/requirements/project-requirements-overview.md) - High-level requirements
   - [Functional Requirements](docs/requirements/functional-requirements.md) - What the system does
   - [Technical Requirements](docs/requirements/technical-requirements.md) - How the system works

See [ai-coding-assistant-project-instructions.md](ai-coding-assistant-project-instructions.md) for comprehensive guidance on understanding and contributing to the project efficiently.

### Current Focus

As of the last update, the project is focused on:

1. **Core Editor Functionality** - Rich text editing, chapter navigation, autosave
2. **Character Management System** - Profile components, data models, relationship mapping
3. **Upcoming** - Location management, timeline visualization, AI assistance

When assisting with development, always check the status documents first to understand the current state before diving into other documentation.

## 🧑‍💻 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request
6. Document your changes by creating a devlog entry: `./scripts/create-devlog-entry.sh feature "Your Amazing Feature"`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🙏 Acknowledgments

- The original Story Teller schema system creators
- Next.js team for the amazing framework
- MongoDB team for the database platform
- OpenAI for the AI capabilities
- MCP server implementers for enhanced functionality

---

<div align="center">
  Created with ❤️ for storytellers everywhere
</div>
