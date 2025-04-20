# Timeline and Storyline Integration Guide

This document explains how the Timeline References Schema and Storyline References Schema work together to provide a comprehensive system for tracking both chronological (in-universe time) and narrative (story structure) aspects of The Shadow Team Chronicles universe.

## Key Integration Concepts

### Two Complementary Reference Systems

1. **Timeline References** - Tracks **WHEN** elements exist within the story universe's chronology
   - Absolute timeframes
   - Relative positioning
   - Historical context
   - Time variants and alterations

2. **Storyline References** - Tracks **WHERE** elements appear in the narrative structure
   - Volume/chapter/passage references
   - Writing style information
   - Thematic connections
   - Character development

## Integration Points

The schemas integrate through several key cross-reference fields:

1. **From Storyline to Timeline**
   - `timeline_reference` object in the `appearances` section
   - Links narrative appearances to specific temporal positions
   - Allows tracking which time state variant appears in which part of the narrative

2. **From Timeline to Storyline**
   - `narrative_manifestations` section 
   - Tracks how a temporal element manifests across the narrative
   - Links temporal concepts to their narrative revelations

## Common Use Cases

### Example 1: Character Aging Across a Non-Linear Narrative

A character who appears at different ages throughout a non-linear narrative would have:
- Timeline entries for each significant age/life period (time_state_variants)
- Storyline entries for each narrative appearance
- Cross-references linking each appearance to the appropriate temporal variant

```json
// Timeline Reference (simplified)
{
  "temporal_positioning": { /* when the character exists */ },
  "time_state_variants": [
    { 
      "variant_name": "Child",
      "time_point": "2124-05-10",
      "description": "Character as a 10-year-old child"
    },
    {
      "variant_name": "Adult",
      "time_point": "2145-03-22",
      "description": "Character as a 31-year-old adult"
    }
  ],
  "narrative_manifestations": {
    "key_narrative_depictions": [
      {
        "storyline_reference_id": "uuid-adult-scene",
        "significance": "Establishes character's adult personality"
      },
      {
        "storyline_reference_id": "uuid-child-flashback",
        "significance": "Reveals childhood trauma"
      }
    ]
  }
}

// Storyline Reference (simplified)
{
  "appearances": [
    {
      "scene_id": "uuid-adult-scene",
      "timeline_reference": {
        "time_state_variant_id": "uuid-adult-variant"
      }
    },
    {
      "scene_id": "uuid-child-flashback",
      "timeline_reference": {
        "time_state_variant_id": "uuid-child-variant"
      }
    }
  ],
  "chronological_view": {
    "narrative_chronology": "non_linear",
    "flashbacks": [
      {
        "scene_id": "uuid-child-flashback",
        "timeline_reference_id": "uuid-child-point-in-time"
      }
    ]
  }
}
```

### Example 2: Historical Event Referenced Multiple Times

A pivotal historical event might be:
- Defined fully in the timeline references
- Referenced or depicted partially in multiple parts of the narrative
- Gradually revealed to readers across different storyline appearances

## Best Practices

1. **Maintain Bi-Directional References**
   Always create links in both directions when integrating timeline and storyline information.

2. **Use UUIDs Consistently**
   Ensure all cross-references use proper UUIDs that exist in both schema systems.

3. **Document Non-Linear Narratives**
   For complex narrative structures, use the chronological_view and narrative_manifestations sections to clarify the relationship between story order and timeline order.

4. **Track Audience Knowledge**
   Note the difference between what happens in the timeline and when/how readers learn about it in the storyline.
```

## Troubleshooting Integration Issues

### Resolving Conflicting Timestamps
If the same event has different dates in timeline vs. storyline references:
- Timeline references should be considered canonical for in-universe chronology
- Storyline references should note any deliberate timeline inconsistencies as narrative devices

### Handling Retcons and Timeline Changes
When the narrative establishes a retcon or timeline alteration:
- Document the original timeline in timeline_alterations
- Link storyline references to the appropriate timeline version
- Note the narrative point where the retcon occurs
