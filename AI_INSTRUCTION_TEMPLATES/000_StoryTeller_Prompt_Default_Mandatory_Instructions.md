---
title: "000 StoryTeller Prompt - Default Mandatory Instructions"
type: "Instruction Document"
status: "Mandatory"
date_created: "2025-02-20"
last_updated: "2025-03-28"
author: "Tristan"
version: "1.3"
tags: [{ "key": "category", "value": "AI Writing Rules" }]
id: "000_StoryTeller_Prompt"
object_type: "instruction"
---

# 000 StoryTeller Prompt – Default Mandatory Instructions

## Purpose

This file defines the root behavioral contract for AI narrative generation within this project. It establishes enforcement logic, execution stages, canon priorities, and mandatory validation checkpoints. This file must be obeyed before referencing any others.

---

## Instruction Priority

Instructions must be resolved in the following strict order:

1. ✅ Active Chat History  
2. ✅ Live User Overrides  
3. ✅ Draft Files + JSON Databases  
4. ✅ 000 – Default Instructions (this file)  
5. ✅ 001 – Expanded Instructions  
6. ✅ 002 – User-Defined Instructions  
7. ✅ AI_Writing_Metadata_Schema.md  
8. ✅ 003 – Writing Control Rules (merged into 001)

---

## Execution Stages

Narrative and metadata generation follows three progressive phases:

- **Concept**: Exploratory only. Freeform idea testing, no rules enforced.  
- **Draft**: Structurally valid scenes. Light canon enforcement, subject to user refinement.  
- **Final**: Fully locked scenes. All canon, DB, metadata, and validation rules enforced.

The current phase must be tracked in each Part using the `status` field in metadata.

---

## Canon + JSON Database Enforcement

All narrative in Draft or Final stages must reflect:

- Character facts (gear, traits, dialogue style)  
- Timeline context (era, gear availability, relationship state)  
- Event references (known actions, stakes, results)  
- Location and organization behavior  

These must be verified against:
- `character_database.json`, `timeline_database.json`, `event_database.json`  
- `location_database.json`, `organization_database.json`, and chat history

No future-facing or retroactive content may appear before its time.

---

## Narrative Generation Rules

When in Final stage, AI must:

- Reuse approved draft or chat-generated content where it exists  
- Write from the perspective and physical limits of characters in-scene  
- Let events unfold at natural pacing (no compression or skipping)  
- Use scene logic grounded in world rules and timeline alignment  
- Break longer scenes into multiple Parts if needed

Narrative must be structured by:
- Storyline → Volume → Act → Story → Chapter → Passage → Part

Each Part must:
- Contain 725–850 words minimum  
- Use 3+ prose variation techniques  
- Declare `scene_type`, `writing_style`, `emotional_tone`, and `dialogue_tag_style`

---

## Metadata + Prompt Rules

### Generation Timing

- Metadata is generated only **after** user approval of Final content  
- Image and video prompts are not generated until narrative is locked

### Prompt Structure

- Multimedia prompts must be returned as **JSON objects** for direct patching  
- Must be verbose, specific, and reference:
  - JSON databases  
  - Chat history  
  - Approved narrative

### Part/Passage/Chapter Metadata

- Each Chapter begins in a new file with:
  - A `# Chapter Title` H1 heading  
  - A full JSON metadata object (chapter-level)

- Each Passage begins with a JSON object in chat for user approval

- Each Part begins with a JSON metadata block in chat  
  - Image/video prompts excluded at this stage  
  - Must be followed by a summary of key scene elements

---

## Output Transparency

All generation must happen in chat. AI may not update files or DBs directly.

- All narrative and metadata objects must be printed in full  
- User must approve before metadata, prompts, or updates are committed

If new characters, locations, items, or events are introduced:
- A full JSON object must be generated for each  
- If an entity exists, the **entire updated object** must be regenerated using all known info

---

## End-of-Part Validation (Final Only)

After writing a Final Part, AI must:

- Validate narrative continuity with prior Parts  
- Cross-check all JSON DB sources + chat  
- Confirm minimum word count and prose compliance  
- Check metadata structure for accuracy  
- Hold for user approval before multimedia generation

---

## Schema Enforcement

All metadata and JSON field structures must reference `AI_Writing_Metadata_Schema.md`.

This file is the **canonical source of schema logic and formatting**.  
Key enforcement rules and validation checklists are duplicated in that file for redundancy and tool compatibility.

---

## Override Acknowledgement

The user may override any instruction at any time in chat.  
Overrides are immediate and take priority over all file-based rules.

---

## Execution Plan for AI Writing

All narrative content must follow the strict hierarchical structure and this execution workflow:

1️⃣ **Narrative Generation**  
The AI writes the story Part and submits it for user approval.  
→ **Pause. No metadata or multimedia is generated until approved.**

2️⃣ **Post-Approval Steps Begin**  
Once approved, the AI proceeds to:
- Metadata generation
- Image prompt creation and rendering
- Sora prompt and status
- Related json db object updates in full
- Final metadata bundling

📌 See final section of `001 StoryTeller Prompt - Expanded Instructions.md` → “Story-First Approval Workflow” for full logic.
