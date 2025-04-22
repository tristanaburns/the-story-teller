# The Story Teller: Module Structure

*Last Updated: 2025-04-22*

This document outlines the structure and organization of functional modules within The Story Teller application, explaining how modules are designed, their interactions, and integration points.

## Module Architecture Principles

The Story Teller application follows these modular architecture principles:

1. **High Cohesion**: Related functionality is grouped together within modules
2. **Low Coupling**: Modules interact through well-defined interfaces
3. **Single Responsibility**: Each module has a clear, focused purpose
4. **Encapsulation**: Implementation details are hidden behind public interfaces
5. **Composability**: Modules can be combined to create larger functional units

## Core Application Modules

The application consists of these primary functional modules:

### Story Management Module

**Purpose**: Manages story creation, editing, and organization

**Components**:
- Story Editor
- Chapter Navigator
- Plot Structure Tools
- Version History
- Export/Import Tools

**Integration Points**:
- Character Module: References characters within stories
- Location Module: References locations within stories
- Timeline Module: Aligns with timeline events

**Data Flow**:
```
User Input → Editor Interface → Story Data Structure → Storage Service
```

### Character Module

**Purpose**: Manages character creation, profiles, and relationships

**Components**:
- Character Creator
- Relationship Mapper
- Character Gallery
- Development Tracker
- Attribute Editor

**Integration Points**:
- Story Module: Characters appear in stories
- Timeline Module: Characters participate in events

**Data Flow**:
```
Character Input → Profile Templates → Character Entity → Storage Service
```

### Location Module

**Purpose**: Manages setting creation, mapping, and organization

**Components**:
- Location Editor
- Map Interface
- Hierarchy Navigator
- Description Generator
- Media Attachment

**Integration Points**:
- Story Module: Locations provide settings for scenes
- Timeline Module: Events occur at locations

**Data Flow**:
```
Location Input → Location Interface → Location Entity → Storage Service
```

### Timeline Module

**Purpose**: Manages chronological events and story progression

**Components**:
- Timeline Editor
- Event Creator
- Parallel Timeline View
- Causality Mapper
- Timeline Navigator

**Integration Points**:
- Story Module: Timeline aligns with story narrative
- Character Module: Characters participate in events
- Location Module: Events occur at locations

**Data Flow**:
```
Event Input → Timeline Interface → Event Entities → Storage Service
```

### AI Assistant Module

**Purpose**: Provides AI-assisted content generation and suggestions

**Components**:
- Writing Assistant
- Idea Generator
- Content Analyzer
- Consistency Checker
- Style Guide

**Integration Points**:
- Story Module: Enhances story content
- Character Module: Suggests character development
- MCP Servers: Communicates with specialized AI services

**Data Flow**:
```
User Request → API Interface → MCP Server → Response Processing → UI Feedback
```

### User Preferences Module

**Purpose**: Manages user settings and customization

**Components**:
- Theme Manager
- Feature Toggles
- Keyboard Shortcuts
- Profile Settings
- Notification Preferences

**Integration Points**:
- UI Module: Controls appearance and behavior
- All Modules: Applies user preferences across system

**Data Flow**:
```
User Selection → Settings Interface → Preferences Store → Application State
```

## Module Implementation Structure

Each module follows a consistent internal structure:

### Core Module Components

1. **Models**: Data structures and types
2. **Components**: UI elements specific to the module
3. **Hooks**: Custom React hooks for module functionality
4. **Services**: Business logic and external communication
5. **Utils**: Helper functions and utilities
6. **Constants**: Module-specific constants
7. **Context**: React context providers if needed

### Example Module Structure

```
/modules
  /story
    /components
      StoryEditor.tsx
      ChapterNavigator.tsx
      PlotStructureTool.tsx
    /hooks
      useStoryData.ts
      useVersionHistory.ts
    /services
      storyService.ts
      exportService.ts
    /models
      storyTypes.ts
      storySchema.ts
    /utils
      storyFormatting.ts
    /context
      StoryContext.tsx
    index.ts  # Public API exports
```

## Module Communication Patterns

Modules communicate using these patterns:

### Direct Import

Used for stable, closely related modules:

```typescript
// Direct import from another module
import { CharacterSelector } from '@/modules/character';

function StoryEditor() {
  return (
    <div>
      <CharacterSelector />
    </div>
  );
}
```

### Context-Based Communication

Used for widely shared state:

```typescript
// Provider in parent component
import { StoryProvider } from '@/modules/story/context';

function StoryApp() {
  return (
    <StoryProvider>
      <StoryEditor />
      <CharacterPanel />
    </StoryProvider>
  );
}

// Consumer in child component
import { useStory } from '@/modules/story/context';

function CharacterPanel() {
  const { currentStory } = useStory();
  // Use story data
}
```

### Event-Based Communication

Used for loosely coupled modules:

```typescript
// Publishing events
import { eventBus } from '@/core/eventBus';

function StoryEditor() {
  const saveStory = () => {
    // Save logic
    eventBus.emit('story:saved', { storyId, timestamp });
  };
}

// Subscribing to events
import { eventBus } from '@/core/eventBus';

function NotificationCenter() {
  useEffect(() => {
    const handler = (data) => {
      showNotification(`Story saved at ${data.timestamp}`);
    };
    
    eventBus.on('story:saved', handler);
    return () => eventBus.off('story:saved', handler);
  }, []);
}
```

### Service-Based Communication

Used for business logic operations:

```typescript
// Service definition
export class StoryService {
  async getRelatedCharacters(storyId) {
    // Implementation
  }
}

// Service usage
import { storyService } from '@/modules/story/services';

function CharacterPanel() {
  const [characters, setCharacters] = useState([]);
  
  useEffect(() => {
    const loadCharacters = async () => {
      const result = await storyService.getRelatedCharacters(storyId);
      setCharacters(result);
    };
    
    loadCharacters();
  }, [storyId]);
}
```

## Module Dependencies

The module dependency hierarchy is as follows:

```
Core Modules
  ↑
Feature Modules
  ↑
UI Components
  ↑
Pages/Views
```

### Dependency Rules

1. **Core modules** may not depend on feature modules
2. **Feature modules** may depend on core modules and other feature modules
3. **UI components** may depend on any modules
4. **Pages/Views** may depend on UI components and modules

## Module Versioning

Modules are versioned using semantic versioning:

1. **Major version**: Breaking changes to public API
2. **Minor version**: New features without breaking changes
3. **Patch version**: Bug fixes and minor improvements

## Module Documentation

Each module includes documentation:

1. **README.md**: Overview, purpose, and usage
2. **API.md**: Public interface documentation
3. **CHANGELOG.md**: Version history and changes

## Module Testing Strategy

Modules are tested at multiple levels:

1. **Unit Tests**: Individual functions and components
2. **Integration Tests**: Module internal integration
3. **Cross-Module Tests**: Interaction between modules
4. **E2E Tests**: Complete user flows across modules

## Relation to Other Documentation

This module structure document connects to:

- **Project Architecture Overview**: For overall system design
- **Project Directory Structure**: For file organization within modules
- **Code Organization**: For implementation details within modules 