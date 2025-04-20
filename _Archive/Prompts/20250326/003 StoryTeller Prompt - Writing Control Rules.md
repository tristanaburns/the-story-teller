# Writing Control Rules for Story Generation

## ✨ Writing Control Rules — Prose & Structural Constraints

The following JSON object defines precise constraints for prose density, metaphor usage, and structural pacing across all generated content. These rules ensure consistent quality while maintaining natural variation.

```json
"writing_control_rules": {
  "max_words_per_part": 850,
  "max_tokens_per_part": 1100,
  "max_poetic_lines": 5,
  "max_consecutive_poetic_lines": 2,
  "min_prose_variation_per_paragraphs": 1,
  "min_dialogue_or_action_per_4_blocks": true,
  "description_block_max_lines": 4,
  "theme_poetic_density_limit": 2,
  "natural_variability_target": "±10-15% variation between sequential parts"
}
```

## Implementation Requirements

These writing control rules must be applied as follows:

1. **Token & Word Limits**: Never exceed the maximum words (850) or tokens (1100) per Part.

2. **Poetic Balance**: 
   - Maximum 5 poetic/metaphorical lines in any Part
   - No more than 2 consecutive poetic lines
   - Maximum 2 poetic lines when discussing any single theme

3. **Structural Rhythm**:
   - Insert at least one prose variation technique per paragraph
   - Break any description block after 4 lines with action, dialogue, or character reaction
   - Never write more than 4 consecutive lines of pure description

4. **Natural Variation**:
   - Ensure 10-15% length variation between sequential Parts
   - Vary paragraph structures to avoid repetitive patterns
   - Use different sentence lengths and structures

5. **Validation Process**:
   - Check compliance with these rules before finalizing any Part
   - If a Part exceeds limits, split at natural scene breaks
   - Document implementation of prose variation techniques

## ✨ Canon Fidelity Enforcement Rules

- All character actions, weapons, abilities, known dialogue, and behavioral patterns must be cross-validated against `character_database.json` and `storyline_draft` files.
- Any referenced scene, dialogue, or structure that exists in the draft must be confirmed line-by-line before rewrite approval.
- All action beats referencing key timeline moments, chapter events, or scene sequences must match the `event_database.json`, `timeline_database.json`, and `chapter_information.json`.
- No rewrite or next Part generation should proceed without validating canon sources when events, characters, or locations have already been established.
- If there is any deviation or ambiguity, the system must raise a flag and ask for confirmation before continuing.
- Multimedia prompt generation must also verify against canon for consistency in attire, weaponry, time-of-day, and visual character state.

## Post-Generation Canon Validation

After generating each narrative Part, the system must perform a structured validation sweep across the following:

- Re-read all generated content and cross-reference each sentence against relevant entries in:
  - `character_database.json`
  - `timeline_database.json`
  - `storyline_draft` and concept documents
  - `event_database.json`
  - `location_database.json`
  - `artifact_database.json`
- Confirm all character actions, descriptions, names, weapons, affiliations, and dialogue match canon references
- Confirm event order, time-of-day, and scene location align with established timeline and event records
- Highlight or reject any passage that contradicts or omits key canonical facts

No content is marked complete until validated.

## Integration with Existing Instructions

These writing control rules supersede any conflicting values in previous instruction documents while reinforcing existing guidance on prose variation and structural balance.

The rules should be imported into the AI Writing Metadata Schema and referenced as part of the validation process for all generated content.