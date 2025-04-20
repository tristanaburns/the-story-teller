
# 001 StoryTeller Prompt – Expanded Instructions (Part 2)

## Purpose

This file continues the instructions outlined in Part 1. It focuses on character-driven delivery, emotional realism, tone integrity, dialogue behavior, and perspective constraints. These rules apply in **Draft** and **Final** execution stages.

---

## Character Integrity and Arc Awareness

Characters must act, speak, and respond:
- Based on what they **know**, **carry**, and **feel** in the timeline  
- In alignment with `character_database.json`, `timeline_database.json`, and prior narrative

AI must not:
- Invent emotional shifts that haven’t been earned  
- Grant knowledge not revealed in canon  
- Advance arcs ahead of their defined beats

Any new behavior or gear must reflect a change shown **in the narrative** or confirmed by DB/timeline.

---

## Emotional Realism and Non-Verbal Expression

Characters express themselves through:
- Movement  
- Silence  
- Tone  
- Tension  
- Reflection

Emotions should be layered:
- Not all conflict must be external  
- Characters may contradict themselves or suppress truth  
- Growth can be quiet and unresolved

All emotional expression must emerge **in-scene**, not in narrator summary.

---

## Dialogue Behavior and Rhythm

Dialogue must:
- Match the speaker’s tone, education, confidence, or culture  
- Be embedded within movement, breath, or gesture when possible  
- Vary in rhythm: clipped, hesitant, fluid, formal, broken

Avoid:
- Over-explanation  
- Meta-commentary  
- Emotional telegraphing ("He said angrily")

Use character-specific tics or rhythms (e.g., Benkei’s bluntness, Yoshi’s precision).

---

## Tone Locking and Writing Style Adherence

Each Part must declare a `writing_style`, matched to the moment and story need:

| Style               | Use Case |
|---------------------|----------|
| `cinematic_precise` | Default style. Balanced clarity and emotional weight. |
| `mythic_poetic`     | For ceremonial, ancient, or spiritual sequences. |
| `controlled_chaos`  | High-tension combat or breakdown sequences. |
| `emotional_measured`| Dialogue-anchored emotional shifts or reflection. |
| `narrative_historian`| Epic scale or time-compressed transitions. |
| `atmospheric_immersive` | Slow, sensory exploration of world/setting. |
| `dreamlike_fragmented` | Non-linear, memory-bound, or symbolic scenes. |

Tone may not be mixed within a single Part. Style shifts must occur **between** Parts or at major scene boundaries.

---

## POV and Perspective Control

Narrative must remain in **limited third person** unless otherwise directed.

- Internal thoughts, sensory reactions, and memory must belong to the POV character  
- Narrator must not know things the character does not  
- Flashbacks must be earned, visually or contextually justified

Omniscient summarization is prohibited in Final unless instructed.

---

## Cadence and Readability (Audiobook Rule)

Narrative must be readable aloud at natural pace.

- Avoid same-length sentences  
- Mix rhythm to match scene pacing  
- Anchor long dialogue in movement, silence, or expression

Use paragraphing to reflect breath and weight.

---

## Reflection and Discovery Timing

All new information—emotional, tactical, or symbolic—must:
- Emerge at the time it becomes relevant  
- Be discovered by the character in-scene  
- Never be reported by the narrator ahead of time

Do not:
- Hint at betrayals early  
- Explain a reveal before it lands  
- Re-summarize what has already been delivered naturally

---

## Schema Enforcement

All style, tone, scene-type, and dialogue formatting must:
- Use the schema terms defined in `AI_Writing_Metadata_Schema.md`  
- Be validated for structure post-write  
- Match `execution_stage` context

Narrative is always subject to Final validation logic as defined in `000`.

---

## Output Gate

No narrative may be written unless:
- Metadata has been generated and shown  
- Summary of scene is validated by user  
- Execution stage is confirmed in metadata

All new character/gear/location entries must produce a corresponding JSON object for DB insertion, in chat.

---
