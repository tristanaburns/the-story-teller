# The Shadow Team Chronicles: Common Schemas Guide

This guide explains the shared schema components in the `common` directory, which provide reusable elements across different entity types in The Shadow Team Chronicles universe. Understanding these common schemas is essential for maintaining consistency and proper cross-referencing throughout the narrative database.

## Overview of Common Schemas

The `common` directory contains schema components that are reused across multiple entity types (characters, locations, artifacts, events, etc.). These schemas provide standardized formats for shared concepts, ensuring that:

1. Common attributes are implemented consistently
2. Cross-references between entities follow predictable patterns
3. The database maintains structural integrity
4. New entity types can easily incorporate established patterns

## Available Common Schemas

| Schema File | Purpose | Used By |
|-------------|---------|---------|
| `object_type_schema.json` | Defines all possible entity types | All schemas |
| `references_schema.json` | Standard format for cross-references | All schemas |
| `abilities_schema.json` | Special capabilities and powers | Characters, Artifacts, Technologies |
| `equipment_type_schema.json` | Standard categories for equipment | Characters, Artifacts |
| `visual_representation_schema.json` | Visual depiction guidelines | Characters, Locations, Artifacts |
| `narrative_significance_schema.json` | Thematic and plot functions | All narrative elements |
| `historical_significance_schema.json` | Connections to world history | Characters, Locations, Artifacts, Organizations |
| `writing_elements_schema.json` | Writing style and tone | All content types |
| `timestamp_schema.json` | Time and date formats | Events, Character timelines |
| `time_period_schema.json` | Temporal ranges and eras | Timeline elements |
| `chapter_information_schema.json` | Document and analyze narrative chapters | All narrative elements |

## How to Use Common Schemas

### Basic Schema Reference

To incorporate a common schema within an entity-specific schema, use the `$ref` keyword with the relative path:

```json
"abilities": {
  "$ref": "../common/abilities_schema.json"
}
```

### Referencing Specific Properties

To reference a specific property within a common schema:

```json
"thematic_representation": {
  "$ref": "../common/narrative_significance_schema.json#/properties/thematic_representation"
}
```

### Extending Common Schemas

To extend a common schema with entity-specific properties:

```json
"type": "object",
"allOf": [
  {
    "$ref": "../common/visual_representation_schema.json"
  }
],
"properties": {
  "additional_property": {
    "type": "string",
    "description": "Entity-specific property"
  }
}
```

## Key Common Schema Details

### `object_type_schema.json`

This schema defines all valid object types in the universe through an enumeration. Always use these exact values when specifying an object's type.

**Prompt Instruction for AI:** 
When generating content that requires an object type, always use one of the predefined types from this schema rather than creating new types. Check the categoryMapping section to determine which category best fits the entity you're describing.

### `references_schema.json`

This schema standardizes how entities reference each other, ensuring consistent cross-referencing throughout the database.

**Example Use:**
```json
"character_reference": {
  "$ref": "../common/references_schema.json"
}
```

**Prompt Instruction for AI:** 
When creating relationships between entities, always use the references schema format with id, name, and object_type at minimum. For temporal relationships, include the temporal_context property to specify when the relationship was/is valid.

### `abilities_schema.json`

This schema defines special powers, capabilities, or exceptional traits that transcend normal limitations, applicable to characters, artifacts, or locations.

**Key Fields:**
- `name` - Descriptive title of the ability
- `ability_type` - Classification of the ability's source/nature
- `limitations` - Restrictions that provide narrative balance
- `narrative_significance` - How the ability connects to themes or plot

**Prompt Instruction for AI:**
When creating abilities, always include balancing limitations and explain their narrative significance. For magical or supernatural abilities, clearly define their rules of operation. Use the predefined ability_type values from the enum.

### `visual_representation_schema.json`

This schema provides guidelines for the consistent visual depiction of entities across different media.

**Key Sections:**
- `essential_visual_elements` - Core visual features that must be maintained
- `style_guidelines` - Artistic direction for depicting the entity
- `image_generation_prompts` - Ready-to-use prompts for AI image generation

**Prompt Instruction for AI:**
When describing an entity's visual appearance, organize distinctive features by importance ("defining", "major", "minor"). Create detailed image generation prompts that include distinctive features, color palette, and artistic style. For character-specific visual elements, reference the extended schema in the character directory.

### `equipment_type_schema.json`

This schema standardizes the categories for all equipment, gear, and items in the narrative universe.

**Prompt Instruction for AI:**
When creating equipment items, always use one of the predefined equipment types from the enum. Check the descriptions object to ensure you're using the most appropriate category. Items should be categorized by function rather than appearance.

### `narrative_significance_schema.json`

This schema defines how entities connect to thematic elements and plot functions within the narrative.

**Key Components:**
- `thematic_representation` - How the entity embodies abstract concepts
- `plot_functions` - How the entity advances the narrative
- `structural_necessity` - How essential the entity is to the story

**Prompt Instruction for AI:**
When defining an entity's narrative significance, explicitly connect it to at least one major theme from the story. Explain how the entity moves the plot forward through specific functions or roles. Consider both obvious and subtle thematic connections.

### `chapter_information_schema.json`

**Purpose**: Document and analyze narrative chapters

**Key Elements**:
- Basic chapter identifiers
- Narrative content details
- Character appearances
- Key events
- Thematic elements
- Structural analysis
- Editorial assessment

**Common Cross-References**:
- Characters appearing in the chapter
- Locations featured in the chapter
- Events occurring during the chapter
- Themes explored in the chapter
- Previous and next chapters in sequence

## Best Practices

1. **Don't Duplicate Schema Logic**: If functionality exists in a common schema, reference it rather than recreating it.

2. **Follow Established Enums**: For any property that has enumerated values, strictly use the values defined in the schema.

3. **Keep References Complete**: Always include all required properties when referencing another entity.

4. **Use Schema Extensions Wisely**: When extending a common schema, only add properties that are genuinely specific to your entity type.

5. **Maintain Documentation**: When creating new properties that reference common schemas, include clear descriptions of how they relate.

## Prompt Instructions for AI Assistants

When working with The Shadow Team Chronicles database schemas:

1. **Prioritize Common Schemas**: Always check if a common schema exists for a concept before creating a new structure.

2. **Ensure Proper Paths**: When referencing common schemas, verify that paths are correct relative to the file location.

3. **Follow Naming Patterns**: Use the established naming conventions when creating new properties or schemas.

4. **Cross-Reference Appropriately**: Use the references schema for all entity relationships.

5. **Use Standardized Enums**: Always use predefined enumeration values rather than creating new ones.

6. **Maintain Consistency**: Ensure that usage of common schemas is consistent across different entity types.

7. **Respect Schema Hierarchy**: Understand which schemas extend others and maintain proper inheritance patterns.

8. **Documentation Generation**: When responding to queries about schemas, prioritize explaining common schema elements first, then entity-specific extensions.

## Examples for AI Assistants

### Example: Creating a Character with Special Abilities

```json
"special_abilities": {
  "$ref": "../common/abilities_schema.json",
  "items": [
    {
      "name": "Shadow Step",
      "ability_type": "magical",
      "description": "Allows instantaneous movement between shadows within line of sight.",
      "limitations": [
        "Requires visible shadows at both origin and destination",
        "Causes temporary disorientation after use",
        "Limited to three uses per day"
      ],
      "narrative_significance": "Represents the character's connection to the shadow realm and their journey between light and darkness, a central theme in their redemption arc."
    }
  ]
}
```

### Example: Referencing Another Entity

```json
"organization_reference": {
  "$ref": "../common/references_schema.json",
  "id": "a8f13b29-64de-48e3-8ca1-b5e3a32cc982",
  "name": "Shadow Guard",
  "object_type": "organization",
  "relationship": "former_member",
  "significance": "primary",
  "temporal_context": {
    "started": "2042-05-15T00:00:00Z",
    "ended": "2045-11-30T00:00:00Z",
    "is_current": false
  }
}
```

### Example: Using Narrative Significance

```json
"narrative_function": {
  "archetype": "Mentor",
  "story_role": "supporting",
  "thematic_representation": {
    "$ref": "../common/narrative_significance_schema.json#/properties/thematic_representation",
    "items": [
      {
        "theme": "Knowledge vs. Wisdom",
        "representation": "Embodies the distinction between accumulated knowledge and true wisdom through their extensive technical expertise but poor judgment in applying it."
      }
    ]
  }
}
```
