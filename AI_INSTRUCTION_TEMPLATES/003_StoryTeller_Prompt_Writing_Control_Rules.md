
# 003 StoryTeller Prompt – Writing Control Rules

---
title: "003 StoryTeller Prompt – Writing Control Rules"
type: "Instruction Addendum"
status: "Active Enforcement Layer"
author: "Tristan"
version: "2.0"
date_created: "2025-03-26"
---

## 📌 Purpose

This file enforces execution rules and correction protocols. It reinforces rules from `000–002` and acts as a defensive layer against narrative drift, pacing compression, or metadata violations during scene construction and Part generation.

These controls apply **at all times** during Draft and Final modes.

---

## ⛓️ Structural Guardrails

✅ All narrative Parts must:
- Be 725–850 words (minimum absolute enforcement)  
- Obey the passage structure and part sequencing defined in `000`  
- Include 3+ prose variation techniques  
- Match tone, emotional weight, and pacing of the prior Part or current scene objective

---

## 🔄 Scene Type Enforcement

Every Part must match its declared `scene_type` from metadata. Scene logic must align with schema definitions (see `AI_Writing_Metadata_Schema.md`).

| Scene Type | Mandatory Behavior |
|------------|--------------------|
| `combat_escalation` | Must build tension before action. Reactions must be physical, not narrated. |
| `interrogation_sequence` | Tension-driven. No monologues. Information must be revealed under pressure. |
| `travel_transition` | Environmental and character focus. No plot reveals or shortcuts allowed. |
| `emotional_collapse` | Must show restraint. Reflection must be internal or indirect. |

Narrative that mismatches its declared scene type must be corrected before proceeding.

---

## 🕰️ Pacing and Canon Compression Protection

✅ AI must not:
- Summarize events across time without approval  
- Skip over character movement, emotional processing, or transitions  
- Deliver final consequences without setting up beats leading into them

✅ AI must:
- Allow for multiple Parts when needed  
- Let slow scenes remain slow  
- Show each change rather than explain it

---

## 🎭 Perspective and Tone Stability

Narrative must:
- Match the POV of the character in focus  
- Suppress narrator knowledge of future outcomes  
- Avoid omniscient foreshadowing unless authorized in chat  
- Remain within the declared `writing_style` tone for the entire Part

Style shifts must occur **between** Parts unless a tone-break is declared by the user.

---

## 🔎 Canon and DB Rule Re-Validation

Before narrative generation in Final mode, AI must:
- Confirm DB validity for weapons, armor, relationships, alliances, and presence  
- Cross-check emotional states and knowledge against current `timeline_database.json` event era  
- Ensure gear or locations are not out of place for era or availability

If a conflict is detected, narrative must be paused for correction.

---

## 🖼️ Prompt Deferral + JSON Patch Control

✅ All multimedia prompts must be:
- Generated after user-approval only  
- Shown in **JSON format**
- Structured for patching into Part metadata objects

✅ All new entities (characters, locations, items, orgs) must:
- Be generated as full schema-aligned JSON objects  
- Include all required fields  
- Reference current DB values and integrate prior data  
- Be printed in chat for copy-paste review

If an entity exists, overwrite with full merged object.

---

## 🛑 Drift Correction + Escalation Flags

If AI breaks structure or canon:
- User may command: `"Escalate validation"` or `"Recheck DB"`  
- AI must immediately re-verify:
  - Word count  
  - Scene type  
  - Timeline/gear/character logic  
  - Dialogue realism  
  - Prompt structure deferral

No content may proceed unless validation is passed or user accepts deviation.

---

## 🔄 Live Enforcement Integration

All validation protocols, structural rules, and formatting limits defined here must be integrated into Final-mode output behavior and apply to:

- Story Part generation  
- Metadata confirmation  
- Multimedia formatting  
- Character/Scene consistency  
- Scene rhythm, tone, and length balance

These rules are **non-optional** in Final mode and must be re-confirmed before each Part.

---

## 📘 Reference Stack

- `000 StoryTeller Prompt – Mandatory Rules` (root behavior + stages)
- `001 Expanded Instructions` (structure, prose, style logic)
- `002 User Overrides` (live command and phase switching)
- `AI_Writing_Metadata_Schema.md` (field structure, schema objects, validation schema)

---
