# Narrative Metadata Guide

This guide explains how to implement metadata tracking in The Shadow Team Chronicles narrative content. While other guides focus on creative implementation, this document specifically addresses the metadata structures that ensure continuity and proper tracking.

## Importance of Narrative Metadata

Metadata serves multiple crucial functions in The Shadow Team Chronicles project:

1. **Continuity Management**: Ensures consistent details across multiple narrative pieces
2. **Relationship Tracking**: Documents connections between characters, locations, and events
3. **Timeline Integrity**: Maintains chronological accuracy across the universe
4. **Query Support**: Enables efficient searching and filtering of content
5. **System Integration**: Facilitates programmatic handling of narrative content

## Core Metadata Structure

Every narrative object must include a metadata section following the basic structure defined in `metadata/base_metadata_schema.json`:

```json
{
  "metadata": {
    "object_type": "passage",
    "id": "9a8b7c6d-5e4f-3g2h-1i0j-9k8l7m6n5o4p",
    "version": "1.0.0",
    "author": "AI Assistant",
    "creation_timestamp": "2025-03-15T14:30:00Z",
    "parent": {
      "type": "chapter",
      "id": "5a6b7c8d-9e0f-1a2b-3c4d-5e6f7g8h9i0j",
      "name": "Chapter 7: Digital Shadows"
    },
    "sequence_position": {
      "storyline": "The Shadow Team Chronicles",
      "volume": "Neo-Tokyo Rising",
      "act": "Act II: Underground Movement",
      "story": "The Ghost Protocol",
      "chapter": "Chapter 7: Digital Shadows",
      "passage": "Neural Infiltration",
      "passage_number": 3
    },
    "content_specific_metadata": {
      // Additional metadata based on object type
    }
  }
}
```

## Object-Specific Metadata Requirements

Different narrative objects require specific metadata elements:

### Passage Metadata

Passages must include:

```json
{
  "scene_type": "technological_demonstration",
  "scene_purpose": "Shows the first successful use of the neural bridge technology",
  "writing_style": "cinematic_precise",
  "emotional_tone": "tense",
  "description_focus": "technological",
  "narrative_pacing": "measured",
  "prose_variation_techniques": [
    "sentence_structure_variation",
    "rhythm_modulation",
    "focused_detail_alternation"
  ],
  "character_dynamics": [
    {
      "characters": ["Yuri", "Dr. Chen"],
      "dynamic": "asymmetric_trust"
    }
  ],
  "locations": [
    {
      "id": "7c6d5e4f-3g2h-1i0j-9k8l-7m6n5o4p3q2r",
      "name": "Resistance Research Laboratory"
    }
  ],
  "timeline_position": "3257-06-12T14:30:00Z"
}
```

### Character Metadata

Character entries must include metadata as defined in `character/character_metadata_schema.json`:

```json
{
  "personal_data": {
    "full_name": "Yuri Nakamura",
    "aliases": ["The Ghost", "Agent Y"],
    "birth_date": "3231-09-14",
    "origin": {
      "id": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
      "name": "Neo-Tokyo Sector 7"
    }
  },
  "timeline_points": [
    {
      "date": "3231-09-14",
      "event": "Born in Sector 7"
    },
    {
      "date": "3248-05-22",
      "event": "Recruited by Resistance"
    }
  ]
}
```

## Metadata Implementation Best Practices

### 1. ID Generation

All objects must have unique IDs:

- Use UUIDv4 format
- Generate IDs at object creation time
- Never reuse IDs, even for similar content
- Document ID relationships for parent-child content

### 2. Timestamp Formatting

All timestamps must follow the ISO 8601 format:

- Use UTC timezone
- Include time component when relevant
- Use "present" or "unknown" for indefinite dates
- Format: "YYYY-MM-DDTHH:mm:ssZ"

### 3. Reference Handling

When referencing other objects:

- Always include both ID and name
- Use full reference objects, not just IDs
- Update references if target objects change
- Validate references during content updates

### 4. Version Control

Track content changes with proper versioning:

- Use semantic versioning (MAJOR.MINOR.PATCH)
- Increment PATCH for small corrections
- Increment MINOR for content additions
- Increment MAJOR for significant rewrites
- Document version changes in change history

### 5. Timeline Consistency

Maintain chronological integrity with proper timeline references:

- Use absolute timestamps for known events
- Document relative time for ambiguous events
- Check timeline conflicts before content finalization
- Reference the master timeline to ensure consistency

## Related Documentation

For additional guidance on implementing metadata:
- [Implementing Metadata System](implementing_metadata_system.md) - Technical implementation details
- [Integrated Schema Workflow](integrated_schema_workflow.md) - End-to-end process including metadata
- [Schema Reference Directory](schema_reference_directory.md) - Complete schema catalog
