---

title: "AI Writing Metadata Schema"
type: "Mandatory Instructions"
status: "Active Enforcement Layer"
author: "Tristan"
version: "2.1"
date_created: "2025-03-26"
---

# AI Writing Metadata Schema

This document defines the complete metadata schema structure used by the StoryTeller system.

It is the **canonical source of truth** for:

- JSON structure of narrative objects (`chapter`, `passage`, `part`, etc.)
- Image and video prompt formatting
- Execution stage enforcement
- DB patch/overwrite behavior
- Post-generation validation checkpoints

No object, prompt, or metadata may be considered valid without following this schema.

---

## Table of Contents

# Table of Contents

## [AI Writing Metadata Schema](#ai-writing-metadata-schema)
- [Table of Contents](#table-of-contents)
- [Purpose](#purpose)
- [Execution Rules](#execution-rules)
- [Base Object Schema](#base-object-schema)
- [Image and Video Prompt Schema](#image-and-video-prompt-schema)
- [Status Stages](#status-stages)
- [Entity Creation and Overwrite Rules](#entity-creation-and-overwrite-rules)
- [Post-Generation Validation](#post-generation-validation)
- [Complete JSON Schema](#complete-json-schema)
- [Schema Implementation Rules That MUST BE STRICTLY FOLLOWED BY THE AI ASSISTANT](#schema-implementation-rules-that-must-be-strictly-followed-by-the-ai-assistant)
- [Writing Structure & Execution Compliance](#writing-structure--execution-compliance)
- [Canon Lock Mode](#canon-lock-mode)
- [Story-First Approval Workflow](#story-first-approval-workflow)
- [Metadata Schema Enforcement](#metadata-schema-enforcement)
- [Metadata Validation Rules](#metadata-validation-rules)
- [Embedded Metadata Placement](#embedded-metadata-placement)
- [Image and Video Prompts (After Approval Only)](#image-and-video-prompts-after-approval-only)
- [Schema Scope](#schema-scope)
- [Update Authority](#update-authority)

## [🔄 Story-First Approval Workflow](#story-first-approval-workflow)
- [Purpose](#story-first-approval-workflow-purpose)
- [Enforcement Rules](#story-first-approval-workflow-enforcement-rules)
- [Workflow Integration](#story-first-approval-workflow-workflow-integration)

---

## Purpose

This schema governs the **metadata format and enforcement logic** for every narrative unit (Part, Passage, Chapter) produced within *The Shadow Team Chronicles*. In addition to defining fields, types, and examples, it **duplicates critical narrative and execution rules** from `000`, `001`, and `002` to ensure behavioral enforcement is applied at both process and structure level.

---

## Execution Rules

These core rules are duplicated from `000–002` and must be enforced before or during metadata generation.

### 🧩 Canon + Draft Enforcement

- All narrative in `draft` or `final` stage must **reuse existing approved draft content** unless the user explicitly instructs otherwise.  
- **Canon Lock** is the default state: no invention, paraphrasing, or summarizing allowed.

### 🕓 Execution Stage Gating

| status | Description |
|------------------|-------------|
| concept          | Freeform, exploratory. No enforcement. |
| draft            | Structure + tone enforced. Scene editable. |
| final            | Canon-locked. No changes allowed unless retro-approved. |

> ⚠️ `metadata`, `image_prompt`, and `video_prompt` fields may **not** be populated unless `status = final` and narrative has been **explicitly approved** by the user.

### ⏸️ Story-First Approval Workflow (From `002`)

- The AI must **pause** after narrative content is written.  
- **No metadata or multimedia** (image prompt, Sora, video, etc.) may be generated until the user approves the story.

### 📏 Minimum Requirements Per Part

Every narrative Part must:

- Be between **725–850 words**
- Use **at least 3 prose variation techniques** from the approved list
- Include **metadata JSON** at the top once approved
- Include a **summary of scene elements** (before or after metadata, not inside)

### 🧠 User Overrides Always Win

- User instructions in chat override all metadata fields and schema rules—except schema structure itself.
- Overrides must be documented when they alter standard process.

---

## Base Object Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Narrative Object Metadata",
  "description": "Metadata applied to any narrative object in the StoryTeller hierarchy.",
  "type": "object",
  "required": ["object_type", "id", "status", "writing_style", "scene_type"],
  "properties": {
    "object_type": {
      "type": "string",
      "enum": ["storyline", "volume", "act", "story", "chapter", "passage", "part"]
    },
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "Automatically generated unique identifier (UUIDv4)."
    },
    "status": {
      "type": "string",
      "enum": ["concept", "draft", "final"],
      "description": "Controls behavioral logic and enforcement strictness."
    },
    "writing_style": {
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
    },
    "scene_type": { "type": "string" },
    "dialogue_tag_style": { "type": "string" },
    "character_dynamic": { "type": "string" },
    "description_focus": { "type": "string" },
    "emotional_tone": { "type": "string" },
    "narrative_pacing": { "type": "string" }
  }
}
```

---

## Image and Video Prompt Schema

All multimedia prompts must be provided as separate JSON objects with strict tracking:

```json
{
  "image_prompt": {
    "prompt_text": "A cinematic shot of Yoshi standing on Gojo Bridge at first light, katana drawn...",
    "status": "passed",
    "failure_reason": null
  },
  "video_prompt": {
    "prompt_text": "A slow cinematic zoom across the misty bridge during the duel...",
    "status": "pending"
  }
}
```

- Image prompts must reflect detailed physical, historical, and canonical visual cues
- Prompt data must be drawn from `chat history`, `character_database.json`, `artifact_database.json`, and `event_database.json`
- Prompt generation is **deferred until narrative approval**

---

## Status Stages

Every object and Part must define its `status`:

- `concept`: No enforcement. Used for brainstorming only.
- `draft`: Enforced structure, but flexible prose. DB/Canon adherence preferred.
- `final`: Full canon lock. All validations, schema, and references required.

Multimedia generation and metadata completion must happen in all stages and must be kept in sync and accurate with the chat history and json DB files and schemas.

---

## Entity Creation and Overwrite Rules

When introducing new characters, locations, or items:

1. **Generate full object JSON** in chat
2. Include all fields from existing DB + new fields
3. If object exists, reprint **entire record** with all updates (no patch fragments)

Schema must be sourced from corresponding DB schemas and include at a minimum:

- `id`, `name`, `description`, `object_type`, `timeline`, `story_references`, and `multimedia` block

Depending on the object type addtional fields + values can be included provided they conform to the pre-defined json object schemas

---

## Post-Generation Validation

After content is written, enforce:

```json
"post_generation_validation": true,
"validation_targets": [
  "character_consistency",
  "timeline_alignment",
  "dialogue_accuracy",
  "weapon_and_attire_check",
  "scene_location_check",
  "known_event_conformance"
]
```

Validation must reference:

- `character_database.json`  
- `timeline_database.json`  
- `event_database.json`  
- `storyline_draft`  
- `artifact_database.json`  
- `location_database.json`

Narrative must not be approved or finalized until all fields are valid.

---

## Enforcement and Reference Priority

This schema overrides:

- Any inferred metadata logic
- Part structure defined in code or AI workflow
- Older versions of `000–003` unless explicitly overridden

Metadata, object creation, and multimedia prompts must always refer back to **this file**.

**No metadata field, object type, or prompt may be generated without referencing this schema.**

---

==================================================================================================

## Complete JSON Schema

The following is the complete JSON schema that defines the metadata structure requirements for all content . This schema must always be used, and strictly adhered to all json objects must be validated and consistent across all metadata objects.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "AI Writing Metadata Schema",
  "description": "Defines the structure for metadata tracking.",
  "type": "object",
  "properties": {
    "metadata": {
      "type": "object",
      "description": "Encapsulates all metadata properties for tracking and execution.",
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid",
          "description": "A globally unique identifier (UUID v4) for this object.",
          "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
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
          "enum": ["concept","draft", "final"],
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
                    "format": "uuid",
                    "description": "Unique identifier for this audio element",
                    "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
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

## Schema Implementation Rules that MUST BE STRICTLY FOLLOWED BY THE AI ASSISTANT

When implementing the AI Writing Metadata Schema, the AI Assistant MUST ALWAYS:

1. **Generate UUIDs** for all new content objects using automatically generated unique UUID v4 format strings
2. **Maintain hierarchy consistency** by ensuring parent-child relationships are properly defined
3. **Apply appropriate writing style** based on scene type and narrative purpose
4. **Use prose variation techniques** to ensure natural writing flow
5. **Include complete multimedia references** for all visual and audio elements
6. **Validate metadata** against the complete schema before submission

- All metadata elements must always be comprehensive enough to support both human understanding and AI processing of narrative content.
- In accurate metadata must always be updated.
- Detailed metadata enables consistent story development, accurate cross-referencing, and effective multimedia generation must be maintained by the AI assistant.

**AI must strictly adhere to the json object schemas detailed in this file with no substituting fields or values if they are not defined.**

### Status Stages

Every object and Part must define its `status`:

- `concept`: No enforcement. Used for brainstorming only.
- `draft`: Enforced structure, but flexible prose. DB/Canon adherence preferred.
- `final`: Full canon lock. All validations, schema, and references required.

Multimedia generation and metadata completion must happen in all stages and must be kept in sync and accurate with the chat history and json DB files and schemas.

---

### Entity Creation and Overwrite Rules

When introducing new characters, locations, or items:

1. **Generate full object JSON** in chat
2. Include all fields from existing DB + new fields
3. If object exists, reprint **entire record** with all updates (no patch fragments)

Schema must be sourced from corresponding DB schemas and include at a minimum:

- `id`, `name`, `description`, `object_type`, `timeline`, `story_references`, and `multimedia` block

Depending on the object type addtional fields + values can be included provided they conform to the pre-defined json object schemas

---

### Post-Generation Validation

After content is written, enforce:

```json
"post_generation_validation": true,
"validation_targets": [
  "character_consistency",
  "timeline_alignment",
  "dialogue_accuracy",
  "weapon_and_attire_check",
  "scene_location_check",
  "known_event_conformance"
]
```

Validation must reference:

- `character_database.json`  
- `timeline_database.json`  
- `event_database.json`  
- `storyline_draft`  
- `artifact_database.json`  
- `location_database.json`

Narrative must not be approved or finalized until all fields are valid.

---

### Enforcement and Reference Priority

This schema overrides:

- Any inferred metadata logic
- Part structure defined in code or AI workflow
- Older versions of `000–002` unless explicitly overridden

Metadata, object creation, and multimedia prompts must always refer back to **this file**.

**No metadata field, object type, or prompt may be generated without referencing this schema.**

---

## Writing Structure & Execution Compliance

Narrative content must comply with the following structure and enforcement logic:

- Storyline → Volume → Act → Story → Chapter → Passage → Part
- All Parts must contain 725–850 words (Final Stage)
- All Final Parts must include **at least 3 prose variation techniques**
- Each Part must begin with a valid metadata block, with the following required fields:
  - `scene_type`
  - `writing_style`
  - `emotional_tone`
  - `dialogue_tag_style`
  - `status`

Parts may follow the standard scene progression:

1. Entry  
2. Tension  
3. Beat Shift  
4. Fallout

Pacing, realism, and sensory continuity must be respected.  

## Canon Lock Mode

Narrative content must reuse existing draft or approved content wherever available.

- No paraphrasing, summarizing, or skipping beats unless explicitly approved
- Formatting and mechanical edits are allowed only when they do not alter intent
- No future-facing exposition or narrator commentary may be introduced in Final Stage content

## Story-First Approval Workflow

Narrative content must be approved by the user **before** generating:

- Structured metadata
- Image prompt proposals
- Image generation
- Sora prompt or video embedding

Generation must pause after narrative creation.  
No visual or metadata assets may be produced without user approval.  

## Metadata Schema Enforcement

All metadata must:

- Match required schema field names and data types  
- Include canonical scene fields from `AI_Writing_Metadata_Schema.md`  
- Embed accurate contextual references (`chapter_id`, `passage_id`, etc.)

Metadata validation is mandatory before multimedia assets are proposed.

## Metadata Validation Rules

Before metadata is accepted, validate:

✅ All required fields are present  
✅ All enums (`status`, `scene_type`, etc.) use approved values  
✅ `word_count` is between 725–850  
✅ `prose_techniques` includes at least 3  
✅ If `status = final`, narrative must be approved  
✅ Metadata must match referenced Chapter and Passage context

---

## Embedded Metadata Placement

- Each **Part** begins with a metadata JSON block (before narrative begins)
- Each **Passage** begins with a metadata block in the chat
- Each **Chapter** begins in its own file with a JSON header + H1 title

---

## Image and Video Prompts (After Approval Only)

Image and video prompts may not be embedded until the Part is approved.

They follow JSON schema patterns like:

```json
{
  "image_prompt": {
    "description": "Rain-soaked Gojo Bridge at dusk. The Hawk and the Bear stare across the stone arch. Tension in their eyes. Ancient Japanese robes. Lightning above.",
    "scene_reference": "Part 1, The Duel at Gojo Bridge",
    "style": "Cinematic, 4K, painterly realism"
  }
}
```

---

## Schema Scope

This schema governs all writing and metadata structure within:

- The Shadow Team Chronicles  
- All Volumes, Acts, Stories, and Chapters  
- All execution phases except `concept`

---

## Update Authority

Only the user may modify this schema.  
Any updates must be confirmed in chat and immediately take effect across all generation systems.

---

## Execution Rules

These core rules are duplicated from `000–002` and must be enforced before or during metadata generation.

### 🧩 Canon + Draft Enforcement

- All narrative in `draft` or `final` stage must **reuse existing approved draft content** unless the user explicitly instructs otherwise.  
- **Canon Lock** is the default state: no invention, paraphrasing, or summarizing allowed.

### 🕓 Execution Stage Gating

| status | Description |
|------------------|-------------|
| concept          | Freeform, exploratory. No enforcement. |
| draft            | Structure + tone enforced. Scene editable. |
| final            | Canon-locked. No changes allowed unless retro-approved. |

> ⚠️ `metadata`, `image_prompt`, and `video_prompt` fields may **not** be populated unless `status = final` and narrative has been **explicitly approved** by the user.

### ⏸️ Story-First Approval Workflow (From `002`)

- The AI must **pause** after narrative content is written.  
- **No metadata or multimedia** (image prompt, Sora, video, etc.) may be generated until the user approves the story.

### 📏 Minimum Requirements Per Part

Every narrative Part must:

- Be between **725–850 words**
- Use **at least 3 prose variation techniques** from the approved list
- Include **metadata JSON** at the top once approved
- Include a **summary of scene elements** (before or after metadata, not inside)

### 🧠 User Overrides Always Win

- User instructions in chat override all metadata fields and schema rules—except schema structure itself.
- Overrides must be documented when they alter standard process.

---


# 🔄 Story-First Approval Workflow

## Purpose  
Narrative content must be fully approved before any metadata, image prompt, or video generation occurs. This ensures maximum creative control and fidelity to tone, pacing, and canon.

## Enforcement Rules  
✅ Narrative Parts must be **written and approved** before continuing to:
- Metadata generation  
- Image prompt creation  
- Image generation  
- Sora prompt creation  
- Multimedia embedding  

❌ Do not automatically generate metadata or visual prompts during the initial narrative pass.

## Workflow Integration  
The standard Execution Plan is modified as follows:

### Step 1️⃣: Narrative Content Generation  
Write the story Part as normal.  
✅ **STOP HERE UNTIL USER APPROVES.**

---

### Step 2️⃣: Metadata Generation (after approval)  
Generate structured metadata only after the narrative is approved.

### Step 3️⃣: Image Prompt Proposal  
Create the detailed image prompt once the scene has been locked.

### Step 4️⃣: Image Generation  
Submit prompt for generation; mark status accordingly.

### Step 5️⃣: Sora Video Prompt  
Create and submit the cinematic video prompt based on approved image.

### Step 6️⃣: Database Object Generation  
Generate complete JSON database objects for all entities introduced or modified in the narrative:
- Create fully structured JSON objects that strictly follow the schema requirements
- Include all required fields, relationships, and metadata for each entity
- Generate objects for characters, locations, events, relationships, artifacts, etc.
- Prepare objects that can be directly inserted into their respective database files
- Include clear instructions for which database files need updating

### Step 7️⃣: Final Metadata Assembly  
Bundle the full structured metadata, multimedia references, and content into a complete Part record.

## Rationale  
This change protects creative quality, pacing, and authorial intent by prioritizing story-first development before structural and visual outputs are generated.
