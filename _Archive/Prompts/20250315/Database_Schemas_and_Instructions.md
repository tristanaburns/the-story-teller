# Database_Schemas_and_Instructions.md

## JSON Object Schema Instructions

# JSON Schema Development Instructions for The Shadow Team Chronicles

## Overview and Purpose

These instructions guide the development of comprehensive JSON schemas for The Shadow Team Chronicles universe. These schemas serve as the foundational structure for our world-building database, character relationships, and narrative elements. Well-designed schemas ensure consistency across the project and enable efficient data retrieval and visualization.

## Source Material Review Requirements

Before creating or modifying any schema, thoroughly analyze the following source files:

- `Database_Schemas_and_Instructions.md` - Contains existing schema definitions and implementation guidelines
- `The Shadow Team Chronicles - ALL CHAT HISTORY - UNCATAGORISED.md` - Contains raw development conversations with potential schema requirements
- `ChatGPT_Chat_1742020196213_The_Shadow_Team_Chronicles_-_Continuation_of_The_warriors_oath_storyline.md` - Contains story-specific schema requirements

## Core Schema Implementation Requirements

Before developing new schemas or modifying existing ones:

For schema-wide consistency, all objects must include these base properties:

- `id` - A UUID v4 identifier (format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx, where x is any hexadecimal digit and y is one of 8, 9, A, or B)
- `name` - A descriptive title
- `description` - A comprehensive explanation
- `object_type` - The categorical classification

- **Extend, Don't Override**: When adding schema-specific properties, extend the base schema rather than creating parallel structures
- **Validation Enforcement**: Include appropriate validation rules to enforce base property requirements
- **Documentation Requirements**: Document inheritance relationships between schemas in schema headers

These requirements ensure consistency across the system and enable efficient cross-referencing between different object types within The Shadow Team Chronicles universe.

## Schema Development Guidelines

### 1. Schema Consistency Principles

- **Maintain Schema Integrity**: Identify all existing property keys, object structures, and nomenclature conventions from previous schemas.
- **Reuse Existing Elements**: Always use previously defined property names, object structures, and enumeration values rather than creating new ones for the same concept.
- **Documentation First**: Every property and object must include verbose descriptions explaining its purpose, expected value format, and usage context.

### 2. Structural Requirements

- **Use Nested Objects**: Structure complex data as nested objects rather than flat structures to maintain proper hierarchical relationships.
- **Limit Array Usage**: Only implement arrays when representing:
  - Simple collections of primitive values (strings, numbers, boolean)
  - Well-defined lists where order matters
  - Collections of objects that share identical structure

### 3. Required Documentation Elements

For each schema object:

- **Purpose Statement**: Define what the schema represents within the universe
- **Property Descriptions**: Include detailed explanations of each property (min. 30 words per description)
- **Example Values**: Provide real-world examples for complex properties
- **Relationship Context**: Explain how the schema relates to other schemas in the system

## Output Format Requirements

For each identified JSON schema:

1. Create a separate `.json` file with an appropriate descriptive filename
2. Include comprehensive $schema reference and metadata
3. Format using proper JSON indentation (2 spaces)
4. Include verbose comments or descriptions for every property and nested object
5. Add validation constraints where appropriate (min/max values, regex patterns, etc.)

## Quality Control Checklist

- [ ] All property names follow consistent naming conventions
- [ ] Every property and object includes detailed descriptions
- [ ] No arrays used for complex hierarchical data that should be objects
- [ ] Schema reuses existing terminology from other schema files
- [ ] Schema includes all required metadata fields
- [ ] Descriptions provide clear guidance on how to populate each field

## Example of Well-Documented Property

```json
"geographical_data": {
  "type": "object",
  "description": "Comprehensive spatial positioning information that precisely locates this element within the universe. For planetary locations, this includes standard Earth-like coordinate systems. For space-based locations, this provides galactic positioning relative to known reference points.",
  "properties": {
    "latitude": {
      "type": "number",
      "minimum": -90,
      "maximum": 90,
      "description": "The north-south position in degrees relative to the equator of the celestial body. Positive values indicate northern hemisphere, negative values indicate southern hemisphere. Must be between -90 (South Pole) and 90 (North Pole)."
    }
  }
}
```

**DO NOT DIRECTLY UPDATE THE FILE, JUST PRINT THE RESULT TO THE CHAT**

---

## **AI Writing Metadata JSON Object Schema**

---

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

---

## Character Database JSON Schema

=========================================================================================
=========================================================================================

=========================================================================================
=========================================================================================

=========================================================================================
=========================================================================================

=========================================================================================
=========================================================================================

# The Shadow Team Chronicles Database Schemas

This directory contains the JSON Schema definitions for The Shadow Team Chronicles universe's database structure. These schemas provide consistent data models for characters, locations, events, and other world-building elements.

## Core Schemas

- **[base_metadata_schema.json](base_metadata_schema.json)** - The foundation schema with common fields used by all other schemas
- **[character_schema.json](character_schema.json)** - Full character definition schema
- **[location_schema.json](location_schema.json)** - Location and geographic elements schema
- **[historical_event_schema.json](historical_event_schema.json)** - Events schema
- **[organization_schema.json](organization_schema.json)** - Groups, factions, and organizations schema
- **[artifact_schema.json](artifact_schema.json)** - Significant objects and items schema
- **[technology_schema.json](technology_schema.json)** - Technology and inventions schema

## Reference Integration

Each schema references other schemas using `$ref` to maintain consistency and reduce duplication:

### Time-Related References
- `common/timestamp_schema.json` - Standard datetime format
- `common/time_period_schema.json` - Standard time span format
- `timeline/` - Directory containing temporal positioning schemas

### Location References
- `common/location_reference_schema.json` - Standard location reference 
- `location/` - Directory containing location component schemas

### Object References
- `common/object_reference_schema.json` - Standard object reference format

## Integration Points

- The `timeline_references_schema.json` and `storyline_references_schema.json` are linked through cross-references described in `timeline_storyline_integration.md`.
- Characters, locations, and events share common reference formats for consistency.

## Usage Guidelines

1. Always use UUID references when linking between objects
2. Maintain bi-directional references where appropriate
3. Use the appropriate common schema components rather than defining inline
4. Follow the modular approach established in organization schemas

For detailed integration examples, see [timeline_storyline_integration.md](timeline_storyline_integration.md).

```
