# The Story Teller: Core Modules

*Last Updated: 2025-04-22*

This document outlines the core modules of The Story Teller application, explaining their purpose, functionality, and how they interact with each other.

## Authentication Module

The authentication module handles user authentication, authorization, and session management.

### Key Components

- **AuthProvider** (`components/auth/AuthProvider.tsx`): Context provider that manages authentication state throughout the application.
- **LoginForm** (`components/auth/LoginForm.tsx`): Component for user login with email/password and social authentication options.
- **RegisterForm** (`components/auth/RegisterForm.tsx`): Component for new user registration.
- **useAuth** (`hooks/auth/useAuth.ts`): Custom hook for accessing authentication state and methods.

### Main Features

- User registration and login
- Social authentication (Google, GitHub)
- Password reset functionality
- Session persistence
- Role-based access control

### API Endpoints

- `/api/auth/login`: Handles user login
- `/api/auth/register`: Handles user registration
- `/api/auth/logout`: Handles user logout
- `/api/auth/reset-password`: Handles password reset

## Story Management Module

The story management module is the core of the application, handling the creation, editing, and organization of stories.

### Key Components

- **StoryEditor** (`components/editor/Editor.tsx`): Rich text editor for creating and editing stories.
- **StoryList** (`components/stories/StoryList.tsx`): Component for displaying and managing lists of stories.
- **StoryCard** (`components/stories/StoryCard.tsx`): Card component for displaying story previews.
- **useStories** (`hooks/stories/useStories.ts`): Hook for fetching and managing story data.

### Main Features

- Story creation and editing
- Chapter and scene organization
- Auto-saving functionality
- Rich text formatting
- Story categorization and tagging

### API Endpoints

- `/api/stories`: CRUD operations for stories
- `/api/stories/[id]`: Operations on a specific story
- `/api/stories/[id]/chapters`: CRUD operations for chapters
- `/api/stories/[id]/tags`: Operations for managing story tags

## Character Management Module

The character management module handles the creation and organization of characters within stories.

### Key Components

- **CharacterForm** (`components/characters/CharacterForm.tsx`): Form for creating and editing characters.
- **CharacterList** (`components/characters/CharacterList.tsx`): Component for displaying character lists.
- **CharacterProfile** (`components/characters/CharacterProfile.tsx`): Detailed character profile view.
- **useCharacters** (`hooks/characters/useCharacters.ts`): Hook for character data management.

### Main Features

- Character creation and editing
- Character attributes and traits
- Character relationships
- Character timeline integration
- Character image management

### API Endpoints

- `/api/characters`: CRUD operations for characters
- `/api/characters/[id]`: Operations on a specific character
- `/api/characters/[id]/relationships`: Manage character relationships

## World Building Module

The world building module manages locations, maps, and other world-building elements.

### Key Components

- **LocationEditor** (`components/locations/LocationEditor.tsx`): Editor for creating and managing locations.
- **MapViewer** (`components/locations/MapViewer.tsx`): Interactive map viewer component.
- **WorldElement** (`components/world/WorldElement.tsx`): Component for world-building elements.
- **useLocations** (`hooks/locations/useLocations.ts`): Hook for location data management.

### Main Features

- Location creation and management
- Interactive maps
- Cultural and historical elements
- World rules and systems
- Location relationships and hierarchies

### API Endpoints

- `/api/locations`: CRUD operations for locations
- `/api/maps`: Operations for map management
- `/api/world-elements`: CRUD for world-building elements

## Timeline Module

The timeline module handles the chronological organization of story events.

### Key Components

- **TimelineView** (`components/timeline/TimelineView.tsx`): Visual timeline display component.
- **EventCard** (`components/timeline/EventCard.tsx`): Component for displaying timeline events.
- **EventEditor** (`components/timeline/EventEditor.tsx`): Editor for timeline events.
- **useTimeline** (`hooks/timeline/useTimeline.ts`): Hook for timeline data management.

### Main Features

- Visual timeline creation
- Event management
- Character and location linking
- Parallel timeline support
- Timeline filtering and organization

### API Endpoints

- `/api/timelines`: CRUD operations for timelines
- `/api/timelines/[id]/events`: Manage events within a timeline
- `/api/events`: CRUD operations for events

## Dashboard Module

The dashboard module provides user-specific overview and analytics.

### Key Components

- **DashboardOverview** (`components/dashboard/DashboardOverview.tsx`): Main dashboard component.
- **StatsCard** (`components/dashboard/StatsCard.tsx`): Card for displaying user statistics.
- **RecentActivity** (`components/dashboard/RecentActivity.tsx`): Component showing recent user activity.
- **useDashboard** (`hooks/dashboard/useDashboard.ts`): Hook for dashboard data.

### Main Features

- Story statistics and analytics
- Recent activity tracking
- Progress visualization
- Quick access to recent stories
- Writing goals and achievements

### API Endpoints

- `/api/dashboard/stats`: Retrieve user statistics
- `/api/dashboard/activity`: Get recent user activity
- `/api/dashboard/goals`: Manage writing goals

## User Profile Module

The user profile module handles user settings and profile management.

### Key Components

- **ProfileForm** (`components/profile/ProfileForm.tsx`): Form for editing user profile.
- **SettingsPanel** (`components/profile/SettingsPanel.tsx`): User settings configuration.
- **ProfileHeader** (`components/profile/ProfileHeader.tsx`): Profile display component.
- **useProfile** (`hooks/profile/useProfile.ts`): Hook for profile data management.

### Main Features

- Profile information management
- Application preferences
- Notification settings
- Theme customization
- Privacy controls

### API Endpoints

- `/api/users/[id]`: CRUD operations for user profiles
- `/api/users/[id]/settings`: Manage user settings
- `/api/users/[id]/preferences`: Manage user preferences

## AI Assistance Module

The AI assistance module provides AI-powered writing tools and suggestions.

### Key Components

- **AIAssistant** (`components/ai/AIAssistant.tsx`): Main AI assistant interface.
- **SuggestionPanel** (`components/ai/SuggestionPanel.tsx`): Panel for displaying AI suggestions.
- **PromptLibrary** (`components/ai/PromptLibrary.tsx`): Library of AI prompts.
- **useAI** (`hooks/ai/useAI.ts`): Hook for AI functionality.

### Main Features

- Plot suggestions
- Character development assistance
- Dialogue generation
- World-building prompts
- Style analysis and suggestions
- Consistency checking

### API Endpoints

- `/api/ai/generate`: Generate AI content
- `/api/ai/analyze`: Analyze story content
- `/api/ai/suggestions`: Get AI-powered suggestions

## Sharing and Collaboration Module

The sharing and collaboration module enables multi-user collaboration on stories.

### Key Components

- **SharingControls** (`components/sharing/SharingControls.tsx`): Controls for sharing settings.
- **CollaboratorList** (`components/sharing/CollaboratorList.tsx`): List of collaborators.
- **CommentThread** (`components/sharing/CommentThread.tsx`): Comment thread component.
- **useCollaboration** (`hooks/sharing/useCollaboration.ts`): Hook for collaboration features.

### Main Features

- Story sharing with specific users
- Public/private story settings
- Collaborative editing
- Commenting and feedback
- Version control and change tracking

### API Endpoints

- `/api/stories/[id]/sharing`: Manage sharing settings
- `/api/stories/[id]/collaborators`: Manage collaborators
- `/api/stories/[id]/comments`: CRUD for comments

## Export and Publishing Module

The export and publishing module handles exporting stories in various formats and publishing capabilities.

### Key Components

- **ExportOptions** (`components/export/ExportOptions.tsx`): Export format options.
- **PublishingSettings** (`components/export/PublishingSettings.tsx`): Settings for publishing.
- **FormatPreview** (`components/export/FormatPreview.tsx`): Preview of formatted exports.
- **useExport** (`hooks/export/useExport.ts`): Hook for export functionality.

### Main Features

- Export to multiple formats (PDF, EPUB, DOCX)
- Print formatting
- Publishing settings
- Format customization
- Metadata management

### API Endpoints

- `/api/export`: Handle export requests
- `/api/publish`: Handle publishing requests
- `/api/templates`: Manage export templates

## Search and Navigation Module

The search and navigation module provides search functionality across the application.

### Key Components

- **SearchBar** (`components/search/SearchBar.tsx`): Main search interface.
- **SearchResults** (`components/search/SearchResults.tsx`): Display for search results.
- **FilterControls** (`components/search/FilterControls.tsx`): Search filtering options.
- **useSearch** (`hooks/search/useSearch.ts`): Hook for search functionality.

### Main Features

- Global search across stories, characters, and locations
- Advanced filtering
- Recent searches
- Search within current story
- Tag-based searching

### API Endpoints

- `/api/search`: Main search endpoint
- `/api/search/suggestions`: Get search suggestions
- `/api/recent-searches`: Manage recent searches

## Notification Module

The notification module handles in-app notifications and alerts.

### Key Components

- **NotificationCenter** (`components/notifications/NotificationCenter.tsx`): Notification management UI.
- **NotificationItem** (`components/notifications/NotificationItem.tsx`): Individual notification display.
- **useNotifications** (`hooks/notifications/useNotifications.ts`): Hook for notification management.

### Main Features

- Real-time notifications
- Notification preferences
- Read/unread status
- Notification categorization
- Action-based notifications

### API Endpoints

- `/api/notifications`: CRUD for notifications
- `/api/notifications/preferences`: Manage notification preferences
- `/api/notifications/mark-read`: Mark notifications as read

## Core UI Module

The core UI module provides the shared UI components used throughout the application.

### Key Components

- **Button** (`components/ui/Button/Button.tsx`): Customizable button component.
- **Input** (`components/ui/Form/Input.tsx`): Form input component.
- **Modal** (`components/ui/Dialog/Dialog.tsx`): Modal dialog component.
- **Dropdown** (`components/ui/Dropdown/Dropdown.tsx`): Dropdown menu component.
- **Tabs** (`components/ui/Tabs/Tabs.tsx`): Tab navigation component.

### Main Features

- Consistent UI elements
- Accessibility compliance
- Responsive design
- Theme integration
- Animation and transitions

## Module Dependencies

The following diagram shows the dependencies between core modules:

```
Authentication Module
    ↑↓
Dashboard Module → Story Management Module ← Export Module
    ↑                ↑↓                        ↑
    └───→ User Profile Module                  │
                      ↑↓                       │
                Character Module               │
                      ↑↓                       │
                  World Building Module        │
                      ↑↓                       │
                  Timeline Module              │
                      ↑                        │
                      └───→ Sharing Module ────┘
                            ↑↓
                      AI Assistance Module
                            ↑
                     Search Module
                            ↑
                   Notification Module
```

All modules depend on the Core UI Module for their interface components.

## Module Integration Points

### Data Flow

1. **Authentication → All Modules**: User authentication state flows to all modules to control access
2. **Story Management → Character/World/Timeline**: Story context propagates to related modules
3. **AI Assistance → Story/Character/World**: AI suggestions integrate with content creation
4. **Dashboard → Multiple Modules**: Aggregates data from various modules

### Event Communication

- Custom events for cross-module communication
- React Context for shared state
- URL parameters for deep linking between modules

## Module Extension Points

Each module provides extension points for future development:

1. **Plugin System**: Hook points for plugin integration
2. **Custom Elements**: Ability to add custom UI elements
3. **API Extensions**: Extensible API endpoints
4. **Middleware Support**: Custom middleware for processing
5. **Theme Extensions**: Custom theming capabilities

## Conclusion

The core modules of The Story Teller application are designed to work together seamlessly while maintaining separation of concerns. This modular architecture enables easier maintenance, testing, and future expansion of functionality. 