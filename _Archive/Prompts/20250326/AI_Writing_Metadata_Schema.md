# AI Writing Metadata Schema

This document defines the complete metadata schema structure for The Story Teller AI Writing Assistant. All narrative content generated through the StoryTeller system must comply with these schemas.

## Table of Contents

- [Base Metadata Schema](#base-metadata-schema)
- [Writing Style Schema](#writing-style-schema)
- [Scene Type Schema](#scene-type-schema)
- [Narrative Structure Schema](#narrative-structure-schema)
- [Prose Variation Technique Schema](#prose-variation-technique-schema)
- [Narrative Pacing Schema](#narrative-pacing-schema)
- [Scene Transition Schema](#scene-transition-schema)
- [Dialogue Tag Style Schema](#dialogue-tag-style-schema)
- [Emotional Tone Schema](#emotional-tone-schema)
- [Description Focus Schema](#description-focus-schema)
- [Character Dynamic Schema](#character-dynamic-schema)
- [Complete StoryTeller Metadata](#complete-storyteller-metadata)
- [Writing Control Rules Schema](#writing-control-rules-schema)
- [Complete JSON Schema](#complete-json-schema)
- [Schema Implementation Guide](#schema-implementation-guide)

## Base Metadata Schema

The foundation for all metadata structures, defining the minimum required fields for any narrative object.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://storyteller.ai/schemas/metadata/base_metadata",
  "title": "Base Metadata Schema",
  "description": "Core metadata structure required for all narrative objects in The Shadow Team Chronicles universe",
  "type": "object",
  "required": ["object_type", "id", "version", "author", "creation_timestamp"],
  "properties": {
    "object_type": {
      "type": "string",
      "description": "The type of narrative object this represents",
      "enum": ["storyline", "volume", "act", "story", "chapter", "passage", "part"]
    },
    "id": {
      "type": "string",
      "description": "Unique identifier in UUIDv4 format",
      "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
    },
    "version": {
      "type": "string",
      "description": "Version number in semantic versioning format",
      "pattern": "^\\d+\\.\\d+\\.\\d+$"
    },
    "author": {
      "type": "string",
      "description": "Creator of the content"
    },
    "creation_timestamp": {
      "type": "string",
      "description": "ISO 8601 formatted date and time of creation",
      "format": "date-time"
    },
    "parent": {
      "type": "object",
      "description": "Reference to the parent object in the narrative hierarchy",
      "properties": {
        "type": {
          "type": "string",
          "description": "Type of the parent object",
          "enum": ["storyline", "volume", "act", "story", "chapter", "passage"]
        },
        "id": {
          "type": "string",
          "description": "UUID of the parent object",
          "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
        },
        "name": {
          "type": "string",
          "description": "Human-readable name of the parent object"
        }
      },
      "required": ["type", "id", "name"]
    },
    "sequence_position": {
      "type": "object",
      "description": "Position in the narrative hierarchy",
      "properties": {
        "storyline": {
          "type": "string",
          "description": "Name of the storyline"
        },
        "volume": {
          "type": "string",
          "description": "Name of the volume"
        },
        "act": {
          "type": "string",
          "description": "Name of the act"
        },
        "story": {
          "type": "string",
          "description": "Name of the story"
        },
        "chapter": {
          "type": "string",
          "description": "Name of the chapter"
        },
        "passage": {
          "type": "string",
          "description": "Name of the passage"
        },
        "passage_number": {
          "type": "integer",
          "description": "Numerical position within the parent"
        }
      }
    }
  }
}
```

## Writing Style Schema

Defines the standardized writing styles available for narrative content.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://storyteller.ai/schemas/enums/writing_style",
  "title": "Writing Style Schema",
  "description": "Standardized enumeration of writing styles for narrative content in The Shadow Team Chronicles universe.",
  "type": "string",
  "enum": [
    "cinematic_precise",
    "mythic_poetic",
    "controlled_chaos",
    "emotional_measured",
    "narrative_historian",
    "atmospheric_immersive",
    "dreamlike_fragmented"
  ]
}
```

## Scene Type Schema

Categorizes different types of scenes based on their narrative function.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://storyteller.ai/schemas/enums/scene_type",
  "title": "Scene Type Schema",
  "description": "Standardized enumeration of scene types in The Shadow Team Chronicles universe.",
  "type": "string",
  "enum": [
    "action_sequence",
    "character_introduction",
    "dialogue_driven",
    "exposition_worldbuilding",
    "internal_reflection",
    "investigation_discovery",
    "tension_buildup",
    "emotional_revelation",
    "philosophical_debate",
    "transitions_travel",
    "flashback_memory",
    "horror_suspense",
    "mystery_revelation",
    "social_political_interaction",
    "technological_demonstration",
    "ambient_atmosphere"
  ]
}
```

## Narrative Structure Schema

Defines the hierarchical structure of narrative elements within the story universe.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://storyteller.ai/schemas/enums/narrative_structure",
  "title": "Narrative Structure Schema",
  "description": "Standardized enumeration of narrative structural elements in The Shadow Team Chronicles universe.",
  "type": "string",
  "enum": [
    "storyline",
    "volume",
    "act",
    "story",
    "chapter",
    "passage",
    "part"
  ],
  "hierarchicalOrder": [
    "storyline",
    "volume",
    "act",
    "story",
    "chapter",
    "passage",
    "part"
  ]
}
```

## Prose Variation Technique Schema

Defines techniques to ensure natural, non-repetitive writing in narrative content.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://storyteller.ai/schemas/enums/prose_variation_technique",
  "title": "Prose Variation Technique Schema",
  "description": "Standardized enumeration of prose variation techniques for creating natural, non-repetitive writing in The Shadow Team Chronicles universe.",
  "type": "string",
  "enum": [
    "sentence_structure_variation",
    "descriptive_vocabulary_diversification",
    "perspective_shift",
    "rhythm_modulation",
    "focused_detail_alternation",
    "emotional_tone_adjustment",
    "temporal_flow_variation",
    "dialogue_style_adaptation",
    "metaphor_refreshing",
    "paragraph_length_variation"
  ]
}
```

## Narrative Pacing Schema

Controls the speed and rhythm of storytelling through different pacing options.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://storyteller.ai/schemas/enums/narrative_pacing",
  "title": "Narrative Pacing Schema",
  "description": "Standardized enumeration of pacing types for narrative content in The Shadow Team Chronicles universe.",
  "type": "string",
  "enum": [
    "breakneck",
    "urgent",
    "brisk",
    "measured",
    "deliberate",
    "languid",
    "contemplative"
  ]
}
```

## Scene Transition Schema

Defines standardized approaches for transitioning between scenes.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://storyteller.ai/schemas/enums/scene_transition",
  "title": "Scene Transition Schema",
  "description": "Standardized enumeration of transition types between scenes in The Shadow Team Chronicles universe.",
  "type": "string",
  "enum": [
    "hard_cut",
    "fade_to_black",
    "time_lapse",
    "location_shift",
    "perspective_change",
    "flashback_entry",
    "flashback_exit",
    "dream_sequence_entry",
    "dream_sequence_exit",
    "thematic_bridge",
    "sensory_shift",
    "memory_trigger",
    "parallel_action",
    "environmental_transition"
  ]
}
```

## Dialogue Tag Style Schema

Standardizes approaches to dialogue attribution and presentation.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://storyteller.ai/schemas/enums/dialogue_tag_style",
  "title": "Dialogue Tag Style Schema",
  "description": "Standardized enumeration of dialogue tagging approaches in The Shadow Team Chronicles universe.",
  "type": "string",
  "enum": [
    "standard",
    "minimalist",
    "descriptive",
    "action_integrated",
    "emotive",
    "internalized",
    "untethered"
  ]
}
```

## Emotional Tone Schema

Defines the emotional atmosphere options for scenes and passages.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://storyteller.ai/schemas/enums/emotional_tone",
  "title": "Emotional Tone Schema",
  "description": "Standardized enumeration of emotional tones for narrative content in The Shadow Team Chronicles universe.",
  "type": "string",
  "enum": [
    "ominous",
    "melancholic",
    "tense",
    "hopeful",
    "triumphant",
    "desperate",
    "contemplative",
    "detached",
    "intimate",
    "manic",
    "serene"
  ]
}
```

## Description Focus Schema

Prioritizes different types of sensory details for descriptive writing.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://storyteller.ai/schemas/enums/description_focus",
  "title": "Description Focus Schema",
  "description": "Standardized enumeration of descriptive focus approaches for narrative content in The Shadow Team Chronicles universe.",
  "type": "string",
  "enum": [
    "visual_primary",
    "auditory_primary",
    "tactile_primary",
    "olfactory_primary",
    "kinesthetic",
    "environmental",
    "technological",
    "character_centric",
    "temporal",
    "atmospheric",
    "psychological_interior"
  ]
}
```

## Character Dynamic Schema

Defines relationship patterns between characters in the narrative.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://storyteller.ai/schemas/enums/character_dynamic",
  "title": "Character Dynamic Schema",
  "description": "Standardized enumeration of relationship dynamics between characters in The Shadow Team Chronicles universe.",
  "type": "string",
  "enum": [
    "mentor_protege",
    "rivals",
    "allies_of_convenience",
    "loyal_partners",
    "asymmetric_trust",
    "forced_cooperation",
    "deep_friendship",
    "romantic_involvement",
    "hidden_agenda",
    "predator_prey",
    "mutual_dependence",
    "shared_history",
    "power_imbalance",
    "surrogate_family",
    "conflicting_loyalty"
  ]
}
```

## Complete StoryTeller Metadata

This composite schema combines all the individual schemas into a comprehensive metadata structure used by the StoryTeller system for all narrative content.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://storyteller.ai/schemas/metadata/storyteller_metadata",
  "title": "Complete StoryTeller Metadata Schema",
  "description": "Comprehensive metadata structure for narrative content in The Shadow Team Chronicles universe",
  "type": "object",
  "required": ["object_type", "id", "version", "author", "creation_timestamp", "writing_style", "scene_type"],
  "properties": {
    "object_type": {
      "type": "string",
      "description": "The type of narrative object this represents",
      "enum": ["storyline", "volume", "act", "story", "chapter", "passage", "part"]
    },
    "id": {
      "type": "string",
      "description": "Unique identifier in UUIDv4 format",
      "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
    },
    "version": {
      "type": "string",
      "description": "Version number in semantic versioning format",
      "pattern": "^\\d+\\.\\d+\\.\\d+$"
    },
    "author": {
      "type": "string",
      "description": "Creator of the content"
    },
    "creation_timestamp": {
      "type": "string",
      "description": "ISO 8601 formatted date and time of creation",
      "format": "date-time"
    },
    "parent": {
      "type": "object",
      "description": "Reference to the parent object in the narrative hierarchy",
      "properties": {
        "type": {
          "type": "string",
          "description": "Type of the parent object",
          "enum": ["storyline", "volume", "act", "story", "chapter", "passage"]
        },
        "id": {
          "type": "string",
          "description": "UUID of the parent object",
          "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
        },
        "name": {
          "type": "string",
          "description": "Human-readable name of the parent object"
        }
      },
      "required": ["type", "id", "name"],
      "sequence_position": {
        "type": "object",
        "description": "Position in the narrative hierarchy including both descriptive names and numerical tracking values.",
        "properties": {
          "storyline": {
            "type": "string",
            "description": "Name of the storyline"
          },
          "volume": {
            "type": "string",
            "description": "Name of the volume"
          },
          "act": {
            "type": "string",
            "description": "Name of the act"
          },
          "story": {
            "type": "string",
            "description": "Name of the story"
          },
          "chapter": {
            "type": "string",
            "description": "Name of the chapter"
          },
          "passage": {
            "type": "string",
            "description": "Name of the passage"
          },
          "tracking": {
            "type": "object",
            "description": "Numerical tracking for narrative sequence progression.",
            "properties": {
              "volume": {
                "type": "integer",
                "description": "Numeric position of the volume in the narrative sequence"
              },
              "act": {
                "type": "integer",
                "description": "Numeric position of the act in the narrative sequence"
              },
              "story": {
                "type": "integer",
                "description": "Numeric position of the story within the volume"
              },
              "chapter": {
                "type": "integer",
                "description": "Numeric position of the chapter within the story"
              },
              "passage": {
                "type": "integer",
                "description": "Numeric position of the passage within the chapter"
              },
              "part": {
                "type": "integer",
                "description": "Numeric position of the part within the passage"
              }
            },
            "required": [
              "volume",
              "act",
              "story",
              "chapter",
              "passage",
              "part"
            ]
          }
        },
        "required": [
          "storyline",
          "volume",
          "act",
          "story",
          "chapter",
          "passage",
          "tracking"
        ]
      }
    },
    "writing_style": {
      "type": "string",
      "description": "The writing style used for this content",
      "enum": [
        "cinematic_precise",
        "mythic_poetic",
        "controlled_chaos",
        "emotional_measured",
        "narrative_historian",
        "atmospheric_immersive",
        "dreamlike_fragmented"
      ]
    },
    "writing_style_rationale": {
      "type": "string",
      "description": "Explanation for why this writing style was chosen"
    },
    "scene_type": {
      "type": "string",
      "description": "The type of scene represented by this content",
      "enum": [
        "action_sequence",
        "character_introduction",
        "dialogue_driven",
        "exposition_worldbuilding",
        "internal_reflection",
        "investigation_discovery",
        "tension_buildup",
        "emotional_revelation",
        "philosophical_debate",
        "transitions_travel",
        "flashback_memory",
        "horror_suspense",
        "mystery_revelation",
        "social_political_interaction",
        "technological_demonstration",
        "ambient_atmosphere"
      ]
    },
    "scene_purpose": {
      "type": "string",
      "description": "Specific narrative purpose this scene fulfills"
    },
    "prose_variation_techniques": {
      "type": "array",
      "description": "Techniques used to create natural writing variation",
      "items": {
        "type": "string",
        "enum": [
          "sentence_structure_variation",
          "descriptive_vocabulary_diversification",
          "perspective_shift",
          "rhythm_modulation",
          "focused_detail_alternation",
          "emotional_tone_adjustment",
          "temporal_flow_variation",
          "dialogue_style_adaptation",
          "metaphor_refreshing",
          "paragraph_length_variation"
        ]
      },
      "minItems": 3
    },
    "narrative_pacing": {
      "type": "string",
      "description": "The storytelling speed and rhythm",
      "enum": [
        "breakneck",
        "urgent",
        "brisk",
        "measured",
        "deliberate",
        "languid",
        "contemplative"
      ]
    },
    "emotional_tone": {
      "type": "string",
      "description": "The emotional atmosphere of the scene",
      "enum": [
        "ominous",
        "melancholic",
        "tense",
        "hopeful",
        "triumphant",
        "desperate",
        "contemplative",
        "detached",
        "intimate",
        "manic",
        "serene"
      ]
    },
    "description_focus": {
      "type": "string",
      "description": "Primary sensory emphasis in descriptions",
      "enum": [
        "visual_primary",
        "auditory_primary",
        "tactile_primary",
        "olfactory_primary",
        "kinesthetic",
        "environmental",
        "technological",
        "character_centric",
        "temporal",
        "atmospheric",
        "psychological_interior"
      ]
    },
    "dialogue_tag_style": {
      "type": "string",
      "description": "Approach to dialogue attribution",
      "enum": [
        "standard",
        "minimalist",
        "descriptive",
        "action_integrated",
        "emotive",
        "internalized",
        "untethered"
      ]
    },
    "character_dynamics": {
      "type": "array",
      "description": "Character relationship patterns present in the scene",
      "items": {
        "type": "object",
        "properties": {
          "characters": {
            "type": "array",
            "description": "Characters involved in this dynamic",
            "items": {
              "type": "string"
            },
            "minItems": 2
          },
          "dynamic": {
            "type": "string",
            "description": "Type of relationship between these characters",
            "enum": [
              "mentor_protege",
              "rivals",
              "allies_of_convenience",
              "loyal_partners",
              "asymmetric_trust",
              "forced_cooperation",
              "deep_friendship",
              "romantic_involvement",
              "hidden_agenda",
              "predator_prey",
              "mutual_dependence",
              "shared_history",
              "power_imbalance",
              "surrogate_family",
              "conflicting_loyalty"
            ]
          },
          "dynamic_details": {
            "type": "string",
            "description": "Specifics about this relationship dynamic"
          }
        },
        "required": ["characters", "dynamic"]
      }
    },
    "transitions": {
      "type": "object",
      "description": "Scene transition approaches",
      "properties": {
        "from_previous": {
          "type": "object",
          "properties": {
            "transition_type": {
              "type": "string",
              "enum": [
                "hard_cut",
                "fade_to_black",
                "time_lapse",
                "location_shift",
                "perspective_change",
                "flashback_entry",
                "flashback_exit",
                "dream_sequence_entry",
                "dream_sequence_exit",
                "thematic_bridge",
                "sensory_shift",
                "memory_trigger",
                "parallel_action",
                "environmental_transition"
              ]
            },
            "transition_description": {
              "type": "string",
              "description": "Details about how this transition is implemented"
            }
          },
          "required": ["transition_type"]
        },
        "to_next": {
          "type": "object",
          "properties": {
            "transition_type": {
              "type": "string",
              "enum": [
                "hard_cut",
                "fade_to_black",
                "time_lapse",
                "location_shift",
                "perspective_change",
                "flashback_entry",
                "flashback_exit",
                "dream_sequence_entry",
                "dream_sequence_exit",
                "thematic_bridge",
                "sensory_shift",
                "memory_trigger",
                "parallel_action",
                "environmental_transition"
              ]
            },
            "transition_description": {
              "type": "string",
              "description": "Details about how this transition is implemented"
            }
          },
          "required": ["transition_type"]
        }
      }
    },
    "timeline_position": {
      "type": "string",
      "description": "ISO 8601 formatted date and time of events in the narrative",
      "format": "date-time"
    },
    "locations": {
      "type": "array",
      "description": "Settings where the scene takes place",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "UUID of the location",
            "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
          },
          "name": {
            "type": "string",
            "description": "Human-readable name of the location"
          }
        },
        "required": ["id", "name"]
      }
    },
    "characters": {
      "type": "array",
      "description": "Characters present in the scene",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "UUID of the character",
            "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
          },
          "name": {
            "type": "string",
            "description": "Character's name"
          },
          "role": {
            "type": "string",
            "description": "Character's role in this scene",
            "enum": ["protagonist", "antagonist", "supporting", "mentioned", "background"]
          }
        },
        "required": ["id", "name"]
      }
    },
    "multimedia": {
      "type": "object",
      "description": "Media references for the scene",
      "properties": {
        "images": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "description": "Unique identifier for the image"
              },
              "prompt": {
                "type": "string",
                "description": "The prompt used to generate the image"
              },
              "file": {
                "type": "string",
                "description": "Path to the image file"
              },
              "description": {
                "type": "string",
                "description": "Description of the image"
              },
              "placement": {
                "type": "string",
                "description": "Where in the scene the image appears"
              }
            },
            "required": ["id", "prompt", "description"]
          }
        },
        "videos": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "description": "Unique identifier for the video"
              },
              "prompt": {
                "type": "string",
                "description": "The prompt used to generate the video"
              },
              "file": {
                "type": "string",
                "description": "Path to the video file"
              },
              "description": {
                "type": "string",
                "description": "Description of the video"
              },
              "placement": {
                "type": "string",
                "description": "Where in the scene the video appears"
              }
            },
            "required": ["id", "prompt", "description"]
          }
        },
        "audio": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "description": "Unique identifier for the audio"
              },
              "file": {
                "type": "string",
                "description": "Path to the audio file"
              },
              "description": {
                "type": "string",
                "description": "Description of the audio"
              },
              "placement": {
                "type": "string",
                "description": "Where in the scene the audio appears"
              }
            },
            "required": ["id", "description"]
          }
        }
      }
    },
    "implementation_details": {
      "type": "object",
      "description": "Documentation of how schemas were implemented",
      "properties": {
        "writing_style_implementation": {
          "type": "object",
          "properties": {
            "style": {
              "type": "string",
              "description": "The writing style that was implemented"
            },
            "examples": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "description": "Examples of how the style was implemented"
            }
          },
          "required": ["style", "examples"]
        },
        "prose_variation_implementation": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "technique": {
                "type": "string",
                "description": "The prose variation technique used"
              },
              "examples": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "description": "Examples of how the technique was implemented"
              }
            },
            "required": ["technique", "examples"]
          },
          "minItems": 3
        }
      }
    }
  }
}
```

## Writing Control Rules Schema

Defines standardized constraints for prose density, structure, and pacing across all generated content.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://storyteller.ai/schemas/enums/writing_control_rules",
  "title": "Writing Control Rules Schema",
  "description": "Standardized constraints for prose density, metaphor usage, and structural pacing in The Shadow Team Chronicles narrative content.",
  "type": "object",
  "properties": {
    "max_words_per_part": {
      "type": "integer",
      "description": "Maximum number of words allowed in a single Part",
      "default": 850
    },
    "max_tokens_per_part": {
      "type": "integer",
      "description": "Maximum number of tokens allowed in a single Part",
      "default": 1100
    },
    "max_poetic_lines": {
      "type": "integer",
      "description": "Maximum number of poetic or metaphorical lines permitted in a single Part",
      "default": 5
    },
    "max_consecutive_poetic_lines": {
      "type": "integer",
      "description": "Maximum number of poetic or metaphorical lines that can appear consecutively",
      "default": 2
    },
    "min_prose_variation_per_paragraphs": {
      "type": "integer",
      "description": "Minimum number of prose variation techniques that must be applied per specified number of paragraphs",
      "default": 1
    },
    "min_dialogue_or_action_per_4_blocks": {
      "type": "boolean",
      "description": "Whether a dialogue, action, or reflective beat must break up every 4 description blocks",
      "default": true
    },
    "description_block_max_lines": {
      "type": "integer",
      "description": "Maximum consecutive lines of pure description before requiring a break",
      "default": 4
    },
    "theme_poetic_density_limit": {
      "type": "integer",
      "description": "Maximum number of poetic lines that can be used for any single theme",
      "default": 2
    },
    "natural_variability_target": {
      "type": "string",
      "description": "Target range for natural length variation between sequential Parts",
      "default": "±10-15% variation between sequential parts"
    },
    "enforce_canon_file_validation": true,
    "required_cross_check_sources": [
      "storyline_draft",
      "character_database",
      "event_database",
      "timeline_database",
      "location_database",
      "artifact_database",
      "technology_database",
      "weapon_database",
      "worldbuilding_database"
      "organization_database",
      "fauna_flora_database"
    ],
    "post_generation_validation": true,
    "validation_targets": [
      "character_consistency",
      "timeline_alignment",
      "dialogue_accuracy",
      "weapon_and_attire_check",
      "scene_location_check",
      "known_event_conformance"
    ]
  },
  "required": [
    "max_words_per_part",
    "max_tokens_per_part",
    "max_poetic_lines",
    "max_consecutive_poetic_lines",
    "min_prose_variation_per_paragraphs",
    "description_block_max_lines"
  ]
}
```

## Complete JSON Schema

The following is the complete JSON schema that defines the metadata structure requirements for all content in The Shadow Team Chronicles. This schema should be used to validate all metadata objects across the StoryTeller system.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "AI Writing Metadata Schema",
  "description": "Defines the structure for metadata tracking in The Shadow Team Chronicles.",
  "type": "object",
  "properties": {
    "metadata": {
      "type": "object",
      "description": "Encapsulates all metadata properties for tracking and execution.",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "A globally unique identifier (UUID v4) for this object."
        },
        "name": {
          "type": "string",
          "description": "The title or name of this object."
        },
        "description": {
          "type": "string",
          "description": "A detailed summary or description of this object."
        },
        "object_type": {
          "type": "string",
          "enum": [
            "storyline", "volume", "act", "story", "chapter", 
            "passage", "part", "technology", "character", "location", 
            "category", "image", "video", "audio", "map"
          ],
          "description": "The classification of this object."
        },
        "status": {
          "type": "string",
          "enum": ["draft", "final"],
          "description": "The current progression state of this object."
        },
        "verified": {
          "type": "boolean",
          "description": "Indicates whether this object has been reviewed and confirmed."
        },
        "setting": {
          "type": "string",
          "description": "Defined setting/location for this object."
        },
        "writing_style": {
          "type": "object",
          "description": "Defines the writing style and format for this object.",
          "properties": {
            "tone": {
              "type": "string",
              "enum": ["Epic", "Cinematic", "Mythic"],
              "description": "The overarching tone of the narrative."
            },
            "theme": {
              "type": "string",
              "enum": ["Fate", "Honor", "Battle of Legends"],
              "description": "The central theme of the narrative."
            },
            "style_type": {
              "type": "string",
              "enum": [
                "Mythic & Poetic",
                "Cinematic & Precise",
                "Controlled Chaos",
                "Emotional & Measured",
                "Narrative Historian",
                "Atmospheric & Immersive",
                "Dreamlike & Fragmented"
              ],
              "description": "Explicitly defines the narrative style used for this object."
            },
            "events": {
              "type": "array",
              "description": "Key events that shape the narrative.",
              "items": {
                "type": "object",
                "properties": {
                  "event": { "type": "string" },
                  "importance": { "type": "string" },
                  "impact": { "type": "string" }
                },
                "required": ["event", "importance", "impact"]
              }
            }
          },
          "required": ["tone", "theme", "style_type", "events"]
        },
        "sequence": {
          "type": "object",
          "description": "Tracking for story progression, combining numerical identifiers and descriptive context. This dual approach ensures both machine-readable ordering and human-readable narrative context.",
          "properties": {
            "tracking": {
              "type": "object",
              "description": "Numerical tracking for story progression. These values should be positive integers that indicate the sequential position within each narrative level.",
              "properties": {
                "act": { 
                  "type": "integer", 
                  "minimum": 1, 
                  "description": "The act number within the storyline. Acts represent major narrative arcs with their own beginning, middle, and end. Example: 2 (representing Act II)." 
                },
                "volume": { 
                  "type": "integer", 
                  "minimum": 1, 
                  "description": "The volume number within the storyline. Volumes collect related stories into thematic units. Example: 1 (representing Volume I)." 
                },
                "story": { 
                  "type": "integer", 
                  "minimum": 1, 
                  "description": "The story number within the volume. Stories are complete narrative units. Example: 3 (representing the third story in a volume)." 
                },
                "chapter": { 
                  "type": "integer", 
                  "minimum": 1, 
                  "description": "The chapter number within the story. Chapters divide stories into manageable, focused sections. Example: 7 (representing Chapter 7)." 
                },
                "passage": { 
                  "type": "integer", 
                  "minimum": 1, 
                  "description": "The passage number within the chapter. Passages represent cinematic moments or significant scenes. Example: 2 (representing the second major scene in a chapter)." 
                },
                "part": { 
                  "type": "integer", 
                  "minimum": 1, 
                  "description": "The part number within the passage. Parts divide passages into discrete moments or beats. Example: 3 (representing the third beat in a scene)." 
                }
              },
              "required": ["act", "volume", "story", "chapter", "passage", "part"]
            },
            "description": {
              "type": "object",
              "description": "Descriptive details of the sequence progression, providing narrative clarity and context beyond simple numbering.",
              "properties": {
                "volume": { 
                  "type": "string", 
                  "description": "The larger thematic collection this story belongs to. Should indicate the overarching theme or era. Example: 'Volume I: The Age of Heroes'." 
                },
                "act": { 
                  "type": "string", 
                  "description": "The narrative act, defining major shifts in the story arc. Should indicate the phase of the hero's journey or dramatic structure. Example: 'Act II - The Trials of Yoshitsune'." 
                },
                "story": { 
                  "type": "string", 
                  "description": "The individual story within the act. Should have a distinct title that captures its central conflict or event. Example: 'The Bridge of Fate: Yoshitsune's First Great Victory'." 
                },
                "chapter": { 
                  "type": "string", 
                  "description": "A major event-based division within the story. Should include both numerical designation and descriptive title. Example: 'Chapter 3 - The Duel at Gojo Bridge'." 
                },
                "passage": { 
                  "type": "string", 
                  "description": "A focused cinematic moment within the chapter. Should have an evocative title suggesting mood and importance. Example: 'The Bridge That Would Decide Fate'." 
                },
                "part": { 
                  "type": "string", 
                  "description": "A smaller unit within the passage, covering specific actions or moments. Should clearly indicate what occurs in this discrete narrative beat. Example: 'Opening Duel Between Yoshitsune and Benkei'." 
                }
              },
              "required": ["act", "volume", "story", "chapter", "passage", "part"]
            }
          },
          "required": ["tracking", "description"]
        },
        "characters": {
          "type": "array",
          "description": "List of characters involved in this object. Each character should be fully developed with consistent attributes across all appearances in the narrative.",
          "items": {
            "type": "object",
            "properties": {
              "name": { 
                "type": "string",
                "description": "The primary name by which the character is known. Use full name with appropriate honorifics based on cultural context. Example: 'Minamoto no Yoshitsune'."
              },
              "alias": { 
                "type": "string",
                "description": "Alternative names, titles, or identities used by or for this character. Include pronunciations if needed. Example: 'Ushiwakamaru (childhood name), The Morning Sun General'."
              },
              "role": { 
                "type": "string",
                "description": "The character's function in the narrative. Use specific designations like 'Protagonist', 'Antagonist', 'Mentor', 'Ally', 'Guardian', etc. Example: 'Protagonist - Tragic Hero'."
              },
              "description": { 
                "type": "string",
                "description": "A comprehensive physical and psychological portrait of the character. Include distinctive features, typical attire, and notable mannerisms. Example: 'A slight but graceful samurai with piercing eyes and flowing black hair. Typically dressed in ornate armor with the Minamoto crest. Moves with supernatural quickness and precision.'"
              },
              "personality": { 
                "type": "string",
                "description": "The character's psychological traits, values, motivations, and typical behaviors. Include internal conflicts and growth trajectory. Example: 'Fiercely loyal but naive about political intrigue. Driven by family honor and martial perfection. Struggles with balancing compassion and duty. Evolves from impulsive youth to thoughtful leader.'"
              },
              "skills": {
                "type": "array",
                "description": "Abilities, talents, and competencies the character possesses. Listed in order of significance to their identity and narrative role.",
                "items": {
                  "type": "object",
                  "properties": {
                    "name": { 
                      "type": "string",
                      "description": "The name of the skill or ability. Be specific rather than general. Example: 'Eight-Directions Leaping Technique' rather than just 'Jumping'."
                    },
                    "type": { 
                      "type": "string",
                      "description": "The category of skill: 'Combat', 'Intellectual', 'Social', 'Supernatural', 'Technical', etc. Example: 'Combat - Special Technique'."
                    },
                    "description": { 
                      "type": "string",
                      "description": "Detailed explanation of how the skill works, its limitations, and significance. Example: 'A legendary technique allowing Yoshitsune to leap in eight directions instantly, confusing opponents and appearing to be in multiple places. Requires open space to execute fully.'"
                    }
                  },
                  "required": ["name", "type", "description"]
                }
              },
              "weapons": {
                "type": "array",
                "description": "Tools, weapons, or equipment the character uses regularly. Focus on items with narrative significance.",
                "items": {
                  "type": "object",
                  "properties": {
                    "name": { 
                      "type": "string",
                      "description": "The specific name of the weapon or item. Include any titles or designations. Example: 'Hizamaru (Sun-Splitter)'."
                    },
                    "type": { 
                      "type": "string",
                      "description": "The category of weapon: 'Sword', 'Bow', 'Armor', 'Magical Artifact', etc. Example: 'Tachi Sword - Heirloom'."
                    },
                    "description": { 
                      "type": "string",
                      "description": "Detailed information about the weapon's appearance, history, powers, and significance to the character. Example: 'A slender tachi with a distinctive blue-tinted blade, passed down through the Minamoto clan. Said to be forged with metal from a fallen star. Symbolizes Yoshitsune's legitimate claim to leadership.'"
                    }
                  },
                  "required": ["name", "type", "description"]
                }
              },
              "backstory": {
                "type": "string",
                "description": "The character's relevant history prior to the current narrative. Focus on formative events that explain current motivations and relationships. Example: 'Sent to a monastery at age 7 after his father's execution for treason, Yoshitsune was raised by warrior monks who secretly trained him in martial arts against the emperor's orders.'"
              },
              "arc": {
                "type": "string",
                "description": "The character's intended development trajectory through the narrative. Include initial state, catalysts for change, and intended final state. Example: 'Begins as a sheltered but talented youth seeking to restore family honor; experiences betrayal from brother Yoritomo that transforms his worldview; ultimately chooses personal honor over survival, becoming a tragic legend.'"
              },
              "relationships": {
                "type": "array",
                "description": "Key connections to other characters that influence this character's actions and development.",
                "items": {
                  "type": "object",
                  "properties": {
                    "character": { 
                      "type": "string",
                      "description": "The name of the related character. Should match the primary name of another character in the system. Example: 'Musashibō Benkei'."
                    },
                    "nature": { 
                      "type": "string",
                      "description": "The type of relationship: 'Ally', 'Enemy', 'Family', 'Mentor', 'Rival', etc. Example: 'Loyal Retainer and Protector'."
                    },
                    "dynamics": { 
                      "type": "string",
                      "description": "How these characters interact, influence each other, and evolve together. Example: 'Initially enemies after Benkei challenged Yoshitsune at Gojo Bridge; became unwavering allies with Benkei serving as both bodyguard and conscience; culminates in Benkei's legendary last stand to protect Yoshitsune's escape.'"
                    }
                  },
                  "required": ["character", "nature", "dynamics"]
                }
              }
            },
            "required": ["name", "role", "description"]
          }
        },
        "timeline": {
          "type": "object",
          "properties": {
            "start": {
              "type": "string",
              "format": "date",
              "description": "Start date of the events."
            },
            "end": {
              "type": ["string", "null"],
              "format": "date",
              "description": "End date of the events (if known); null if ongoing or unknown."
            }
          },
          "required": ["start"]
        },
        "location": {
          "type": "object",
          "description": "Detailed information about a physical or virtual setting where narrative events occur. Locations should be treated as characters with their own history and personality.",
          "properties": {
            "name": { 
              "type": "string",
              "description": "The primary identifier for this location. Include both common and formal names as appropriate. Example: 'Gojo Bridge (Fifth Avenue Bridge)' or 'Mount Hiei Monastery'."
            },
            "description": { 
              "type": "string",
              "description": "A comprehensive portrayal of the location's physical characteristics, atmosphere, and sensory details. Should include visual, auditory, olfactory, and tactile elements. Example: 'A long wooden bridge spanning the Kamo River, worn smooth by centuries of travelers. The wood creaks underfoot, mingling with the sound of rushing water below. Cherry trees line both banks, their petals occasionally drifting onto the dark water when in bloom.'"
            },
            "historical_significance": { 
              "type": "string",
              "description": "The location's importance in the story world's history and culture. Include any legendary events, cultural associations, or symbolic meanings. Example: 'Gojo Bridge marks the southern entrance to the imperial capital, traditionally guarded by warrior monks. Famous as the site where Benkei challenged passing warriors, collecting 999 swords before his defeat by Yoshitsune became legendary.'"
            },
            "geographical_coordinates": { 
              "type": "string",
              "description": "Positional information placing this location within the story world. For real-world locations, use actual coordinates; for fictional locations, describe position relative to known landmarks. Example: '35.0116° N, 135.7681° E - Southern Kyoto, connecting the eastern and western banks of the Kamo River'."
            },
            "map_properties": {
              "type": "object",
              "description": "Properties related to map generation for this location. These details guide visual representation of the setting across different media.",
              "properties": {
                "status": {
                  "type": "string",
                  "enum": ["pending", "passed", "failed"],
                  "description": "The current state of map generation for this location. Use 'pending' for locations awaiting map creation, 'passed' when a satisfactory map exists, and 'failed' when attempts at map generation have been unsuccessful."
                },
                "map_prompt_text": {
                  "type": "string",
                  "description": "The dynamically generated prompt for creating a location map, adjusted based on the story's timeline. Should specify style, perspective, key elements, and atmospheric conditions. Example: 'Create a parchment-style overhead map of Gojo Bridge in 1180 CE Kyoto, showing wooden bridge structure, nearby temple, river currents, and approaching storm clouds. Include cherry trees along the riverbank and small boats moored nearby. Style should evoke traditional Japanese woodblock prints with muted colors.'"
                },
                "timeline_integration": {
                  "type": "string",
                  "description": "Details how the map adjusts to different time periods throughout the narrative. Specify the visual style, technological level, and key changes that occur over time. Example: 'Early periods (1160-1185 CE): Hand-drawn on rice paper with ink wash technique, focusing on natural landmarks and wooden structures. Middle periods (1185-1600): Painted scroll maps with more detailed architectural features and military positions. Modern representation: Satellite imagery overlaid with historical reconstruction, showing both current urban development and historical layout.'"
                },
                "map_style": {
                  "type": "string",
                  "description": "The artistic or visual style applied to the map representation. Should match the narrative tone and historical period. Example: 'Heian period Japanese artistic style with limited perspective, simplified architectural representation, and emphasis on natural elements. Text labels in period-appropriate calligraphy. Color palette focuses on indigo, umber, and gold tones.'"
                },
                "map_elements": {
                  "type": "array",
                  "description": "Key elements that should appear on the map. List in order of visual importance.",
                  "items": {
                    "type": "object",
                    "properties": {
                      "name": { 
                        "type": "string",
                        "description": "The identifier for this map element. Should be specific and descriptive. Example: 'Gojo Bridge Main Span' or 'Eastern Guard House'."
                      },
                      "type": { 
                        "type": "string",
                        "description": "The category of this element: 'Structure', 'Natural Feature', 'Boundary', 'Path', etc. Example: 'Structure - Bridge' or 'Natural Feature - River Rapids'."
                      },
                      "description": { 
                        "type": "string",
                        "description": "Detailed information about this element's appearance, function, and significance. Example: 'Wooden bridge supported by stone pillars, wide enough for two horses to pass. Features a small shrine at the center point where travelers leave offerings for safe passage.'"
                      },
                      "importance": { 
                        "type": "string",
                        "description": "Why this element matters to the narrative and how it should be emphasized visually. Example: 'Central to the famous duel scene - should be prominently featured with enough detail to show where characters stood during combat.'"
                      }
                    },
                    "required": ["name", "type"]
                  }
                },
                "interactive_elements": {
                  "type": "array",
                  "description": "Features of the location that can change or be interacted with during the narrative. These elements may appear differently depending on narrative context.",
                  "items": {
                    "type": "object",
                    "properties": {
                      "name": { 
                        "type": "string",
                        "description": "Identifier for this interactive element. Example: 'Bridge Central Planks'."
                      },
                      "interactions": { 
                        "type": "array",
                        "description": "Possible states or changes this element can undergo.",
                        "items": {
                          "type": "object",
                          "properties": {
                            "trigger": { 
                              "type": "string",
                              "description": "What causes this element to change. Example: 'Combat scene between Benkei and Yoshitsune'."
                            },
                            "result": { 
                              "type": "string",
                              "description": "How the element appears after interaction. Example: 'Planks shown with sword cuts and split wood from the intensity of combat'."
                            }
                          },
                          "required": ["trigger", "result"]
                        }
                      }
                    },
                    "required": ["name", "interactions"]
                  }
                }
              },
              "required": ["status", "map_prompt_text", "timeline_integration"]
            },
            "ambient_features": {
              "type": "object",
              "description": "Atmospheric and environmental aspects of the location that contribute to mood and immersion.",
              "properties": {
                "typical_weather": { 
                  "type": "string",
                  "description": "Common climate conditions at this location. Example: 'Prone to sudden summer thunderstorms and misty mornings year-round due to proximity to the river.'"
                },
                "sounds": { 
                  "type": "string",
                  "description": "Characteristic auditory elements of this location. Example: 'Creaking wood, flowing water, distant temple bells, merchants calling from nearby stalls, and the clop of horse hooves on the wooden planks.'"
                },
                "lighting": { 
                  "type": "string",
                  "description": "Typical light conditions and notable visual effects. Example: 'Dappled sunlight through riverside trees creates shifting patterns on the bridge surface. At night, occasional lanterns from passing travelers create isolated pools of warm light.'"
                }
              },
              "required": ["typical_weather", "sounds", "lighting"]
            }
          },
          "required": ["name", "description", "historical_significance", "geographical_coordinates", "map_properties"]
        },
        "multimedia": {
          "type": "object",
          "properties": {
            "image_generation": {
              "type": "object",
              "properties": {
                "prompt_text": { "type": "string" },
                "status": { 
                  "type": "string",
                  "enum": ["pending", "passed", "failed"]
                },
                "failure_reason": { 
                  "type": ["string", "null"],
                  "description": "Provided if status is 'failed'; null otherwise."
                }
              },
              "required": ["prompt_text", "status"]
            },
            "video_generation": {
              "type": "object",
              "properties": {
                "prompt_text": { "type": "string" },
                "status": {
                  "type": "string",
                  "enum": ["pending", "passed", "failed"]
                },
                "failure_reason": { 
                  "type": ["string", "null"],
                  "description": "Provided if status is 'failed'; null otherwise."
                }
              },
              "required": ["prompt_text", "status"]
            },
            "audio_references": {
              "type": "array",
              "description": "Audio elements that enhance the narrative experience",
              "items": {
                "type": "object",
                "properties": {
                  "id": {
                    "type": "string",
                    "description": "Unique identifier for this audio element"
                  },
                  "description": {
                    "type": "string",
                    "description": "What the audio represents or conveys"
                  },
                  "timing": {
                    "type": "string",
                    "description": "When in the narrative this audio should play"
                  },
                  "emotional_impact": {
                    "type": "string",
                    "description": "Intended emotional effect on the audience"
                  }
                },
                "required": ["id", "description"]
              }
            }
          }
        },
        "tags": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "key": { "type": "string" },
              "value": { "type": "string" }
            },
            "required": ["key", "value"]
          }
        },
        "source": {
          "type": ["string", "null"],
          "description": "Original source or external citation if applicable; null if original."
        },
        "prose_variation": {
          "type": "object",
          "description": "Techniques used to ensure natural writing variation",
          "properties": {
            "sentence_length_pattern": {
              "type": "string",
              "description": "Pattern of sentence lengths used. Example: 'Short-medium-long rhythm with occasional very short sentences for emphasis'"
            },
            "paragraph_structure": {
              "type": "string",
              "description": "Pattern of paragraph organization. Example: 'Varying between 2-5 sentences, with descriptive paragraphs interspersed with dialogue-heavy ones'"
            },
            "vocabulary_variation": {
              "type": "string",
              "description": "Approach to word choice diversity. Example: 'Using varied synonyms for common actions (walked, strode, ambled) while maintaining period-appropriate language'"
            },
            "dialog_tag_approach": {
              "type": "string",
              "description": "How dialogue is attributed. Example: 'Minimal tags with action beats for major characters, more descriptive tags for minor characters'"
            }
          },
          "required": ["sentence_length_pattern", "paragraph_structure"]
        },
        "narrative_techniques": {
          "type": "array",
          "description": "Special narrative approaches used in this content",
          "items": {
            "type": "object",
            "properties": {
              "technique": {
                "type": "string",
                "enum": [
                  "foreshadowing",
                  "flashback",
                  "unreliable_narrator",
                  "dramatic_irony",
                  "frame_story",
                  "epistolary",
                  "stream_of_consciousness",
                  "dual_timeline",
                  "parallel_plots",
                  "non_linear_narrative"
                ]
              },
              "implementation": {
                "type": "string",
                "description": "How this technique is specifically used"
              }
            },
            "required": ["technique", "implementation"]
          }
        }
      },
      "required": [
        "id",
        "name",
        "object_type",
        "status",
        "verified",
        "sequence",
        "tags",
        "writing_style"
      ]
    }
  },
  "required": ["metadata"]
}
```

## Schema Implementation Guide

When implementing the AI Writing Metadata Schema:

1. **Generate UUIDs** for all new content objects using UUID v4 format
2. **Maintain hierarchy consistency** by ensuring parent-child relationships are properly defined
3. **Apply appropriate writing style** based on scene type and narrative purpose
4. **Use prose variation techniques** to ensure natural writing flow
5. **Include complete multimedia references** for all visual and audio elements
6. **Validate metadata** against the complete schema before submission

All metadata elements should be comprehensive enough to support both human understanding and AI processing of narrative content. Detailed metadata enables consistent story development, accurate cross-referencing, and effective multimedia generation throughout The Shadow Team Chronicles universe.

The schema will continue to evolve as the narrative universe expands, with new properties and enhancements added to support increasingly sophisticated storytelling techniques.
