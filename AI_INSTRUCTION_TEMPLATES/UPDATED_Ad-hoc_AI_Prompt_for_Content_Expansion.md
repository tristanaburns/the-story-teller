---

```yaml
title: "Ad-hoc AI Prompt for Content Expansion and Metadata Compliance"
description: "Expands narrative content while enforcing schema-compliant structure and embedding all required metadata and multimedia generation logic."
version: "2.1"
author: "Tristan"
last_updated: "2025-03-24"
type: "AI Expansion Prompt"
```

---

# UPDATED_Ad-hoc_AI_Prompt_for_Content_Expansion.md

## 🧠 Primary Objective
Expand a given narrative excerpt into multiple parts or passages using the correct storytelling hierarchy, metadata schema, and multimedia prompts. This process must strictly follow all defined writing rules, prose control constraints, and content metadata integration outlined in the project documentation and `AI_Writing_Metadata_Schema.md`.

---

[UPDATED_Ad-hoc_AI_Prompt_for_Content_Expansion.md](#updated-ad-hoc_ai_prompt_for_content_expansionmd)  
&nbsp;&nbsp;&nbsp;&nbsp;[🧠 Primary Objective](#-primary-objective)  
&nbsp;&nbsp;&nbsp;&nbsp;[🔁 Execution Steps (AI Must Follow)](#-execution-steps-ai-must-follow)  
&nbsp;&nbsp;&nbsp;&nbsp;[📌 **IMPORTANT - Prepare and read CONTENT SOURCE FILES and DATABASE STRUCTURE AND REFERENCES**](#-important---prepare-and-read-content-source-files-and-database-structure-and-references)  
&nbsp;&nbsp;&nbsp;&nbsp;[1. **Validate Content Input**](#1-validate-content-input)  
&nbsp;&nbsp;&nbsp;&nbsp;[2. **Apply Writing Schema**](#2-apply-writing-schema)  
&nbsp;&nbsp;&nbsp;&nbsp;[3. **Generate Natural-Length Content**](#3-generate-natural-length-content)  
&nbsp;&nbsp;&nbsp;&nbsp;[4. **Ensure Variability**](#4-ensure-variability)  
&nbsp;&nbsp;&nbsp;&nbsp;[5. **Preserve Dialogue & Enhance Audiobook Flow**](#5-preserve-dialogue--enhance-audiobook-flow)  
&nbsp;&nbsp;&nbsp;&nbsp;[6. **Embed Metadata for Each Unit**](#6-embed-metadata-for-each-unit)  
&nbsp;&nbsp;&nbsp;&nbsp;[7. **Include Multimedia Prompts**](#7-include-multimedia-prompts)  
&nbsp;&nbsp;&nbsp;&nbsp;[8. **Ensure Hierarchical Integrity**](#8-ensure-hierarchical-integrity)  
&nbsp;&nbsp;&nbsp;&nbsp;[9. **Reinforce Part Structure Rules**](#9-reinforce-part-structure-rules)  
&nbsp;&nbsp;&nbsp;&nbsp;[10. **Output Instructions**](#10-output-instructions)  
&nbsp;&nbsp;&nbsp;&nbsp;[📦 JSON Output Requirements](#-json-output-requirements)  
&nbsp;&nbsp;&nbsp;&nbsp;[⚠️ FINAL CRITICAL REMINDER](#-final-critical-reminder)

---

**START HERE**

## 🔁 Execution Steps (AI Must Follow)

## 📌 **IMPORTANT - Prepare and read CONTENT SOURCE FILES and DATABASE STRUCTURE AND REFERENCES**

Refer to the following CONTENT SOURCE FILES, ChapterName, PassageName and PartName. If something is not specified, assume its the entire parent for example file or chapter.

```yaml
FileName: 2. The Shadow Team Chronicles - DRAFT - STORYLINE - CHAPTER - The Warriors Oath.md
ChapterName: ## **The Warrior's Oath**
PassageName:
PartName: ## **The Duel at Gojo Bridge**
```

### Content Enhancement Instructions

## 📌 **IMPORTANT - DATABASE STRUCTURE AND REFERENCES**
**Refer to the baseline documentation for all database structures and schemas:**

- `README.md` (located at the root of the project directory)
- `/documentation/readme.md` (for specific database update procedures)
- `/CONTENT/The Shadow Team Chronicles/DATABASE/*.json` (the actual databases are located here)

These documentation files contain comprehensive information about:

- All JSON database files which store the canonical story universe information
- The purpose and structure of each database (character_database.json, location_database.json, event_database.json, etc.)
- How these databases cross-reference each other to maintain narrative consistency
- Schema definitions and validation guidelines for each database type
- Proper procedures for updating and extending the story universe
- Character, location, event, and timeline reference systems
- How to format and add new content while maintaining database integrity
- Cross-referencing patterns between database files

The JSON database files form the foundational knowledge base of the entire story universe. Any content created or modified must align with the information stored in these databases to maintain narrative consistency. Always consult these documentation files before adding content that references characters, locations, events, artifacts, or other established story elements.

---

## 1. **Validate Content Input**
   a. **Structure Validation**:
      - Confirm the input matches expected structural patterns for a `chapter`, `passage`, or `part`
      - Check for appropriate heading formats (e.g., `# Chapter Title`, `## Passage Title`, `### Part Title`)
      - Verify that the content includes necessary story elements (e.g., setting, characters, narrative progression)
   
   b. **Identifier Normalization**:
      - If UUIDv4 identifiers are missing, generate them using the pattern: `^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`
      - Ensure all hierarchical tracking numbers are sequential and valid (e.g., act=1, volume=1, story=1, chapter=3, etc.)
      - If any tracking numbers are missing, infer them from context or assign appropriate defaults

   c. **Content Consistency Check**:
      - Verify that character names, locations, and events match those in the database files
      - Check for continuity with previously established narrative elements
      - Flag any potential continuity issues for resolution

## 2. **Apply Writing Schema**
   a. **Select Appropriate Schema Elements**:
      - Choose `writing_style` based on scene content:
        - For action scenes: "cinematic_precise" or "controlled_chaos"
        - For emotional moments: "emotional_measured"
        - For world-building: "narrative_historian" or "atmospheric_immersive"
        - For legendary events: "mythic_poetic"
      
      - Select `scene_type` based on primary narrative function:
        - Example mapping: battle scenes → "action_sequence", character moments → "internal_reflection"
        - Ensure scene type logically flows from previous parts
      
      - Determine `emotional_tone` based on the narrative moment:
        - Example: revelations → "contemplative", danger → "tense", victories → "triumphant"
      
      - Set `narrative_pacing` appropriate to content:
        - Fast action → "breakneck" or "urgent", reflective moments → "deliberate" or "contemplative"
      
      - Choose `description_focus` based on what's most relevant:
        - Battle → "kinesthetic", character moments → "psychological_interior", etc.

   b. **Character Dynamic Application**:
      - Identify relationships between characters present in the scene
      - Apply appropriate `character_dynamic` values (e.g., "mentor_protege", "asymmetric_trust")
      - Ensure character interactions reflect these dynamics consistently

   c. **Thematic Reinforcement**:
      - Identify 3-5 key themes relevant to the current narrative moment
      - Weave these themes subtly throughout the content
      - Use symbolism, dialogue, and description to reinforce thematic elements

## 3. **Generate Natural-Length Content**
   a. **Length Parameters**:
      - Minimum characters per Part: **2,200**
      - Maximum characters per Part: **3,600**
      - Minimum words per Part: **450**
      - Maximum words per Part: **850**
      - Maximum poetic/metaphorical lines per Part: **5**, with no more than **2 per theme**, and no more than **2 consecutive lines**

   b. **Content Development Process**:
      - Begin with an establishing paragraph that orients readers to time, place, and perspective
      - Develop the narrative through a mixture of action, dialogue, and internal reflection
      - Include sensory details that align with the chosen `description_focus`
      - Build toward a clear narrative beat or mini-arc conclusion
      - End with a hook or transition that leads naturally to the next part

   c. **Scene Balancing**:
      - Ensure a mix of action, dialogue, and description within each part
      - Follow the 3:4:3 rule: approximately 30% action, 40% dialogue, 30% description/reflection
      - Adjust based on scene requirements and writing style

## 4. **Ensure Variability**
   a. **Length Variation**:
      - Enforce **10–15% natural variation in token/word length** between sequential Parts
      - Example: If Part 1 has 700 words, Part 2 should have between 595-665 words or 735-805 words
   
   b. **Paragraph Structure Variation**:
      - Explicitly vary paragraph lengths throughout the content:
        - Short paragraphs (1-2 sentences) for emphasis or action
        - Medium paragraphs (3-4 sentences) for dialogue or description
        - Longer paragraphs (5+ sentences) for complex thoughts or detailed scenes
      - Never use more than two paragraphs of the same length consecutively
   
   c. **Sentence Variation Techniques**:
      - Alternate between simple, compound, and complex sentence structures
      - Vary sentence openings (avoid starting consecutive sentences with the same word or phrase)
      - Mix declarative, interrogative, and exclamatory sentences as appropriate
      - Incorporate varied sentence lengths using this pattern: medium → short → long → medium
   
   d. **Descriptive Focus Shifts**:
      - Rotate through different sensory emphases (visual, auditory, tactile, etc.)
      - Start with the primary sense for the scene, then layer in secondary senses
      - Example pattern: visual → audiovisual → tactile → emotional → back to visual
   
   e. **Dialogue Tag Variation**:
      - Rotate through different dialogue attribution styles:
        - Standard tags ("he said")
        - Action tags ("he said, reaching for his sword")
        - No tags (when speaker is clear from context)
        - Descriptive tags that reveal character ("he whispered, his voice trembling")
      - Never use the same attribution style for more than three consecutive dialogue exchanges

## 5. **Preserve Dialogue & Enhance Audiobook Flow**
   a. **Dialogue Preservation Rules**:
      - **CRITICAL**: Never alter any existing dialogue that contains character insights, plot points, or foreshadowing
      - If dialogue must be split between parts, maintain exact wording and context
      - Character voices must remain consistent with established patterns in the database
   
   b. **Audiobook Formatting**:
      - Insert a blank line before and after each dialogue exchange
      - For extended dialogue, add brief action beats every 3-4 exchanges to orient the listener
      - Use scene break indicators (e.g., "* * *") for major shifts in time, location, or perspective
      - Format character thoughts differently from spoken dialogue (e.g., italic for thoughts)
   
   c. **Scene Flow Enhancement**:
      - Add audio cue markers 🎵 before significant atmospheric or emotional shifts
      - Include brief sensory reorientation details after extended dialogue sections
      - Mark emotional high points with subtle audio transition suggestions

## 6. **Embed Metadata for Each Unit**
   a. **Complete JSON Object Requirements**:
      - Each Part must have a complete JSON metadata object containing:
        ```json
        {
          "object_type": "part",
          "id": "[UUIDv4 format]",
          "version": "1.0.0",
          "author": "StoryTeller AI",
          "creation_timestamp": "[ISO 8601 format]",
          "parent": {
            "type": "passage",
            "id": "[Parent's UUID]",
            "name": "[Parent's name]"
          },
          "sequence_position": {
            // Complete hierarchy including storyline, volume, act, story, chapter, passage
          },
          "writing_style": "[selected style]",
          "scene_type": "[selected type]",
          "narrative_pacing": "[selected pacing]",
          // Additional required fields per schema
        }
        ```
      
   b. **Hierarchical Lineage**:
      - Every Part must include its complete parent lineage
      - All parent references must contain valid UUIDs and names
      - Parent references must form an unbroken chain to the root storyline
   
   c. **Metadata Validation**:
      - All fields must conform to the schema defined in `AI_Writing_Metadata_Schema.md`
      - Enum fields must contain only valid values from their defined sets
      - Required fields must never be null or missing
      - All dates and timestamps must be in valid ISO 8601 format

## 7. **Include Multimedia Prompts**
   a. **Image Prompt Requirements**:
      - Every Part must include an image prompt that:
        - Is highly detailed (minimum 100 words)
        - Specifies scene elements in priority order
        - Includes character descriptions consistent with database
        - Defines mood, lighting, atmosphere, and composition
        - Indicates artistic style appropriate to the narrative
        - Example format:
          ```json
          "image_generation": {
            "prompt_text": "Detailed cinematic scene of [character] in [setting], with [action occurring]. [Lighting details]. [Mood description]. [Composition details]. [Style reference].",
            "status": "pending",
            "failure_reason": null
          }
          ```
   
   b. **Video Prompt Requirements**:
      - Every Part must include a video prompt that:
        - Describes a 10-30 second cinematic sequence
        - Includes camera movement directions (pan, zoom, tracking shots)
        - Specifies scene transitions and timing
        - Includes audio/sound direction
        - Details character movements and expressions
        - Example format:
          ```json
          "video_generation": {
            "prompt_text": "A cinematic sequence beginning with [opening shot]. The camera [movement] to reveal [scene elements]. [Character] performs [action] while [description of environment/lighting]. Audio includes [sound elements]. The sequence concludes with [final image].",
            "status": "pending",
            "failure_reason": null
          }
          ```
   
   c. **Multimedia Tracking**:
      - All multimedia elements must include:
        - `status` field set to "pending" for new generations
        - `failure_reason` field initialized to null
        - References to any existing multimedia that should be maintained

## 8. **Ensure Hierarchical Integrity**
   a. **Complete Hierarchy Inclusion**:
      - Every Part's metadata must contain or inherit:
        - Full storyline → volume → act → story → chapter → passage hierarchy
        - Timeline information (era, date, setting)
        - Contextual tags that connect to broader narrative
   
   b. **Position Tracking**:
      - Parts must have explicit `part_number` values
      - Part numbers must be sequential within their parent passage
      - Passages must link to their parent chapter via `passage_number`
      - All objects must include their position in the overall narrative structure
   
   c. **Relation Validation**:
      - Verify that all parent-child relationships form valid trees
      - Check that no circular references exist in the hierarchy
      - Ensure all references point to valid, existing objects

## 9. **Reinforce Part Structure Rules**
   a. **Passage Composition**:
      - Each Passage must have a **minimum of 4 distinct Parts**
      - Parts must be divided at natural narrative breaks, not arbitrarily
      - Each Part must have a complete narrative arc (setup → complication → resolution/hook)
      
   b. **Scene Type Progression**:
      - Parts must transition logically between scene types
      - Example progression pattern: `exposition_worldbuilding` → `tension_buildup` → `dialogue_driven` → `action_sequence` → `emotional_revelation`
      - Each transition should feel organic to the narrative
   
   c. **Arc Development**:
      - Each Part must advance character development, plot, or world-building
      - No Part should exist solely as "filler" content
      - Every Part should contain at least one significant story beat

## 10. **Output Instructions**
   a. **Content Delivery Method**:
      - Do NOT update or modify the source file directly
      - Print or output your complete response in the chat window
      - Format the output so it can be easily copied and pasted into the target file
      - Include appropriate markdown formatting in your response when applicable
      - Begin your response with a brief summary of changes/additions made to the content

---

## 📦 JSON Output Requirements

### Part Props Template
Each Part must include a complete `part_props` object following this template:

```json
{
  "part_props": {
    "id": "unique_identifier_in_uuidv4_format",
    "name": "The Path Into the Mountains - [Descriptive Part Title]",
    "description": "A 2-3 sentence summary describing the narrative content and purpose of this part",
    "object_type": "part",
    "status": "draft",
    "verified": false,
    "sequence": {
      "act": 1,
      "volume": 1,
      "story": 1,
      "chapter": 3,
      "passage": 2,
      "part": 8
    },
    "timeline": {
      "year": "1174",
      "season": "Spring",
      "era": "Late Heian Period",
      "time_of_day": "Afternoon"
    },
    "location": {
      "primary": "Mountain Pass",
      "region": "Eastern Mountain Range",
      "atmosphere": "Tense, Expectant, Strategic"
    },
    "character_focus": {
      "primary": ["Character1", "Character2"],
      "secondary": ["Character3", "Character4"],
      "dynamic": "Relationship type between characters",
      "development_phase": "What stage of character development this represents"
    },
    "themes": [
      "Primary Theme",
      "Secondary Theme",
      "Tertiary Theme",
      "Supporting Theme",
      "Background Theme"
    ],
    "style_notes": {
      "tone": "Primary emotional tone of the narrative",
      "pacing": "Description of narrative speed and rhythm",
      "perspective": "Whose viewpoint dominates this part",
      "sensory_emphasis": ["Primary sense", "Secondary sense", "Tertiary sense"]
    },
    "narrative_purpose": "Detailed explanation of how this part advances the story"
  },
  "multimedia": {
    "image_generation": {
      "prompt_text": "Detailed visual prompt describing the key scene...",
      "status": "pending",
      "failure_reason": null
    },
    "video_generation": {
      "prompt_text": "Detailed cinematic sequence description...",
      "status": "pending",
      "failure_reason": null
    }
  }
}
```

### Required Fields and Validation
- Generate valid UUIDv4 for `id` using the pattern: `^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`
- Set `"verified": false` by default for all new content
- Ensure `sequence` numbers match the hierarchical position
- Include detailed multimedia prompts that align with the narrative content
- All fields must follow the schema defined in `AI_Writing_Metadata_Schema.md`

### Example Complete Part Output
Your final output should follow this pattern:

```json
{
  "part_props": {
    // Complete props as per template
  },
  "multimedia": {
    // Complete multimedia objects
  }
}
```

**FOLLOWED BY THE NARRATIVE CONTENT:**

# **📖 Title with Part Number and Name**

[Opening paragraph establishing scene]

[Development paragraphs with action, dialogue, and description]

🎵 _Audio cue for atmospheric shift_

[Further narrative development]

[Closing paragraph with hook to next part]

🎬 _Final cinematic description that captures the essence of the scene_

---

## 🛑 Important Constraints

### Critical Content Preservation:
- ❌ **NEVER overwrite or paraphrase fixed dialogue lines** that contain plot points or character development
- ❌ **NEVER contradict established character traits** from the character database
- ❌ **NEVER introduce timeline inconsistencies** that conflict with the master timeline

### Required Natural Flow:
- ✅ **ALWAYS split content at natural narrative breaks** such as:
  - Scene changes (location shifts, time jumps)
  - Shifts in perspective or focus
  - Natural pauses in dialogue or action
  - Thematic transitions or emotional shifts
- ✅ **ALWAYS use variable paragraph and sentence structures** to maintain reader engagement
- ✅ **ALWAYS balance dialogue, action, and description** based on scene requirements

### Technical Requirements:
- ✅ **ALWAYS maintain natural variance between parts** - Each part must have 10-15% variation in length
- ✅ **ALWAYS validate all metadata fields** against the schema before submission
- ✅ **ALWAYS run a continuity check** against established story elements

### Quality Assurance Checklist:
Before submitting, verify that your content:
1. Follows all structural requirements
2. Contains complete and valid metadata
3. Has natural-sounding prose with appropriate variation
4. Maintains continuity with existing narrative
5. Includes properly formatted multimedia prompts
6. Advances the story in a meaningful way
7. Respects character voices and established traits
8. Contains no factual errors or timeline inconsistencies

---

## ⚠️ FINAL CRITICAL REMINDER

**DO NOT UPDATE OR MODIFY SOURCE FILES DIRECTLY**

- Your complete response must be outputted entirely in the chat window
- Format all content (JSON and narrative) so it can be easily copied and pasted
- Begin with a brief summary of changes/additions made
- Under no circumstances should you attempt to directly modify the original files
- The user will manually copy your response into the appropriate files

This requirement is mandatory for all content expansions and enhancements.