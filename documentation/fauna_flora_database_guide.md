# Fauna and Flora Database Guide

This guide describes how to use the Fauna and Flora Database in The Shadow Team Chronicles project.

## Overview

The Fauna and Flora Database contains detailed information about plant species (flora), animal species (fauna), and magical beings that exist within The Shadow Team Chronicles universe. This database is essential for maintaining consistency in how these organisms are portrayed across different stories and media.

## Database Structure

The database is stored in `fauna_flora_database.json` and follows the schema defined in `database_schemas/fauna_flora_schema.json`. It consists of three main sections:

1. **Flora** - Plants and plant-like organisms
2. **Fauna** - Animals and animal-like organisms
3. **Magical Beings** - Creatures with magical properties that don't fit conventional classifications

## Adding New Entries

### Flora (Plants)

When adding a new plant species, include the following information:

- **id**: Unique identifier (UUID)
- **name**: Common name
- **scientific_name**: Taxonomic name (if applicable)
- **classification**: Kingdom, family, genus, species
- **description**: Detailed physical description
- **habitat**: Environments where it grows
- **distribution**: Geographic regions where it's found
- **properties**: Boolean flags for medicinal, poisonous, magical, edible traits
- **special_characteristics**: Any unique traits
- **cultural_significance**: How cultures perceive or use it
- **ecological_role**: Its role in ecosystems
- **notable_uses**: How it's used by inhabitants
- **appearance_in_story**: References to narrative appearances

Example:

```json
{
  "id": "flora-000-example",
  "name": "Moonlight Iris",
  "scientific_name": "Iris lunaluminans",
  "description": "A silver-petaled iris that glows faintly under moonlight...",
  "habitat": ["forest clearings", "mountain meadows"],
  "properties": {
    "medicinal": true,
    "magical": true,
    "poisonous": false,
    "edible": false
  },
  "special_characteristics": [
    "Bioluminescent under moonlight",
    "Blooms only during full moons"
  ],
  "cultural_significance": "Used in rituals by mountain communities..."
}
```

### Fauna (Animals)

When adding a new animal species, include:

- **id**: Unique identifier (UUID)
- **name**: Common name
- **scientific_name**: Taxonomic name (if applicable)
- **classification**: Kingdom, phylum, class, order, family, genus, species
- **description**: Detailed physical description
- **habitat**: Environments where it lives
- **distribution**: Geographic regions where it's found
- **behavior**: Social structure, activity patterns, diet, hunting methods
- **properties**: Boolean flags for dangerous, magical, intelligent, domesticable traits
- **special_abilities**: Any unique capabilities
- **cultural_significance**: How cultures perceive or use it
- **ecological_role**: Its role in ecosystems
- **appearance_in_story**: References to narrative appearances

### Magical Beings

For magical creatures that don't fit conventional classifications:

- **id**: Unique identifier (UUID)
- **name**: Common name
- **classification**: Type of magical being
- **description**: Detailed physical description
- **habitat**: Where it typically resides
- **magical_properties**: Special abilities with descriptions and limitations
- **origin**: Creation or origin story
- **interaction_with_humans**: How it typically interacts with humans
- **appearance_in_story**: References to narrative appearances

## Cross-Referencing

Link fauna and flora to other database elements using:

- **location_id**: References to where these organisms can be found
- **event_id**: References to narrative events featuring these organisms

## Best Practices

1. **Consistency**: Ensure new entries align with existing worldbuilding
2. **Detail Level**: Provide sufficient detail for writers to accurately portray the organism
3. **Narrative Relevance**: Focus on species that have significance to the story
4. **Scientific Plausibility**: Even magical species should have internal consistency
5. **Cultural Context**: Consider how different cultures in the world interact with the species

## Workflow for Adding New Species

1. Check if the species already exists in the database
2. Create a new entry using the appropriate template
3. Fill in all required fields and as many optional fields as possible
4. Add cross-references to relevant locations and events
5. Update any related entries that might reference this species
