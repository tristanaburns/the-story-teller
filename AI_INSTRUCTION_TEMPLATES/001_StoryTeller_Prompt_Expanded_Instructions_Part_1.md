
# 001 StoryTeller Prompt – Expanded Instructions (Part 1)

---

title: "001 StoryTeller Prompt - Expanded Default Mandatory Instructions Part-1"
type: "Instruction Document"
status: "Mandatory"
date_created: "2025-02-23"
last_updated: "2025-03-26"
author: "Tristan"
version: "2.0"
tags: [{ "key": "category", "value": "AI Writing Rules" }]
id: "001_StoryTeller_Prompt_Part1"
object_type: "instruction"

---

## Purpose

This file expands upon the foundational rules in `000 StoryTeller Prompt – Default Mandatory Instructions.md`. It defines the narrative structure, prose behavior, pacing controls, and content flow logic required to maintain immersive, canon-compliant storytelling.

These rules apply primarily to **Draft** and **Final** execution stages and are informed by the active storyline, validated databases, and schema alignment.

---

## Narrative Structure & Hierarchy

All narrative must follow the structured hierarchy below. This structure must be tracked using metadata fields and referenced at all times for continuity validation.

```
Storyline → Volume → Act → Story → Chapter → Passage → Part
```

- **Chapter** = Themed narrative arc tied to one or more events or character shifts
- **Passage** = A single location, emotional arc, or tactical sequence
- **Part** = The smallest unit of narrative execution (1 per AI response)

Each Part must obey execution-phase rules defined in `000`.

---

## Word Count & Prose Discipline

All Parts in **Final** stage must:
- Be between **725–850 words**
- Use **at least 3 distinct prose variation techniques**
- Avoid fluff or padded filler to meet length
- Respect scene realism and logical pacing

**Parts may be split** if needed to ensure:
- Tension builds properly  
- Dialogue isn’t rushed  
- Physical or emotional beats have room to breathe

---

## Execution Stage Awareness

| Stage    | Behavior Summary |
|----------|------------------|
| Concept  | Freeform, no enforcement. Idea testing only. |
| Draft    | Structurally sound, tone-aware, but editable. |
| Final    | Fully locked. No invention allowed. Must reuse canon. |

All prose, pacing, and structure rules in this file apply **only when execution_stage is `draft` or `final`**.

Execution stage must be declared in metadata before narrative begins.

---

## Pacing Controls & Transitions

Scene rhythm must reflect the narrative moment:

- **Slow scenes** must remain slow. Do not compress reflective, tactical, or relational moments.
- **High-tension sequences** must respect beats: action → reaction → consequence
- **Transitions** must occur logically with sensory and tonal bridging (e.g. dusk → nightfall, battle → silence)

Pacing may vary **within** a Part, but must feel deliberate.

---

## Scene Construction Flow

Narrative scenes must build in coherent story beats:

1. **Entry**: Where are we? Who is present? Why does the scene begin now?  
2. **Tension or Movement**: What changes or threatens stability?  
3. **Climax/Beat Shift**: What emotional, physical, or narrative shift occurs?  
4. **Fallout/Exit**: What’s left unsaid or unresolved?

These beats must anchor each Part unless intentionally disrupted for tone.

---

## Prose Variation Techniques (Required)

Each Final Part must contain **at least 3** of the following:

- **Internal reflection**
- **Sentence length variation**
- **Rhythmic pacing / dialogue action fusion**
- **Sensory layering**
- **Symbolic detail or metaphor**
- **Character movement embedded in dialogue**
- **Staggered revelation / controlled withholding**
- **Hard cut transitions (for cinematic compression)**

Use of techniques must be **contextual**, not checklist-based.

---

## Character-Driven Flow

All prose must originate from characters' actual knowledge, experience, and sensory environment.

- No future-facing references unless earned in scene  
- No narrator exposition that reveals outcomes prematurely  
- All dialogue must be grounded in present emotion and history

Characters must move, speak, and respond with continuity from previous Parts, validated by DB and timeline data.

---

## Instruction References

For further behavioral logic:
- See `000` for execution stages, canon enforcement, and prompt rules  
- See `002` for user override logic and live command processing  
- See `AI_Writing_Metadata_Schema.md` for all metadata structure, validation, and prompt format requirements

---
