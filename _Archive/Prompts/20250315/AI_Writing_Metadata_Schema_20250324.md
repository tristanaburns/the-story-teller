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
