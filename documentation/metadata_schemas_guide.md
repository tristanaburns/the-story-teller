# The Shadow Team Chronicles: Metadata Schemas Guide

This guide explains the metadata schema system in The Shadow Team Chronicles universe, which provides essential contextual information about narrative content, technical attributes, and organizational structures across all content types.

## Overview of Metadata Schemas

The metadata schema system provides consistent information about the creation, modification, categorization, and management of all content within the narrative database:

```
metadata/base_metadata_schema.json (Root schema)
├── ai_writing_metadata_schema.json
├── document_metadata_schema.json
│   └── [references common/writing_elements_schema.json]
├── system_metadata_schema.json
└── versioning_schema.json
```

Metadata schemas use several common schemas:
- `common/object_type_schema.json` - For classifying the type of content
- `common/timestamp_schema.json` - For standardized time recording
- `common/writing_elements_schema.json` - For narrative structure elements
- `common/genre_type_schema.json` - For content categorization 
- `common/story_tone_schema.json` - For narrative mood and feel

## Primary Metadata Schemas

### Base Metadata Schema

This foundational schema contains elements applicable to all content:

```json
{
  "object_type": "character",
  "creation_timestamp": "2023-05-15T14:30:00Z",
  "last_modified_timestamp": "2023-06-22T09:15:32Z",
  "version": "1.2.3",
  "creator_info": {
    "name": "Alex Morgan",
    "role": "narrative_designer"
  },
  "tags": ["protagonist", "cyberpunk", "hacker", "enhanced"]
}
```

### AI Writing Metadata Schema

This schema extends the base metadata with information specific to AI-generated content:

```json
{
  // Base metadata properties
  "ai_metadata": {
    "model": "GPT-4",
    "prompt_summary": "Character concept for a cyberpunk hacker with conflicted loyalties",
    "generation_parameters": {
      "temperature": 0.8,
      "top_p": 0.95,
      "max_tokens": 2000
    },
    "usage_context": "character_development",
    "human_editing": {
      "edited": true,
      "edit_summary": "Refined backstory, adjusted abilities to match campaign power level"
    }
  }
}
```

### Document Metadata Schema

This schema provides information specific to narrative documents:

```json
{
  // Base metadata properties
  "document_metadata": {
    "title": "The Ghost in New Shanghai",
    "byline": "Created by Alex Morgan, Enhanced by AI",
    "word_count": 6842,
    "reading_time": {
      "minutes": 27,
      "seconds": 22
    },
    "narrative_structure": {
      "pov": "third_person_limited",
      "tense": "past",
      "narrative_style": "noir",
      "tone": "cynical"
    },
    "genre": ["cyberpunk", "thriller", "mystery"]
  }
}
```

## Using Metadata Schemas

### Creating Base Metadata

All content should include base metadata:

```json
"metadata": {
  "object_type": "location",
  "creation_timestamp": "2024-06-10T11:22:33Z",
  "last_modified_timestamp": "2024-06-15T16:42:18Z",
  "version": "1.0.0",
  "creator_info": {
    "name": "Sam Wilson",
    "role": "world_builder"
  },
  "tags": ["megacity", "corporate", "cyberpunk", "asia", "future"]
}
```

### Adding Document Metadata

For narrative content like scenes, stories, or character descriptions:

```json
"document_metadata": {
  "title": "Shadows of Neo-Tokyo",
  "byline": "Created by Sam Wilson",
  "word_count": 3845,
  "reading_time": {
    "minutes": 15,
    "seconds": 22
  },
  "narrative_structure": {
    "pov": "third_person_limited",
    "tense": "present",
    "narrative_style": "cyberpunk",
    "tone": "gritty"
  },
  "genre": ["cyberpunk", "action", "noir"]
}
```

### AI Generation Context

When content involves AI generation, include AI metadata:

```json
"ai_metadata": {
  "model": "GPT-4",
  "prompt_summary": "Generate a tense rooftop chase scene in Neo-Tokyo involving a hacker and corporate security",
  "generation_parameters": {
    "temperature": 0.7,
    "top_p": 0.9,
    "max_tokens": 1500
  },
  "usage_context": "scene_generation",
  "human_editing": {
    "edited": true,
    "edit_summary": "Expanded action sequences, refined dialogue for character voice consistency"
  }
}
```

## Common Metadata Elements

### Object Types

Use standardized object types from `object_type_schema.json`:

- `character` - Individuals within the narrative
- `location` - Places where narrative events occur
- `historical_event` - Significant occurrences in the timeline
- `artifact` - Notable objects with significance
- `organization` - Groups, factions, or formal entities
- `storyline` - Narrative arcs or plot sequences
- `scene` - Specific narrative moments
- And several others (see schema for complete list)

### Creator Roles

Use standardized creator roles from `creator_role_schema.json`:

- `narrative_designer` - Responsible for story arcs and plot
- `world_builder` - Focuses on setting and lore
- `character_designer` - Specializes in character creation
- `editor` - Refines and polishes content
- `ai_assistant` - AI system that helped generate content
- `gm` - Game Master for RPG campaigns
- `player` - Player in RPG campaigns

### Versioning

Use semantic versioning for all content:

- Format: `MAJOR.MINOR.PATCH` (e.g., "1.2.3")
- `MAJOR`: Increment for substantial rewrites or character/plot changes
- `MINOR`: Increment for expansion of existing information or addition of new elements
- `PATCH`: Increment for corrections, typo fixes, or minor clarifications

### Timestamps

Use ISO 8601 format for all timestamps:

```json
"creation_timestamp": "2024-06-15T14:30:00Z"
```

### Tags

Include relevant tags for searchability and categorization:

```json
"tags": ["villain", "corporate", "cybernetic", "antagonist", "neo-tokyo"]
```

## Best Practices

1. **Be Consistent**: Use the same metadata structure across similar content types.

2. **Keep Metadata Current**: Update timestamps and versions when content changes.

3. **Use Standard Enums**: Stick to the defined enumerations for fields like object types, creator roles, etc.

4. **Be Descriptive with Tags**: Choose tags that enhance searchability and categorization.

5. **Document AI Involvement**: When AI plays a role in content generation, document prompt information and edit history.

6. **Update Versions Properly**: Follow semantic versioning principles when incrementing version numbers.

7. **Include Reading Metrics**: For narrative content, include word count and estimated reading time.

## Metadata Workflow

1. **Initial Creation**: When creating new content, add base metadata with creator info, initial version (1.0.0), and relevant tags.

2. **AI Generation**: If using AI tools, document the prompt approach, parameters, and context.

3. **Human Editing**: Record significant human edits to AI-generated content.

4. **Content Updates**: When updating existing content, update the timestamp, increment the version number appropriately, and consider adding any new relevant tags.

5. **Metadata Validation**: Before finalizing, validate metadata against the appropriate schema.

## Example: Complete Metadata for a Character Profile

```json
{
  "metadata": {
    "object_type": "character",
    "creation_timestamp": "2024-05-15T14:30:00Z",
    "last_modified_timestamp": "2024-06-22T09:15:32Z",
    "version": "1.3.2",
    "creator_info": {
      "name": "Alex Morgan",
      "role": "character_designer"
    },
    "tags": ["protagonist", "cyberpunk", "hacker", "enhanced", "neo-tokyo"]
  },
  "document_metadata": {
    "title": "Hanako Miyashiro - Ghost in the Network",
    "byline": "Designed by Alex Morgan, Enhanced by AI",
    "word_count": 2842,
    "reading_time": {
      "minutes": 11,
      "seconds": 22
    },
    "narrative_structure": {
      "pov": "third_person",
      "tone": "mysterious"
    },
    "genre": ["cyberpunk", "techno-thriller", "noir"]
  },
  "ai_metadata": {
    "model": "GPT-4",
    "prompt_summary": "Detailed character profile for a cyberpunk hacker with a mysterious past, corrupt corporation connections, and internal conflict",
    "generation_parameters": {
      "temperature": 0.8,
      "top_p": 0.9,
      "max_tokens": 3000
    },
    "usage_context": "character_development",
    "human_editing": {
      "edited": true,
      "edit_summary": "Refined backstory to connect with Neo-Tokyo history, adjusted cybernetic enhancements to match campaign tech level, expanded on personal relationships"
    }
  }
}
```

## Validating Your Metadata JSON

To validate your metadata JSON against the schema, use a JSON Schema validator like:

- [JSON Schema Validator](https://www.jsonschemavalidator.net/)
- VS Code with the "JSON Schema" extension
- The command line with tools like AJV

Paste both your metadata JSON and the schema to verify compliance before adding to the database.
