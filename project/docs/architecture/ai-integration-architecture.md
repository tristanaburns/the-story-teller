# The Story Teller: AI Integration Architecture

*Last Updated: 2025-04-28*

This document details the architecture and implementation approach for AI integration in The Story Teller platform, describing how various AI services are coordinated to create a cohesive narrative co-creation experience.

## AI Architecture Overview

The Story Teller platform implements a sophisticated AI integration architecture that orchestrates multiple specialized AI services to support different aspects of narrative creation, management, and presentation. The architecture is designed to create an AI-native experience where AI is a true co-creator in the storytelling process.

## AI Layer Components

### MCP (Model Context Protocol) Services

The platform utilizes specialized MCP services built with NestJS, each handling specific AI functions:

#### 1. Structure-Smith

**Purpose**: Handles structure, timeline logic, and schema enforcement.

**Key Functions**:
- Schema compliance validation
- Narrative outline generation
- Timeline consistency checking
- Relationship validation
- World coherence maintenance

**Technical Implementation**:
- Claude integration for structured reasoning
- JSON schema-aware prompting
- Context windowing for long documents
- Validation result formatting

#### 2. Prose-Crafter

**Purpose**: Manages prose generation, dialogue, and stylistic variation.

**Key Functions**:
- Rich prose generation from outlines
- Character-specific dialogue creation
- Style adaptation based on parameters
- Content enhancement and refinement
- Draft completion from partial content

**Technical Implementation**:
- GPT-4o integration for creative generation
- Fine-tuned instruction set for narrative tasks
- Style parameter handling
- Character voice preservation

#### 3. EverArt

**Purpose**: Provides style-consistent visual content generation.

**Key Functions**:
- Character portrait generation
- Scene illustration creation
- Artifact visualization
- Style consistency enforcement
- Visual metadata extraction

**Technical Implementation**:
- DALL·E, Stability AI integration
- Style vector embeddings
- Visual consistency algorithms
- Prompt expansion and refinement

#### 4. Seq-Think

**Purpose**: Handles long-horizon planning, quest design, and causal reasoning.

**Key Functions**:
- Multi-step narrative arc design
- Quest and subplot generation
- Cause-effect relationship tracking
- Narrative logic validation
- Character motivation analysis

**Technical Implementation**:
- Chain-of-thought prompting
- Tree-based planning algorithms
- Causal graph maintenance
- Step-by-step reasoning tracking

## AI Pipeline Workflow

The AI integration follows a standardized workflow designed to maintain consistency and quality:

### 1. Content Generation Pipeline

```
Client Request → Next.js Route → Structure-Smith → Prose-Crafter → Validator → DB Insert → Response
```

**Detailed Flow**:
1. **Client Request**: User requests AI-generated content with context and parameters
2. **Next.js Route**: Formats request for appropriate MCP service
3. **Structure-Smith**: Generates schema-compliant outline and structure
4. **Prose-Crafter**: Expands outline into rich narrative content
5. **Validator**: Ensures final content meets schema requirements
6. **DB Insert**: Stores validated content in database
7. **Response**: Returns completed content to client

### 2. Media Generation Pipeline

```
Client Request → Next.js Route → EverArt → Media Processing → S3 Storage → DB Metadata → Response
```

**Detailed Flow**:
1. **Client Request**: User requests media generation with parameters
2. **Next.js Route**: Formats request for EverArt
3. **EverArt**: Expands prompt and ensures style consistency
4. **Media Processing**: Generates and optimizes media
5. **S3 Storage**: Saves media to appropriate storage
6. **DB Metadata**: Records metadata and relationships
7. **Response**: Returns media reference to client

### 3. Interactive Storytelling Pipeline

```
User Choice → WebSocket → Seq-Think → Structure-Smith → Prose-Crafter → Media Generation → WebSocket Push
```

**Detailed Flow**:
1. **User Choice**: User selects a choice in interactive mode
2. **WebSocket**: Transmits choice to server
3. **Seq-Think**: Determines narrative consequences
4. **Structure-Smith**: Ensures consistency with world and timeline
5. **Prose-Crafter**: Generates new narrative segment
6. **Media Generation**: Creates supporting media (optional)
7. **WebSocket Push**: Delivers new content to client

## Creative Workflow Loop

The platform implements a continuous creative workflow loop that creates the foundation for AI as co-creator:

```
User or AI creates content → AI validates against schemas → Metadata updates across connected elements → Media generation for supporting content → Story evolves based on new content → AI re-reads context → Continues world/storyline development
```

This loop ensures continuous narrative coherence and provides a foundation for ongoing world development.

## AI Context Management

### Long-Term Memory Implementation

The platform implements sophisticated context management to maintain narrative coherence:

1. **Vector Storage**: Long-term memory stored as embeddings
2. **Relevance Retrieval**: Contextually relevant information fetched for each interaction
3. **Memory Consolidation**: Automated summarization of narrative elements
4. **Context Window Management**: Efficient use of limited context windows

### Style DNA System

Style consistency is maintained through:

1. **Style Vectors**: Numerical representation of chosen artistic styles
2. **Style Enforcement**: Ensuring consistency across generated content
3. **Character Voice Preservation**: Maintaining consistent character personalities and speech patterns
4. **Tone Management**: Preserving the emotional and atmospheric qualities of the narrative

## AI Integration Technical Implementation

### API Integration

```javascript
// Example Structure-Smith integration
async function generateStructure(prompt, schema) {
  const response = await fetch('/api/mcp/structure-smith/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      schema,
      context: {
        worldId,
        storyId,
        previousPassages: [...],
      }
    }),
  });
  
  return await response.json();
}
```

### Prompt Management

The platform uses a sophisticated prompt management system:

1. **Template Library**: Reusable prompt templates for different AI tasks
2. **Dynamic Injection**: Context and parameters injected into templates
3. **Version Control**: Prompt versioning for consistent results
4. **A/B Testing**: Performance evaluation of different prompt strategies

### Error Handling and Fallbacks

Robust error handling ensures reliability:

1. **Validation Errors**: Structured feedback for schema violations
2. **Service Failures**: Fallback mechanisms for service unavailability
3. **Content Filtering**: Detection and handling of inappropriate content
4. **Retry Logic**: Intelligent retry strategies with backoff

## Phased Implementation

The AI integration will be implemented according to the phased approach outlined in the [Project Blueprint](../plan/project-blueprint.md):

1. **MTP Phase**: Basic AI generation with Structure-Smith and Prose-Crafter
2. **Interactive Runner Phase**: Addition of choice-based progression and narrative branching
3. **Media Layer Phase**: Integration of EverArt for visual content
4. **Publishing Phase**: Enhanced media capabilities
5. **Advanced MCP Phase**: Addition of Seq-Think and advanced memory systems
6. **Mobile & Plugins Phase**: Optimized AI integration for mobile devices

## AI Security and Ethical Considerations

The architecture incorporates several security and ethical safeguards:

1. **Content Filtering**: Prevents generation of harmful or inappropriate content
2. **User Control**: Clear mechanisms for users to approve or modify AI suggestions
3. **Attribution**: Proper tracking of AI-generated vs. user-created content
4. **Rate Limiting**: Prevention of excessive API usage
5. **Data Isolation**: User data used only for their own content

## Relation to Other Documentation

This AI integration architecture connects to:
- **Project Blueprint**: For MTP and phase definitions
- **Project Architecture Overview**: For overall system architecture
- **Technical Requirements**: For AI integration specifications
- **MCP Server Documentation**: For detailed MCP service specifications
