# Character Creation Guide

This guide provides detailed instructions for creating and documenting characters using TheStoryTeller database system, with special attention to how characters integrate with the Chapter Information Schema.

## Character Schema Overview

The Character Schema is designed to document both factual information and narrative significance of individuals within your story. A complete character entry serves as a central reference point that connects to locations, events, relationships, and chapters where the character appears.

## Character Entry Creation Process

### 1. Basic Character Information

Start with fundamental information:

- **Unique identifier (id)**: Format as `char-[name]-[number]` (e.g., `char-yoshi-001`)
- **Name**: Character's commonly used name
- **Full name**: Character's complete formal name
- **Aliases**: Alternative names or titles
- **Birth year**: When the character was born
- **Status**: Whether the character is alive, deceased, or unknown
- **Species**: Character's species (typically "human" unless otherwise noted)
- **Gender**: Character's gender

### 2. Character Affiliations

Document organizations the character belongs to:

```json
"affiliations": [
  {
    "organization": "org-minamoto-001",
    "role": "Last heir",
    "start_date": "1159",
    "end_date": null
  }
]
```

### 3. Character Abilities

List notable skills, talents, or powers:

```json
"abilities": [
  {
    "name": "Master Swordsman",
    "description": "Extraordinary speed and precision with a blade"
  }
]
```

### 4. Character Biography

Write a concise narrative of the character's life history:

```json
"biography": "Born during the turmoil of the Heiji Rebellion, Yoshi is the son of the slain Minamoto clan leader. Hidden at Kurama Temple as a child, he grew up training secretly in martial arts..."
```

### 5. Character Appearance

Describe physical appearance:

```json
"appearance": "Lean and agile with sharp, observant eyes. Moves with fluid grace that belies his deadly skill."
```

### 6. Character Personality

Document personality traits and behavioral patterns:

```json
"personality": {
  "traits": ["Disciplined", "Strategic", "Reserved"],
  "description": "A calm, focused warrior who speaks little but observes everything."
}
```

### 7. Character Relationships

Record connections to other characters:

```json
"relationships": [
  {
    "character": "char-benkei-001",
    "relationship_type": "master-retainer",
    "description": "After defeating Benkei at Gojo Bridge, gained his unwavering loyalty."
  }
]
```

## Integrating Characters with Chapter Information

The Chapter Information Schema references characters in several ways, making proper character documentation essential for narrative consistency and analysis.

### Character Categories in Chapter Information

Characters in chapter information are categorized by their role in each chapter:

```json
"characters": {
  "primary": ["char-yoshi-001", "char-benkei-001"],
  "secondary": ["char-tanaka-hunter-001", "char-village-elder-001"],
  "mentioned": ["char-monastery-abbot-001"]
}
```

- **Primary Characters**: Central focus of the chapter, driving the plot
- **Secondary Characters**: Important but supporting roles
- **Mentioned Characters**: Referenced but not directly appearing

### Character Arcs in Chapter Information

The Chapter Information Schema also documents character development:

```json
"character_arcs": {
  "char-benkei-001": {
    "arc_type": "transformation",
    "starting_state": "Directionless warrior seeking purpose through empty victories",
    "ending_state": "Devoted retainer finding meaning in service to a worthy master",
    "pivot_moment": "event-benkei-oath-001",
    "development_summary": "Benkei transforms from a collector of meaningless trophies to a purposeful protector."
  }
}
```

### Best Practices for Character-Chapter Integration

1. **Consistency in Character Categorization**
   - Maintain consistent criteria for categorizing characters across chapters
   - Document rationale for changes in category (e.g., when a character moves from "secondary" to "primary")

2. **Character Arc Continuity**
   - Ensure character arc "ending_state" in one chapter logically connects to "starting_state" in the next
   - Reference specific events as "pivot_moments" to anchor character development

3. **Cross-Reference Completeness**
   - When creating a new character, update all relevant chapter information entries
   - When modifying a character, review all chapters where they appear

4. **Development Documentation**
   - Document subtle character development, not just dramatic changes
   - Use the character_arcs section to record incremental growth across chapters

## Character Creation for Different Story Roles

### Protagonists

For main characters like Yoshi:
- Develop comprehensive biographical details
- Document character arc across multiple chapters
- Establish rich relationship networks
- Record detailed personality traits

### Supporting Characters

For characters like Tanaka the hunter:
- Focus on their function in specific chapters
- Document their impact on protagonists
- Ensure consistent portrayal across appearances
- Link to relevant events and locations

### Mentioned Characters

For characters referenced but not appearing:
- Create minimal entries with essential information
- Link to chapters where they're mentioned
- Document their indirect influence on the story

## Validating Character Entries

Before finalizing a character entry, verify:

1. All required fields are completed
2. Cross-references match existing entries
3. Character arcs maintain continuity
4. Biographical details are consistent with timeline events
5. Metadata fields (creation date, version) are accurate

## Conclusion

Creating robust character entries that integrate properly with the Chapter Information Schema ensures narrative consistency while providing valuable insights into character development. By following these guidelines, you'll build a character database that supports both creative development and analytical understanding of your story.
