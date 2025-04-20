# Schema Organization Guidelines

This document provides guidelines for organizing and managing schema files in The Shadow Team Chronicles project.

## Schema File Locations

To maintain consistency and prevent duplication, follow these organization principles:

### 1. Enum Schema Files

**Location:** `enums/` directory

Enum schemas define standardized enumeration values for narrative elements:

- `narrative_structure_schema.json`
- `scene_type_schema.json`
- `writing_style_schema.json`
- `prose_variation_technique_schema.json`
- `narrative_pacing_schema.json`
- `scene_transition_schema.json`
- `dialogue_tag_style_schema.json`
- `emotional_tone_schema.json`
- `description_focus_schema.json`
- `character_dynamic_schema.json`
- Any other schemas that define fixed enumeration options

### 2. Common Schema Files

**Location:** `common/` directory

Common schemas define reusable structural components:

- `timestamp_schema.json`
- `location_reference_schema.json`
- `object_reference_schema.json`
- `time_period_schema.json`
- `metadata_base_schema.json`
- `references_schema.json`
- Other building block schemas used across multiple contexts

### 3. Metadata Schema Files

**Location:** `metadata/` directory

Metadata schemas define structures for tracking content:

- `ai_writing_metadata_schema.json`
- `base_metadata_schema.json`
- `document_metadata_schema.json`
- `system_metadata_schema.json`
- `versioning_schema.json`

### 4. Domain-Specific Schema Files

**Location:** Subdirectories matching their domain (e.g., `character/`, `location/`, `organization/`)

These schemas define structures for specific story elements:

- `character/personal_data_schema.json`
- `location/geographic_data_schema.json`
- `organization/structure_schema.json`

## Preventing Duplication

To prevent schema duplication:

1. **Check existing schemas before creating new ones**
   - Search both the filename and content to avoid duplication
   - Consider extending existing schemas rather than creating new ones

2. **Use the correct directory**
   - Enum values belong in `enums/`
   - Common structures belong in `common/`
   - Domain-specific schemas belong in their respective subdirectories

3. **Maintain a central reference**
   - Update `schema_reference_directory.md` when adding new schemas
   - Document relationships between schemas

4. **Update references when moving schemas**
   - When relocating a schema, ensure all references to it are updated
   - Use search tools to find all instances of the file path

## Schema Naming Conventions

1. **Use snake_case for all schema filenames**
   - Example: `narrative_structure_schema.json`

2. **End all schema files with `_schema.json`**
   - This makes them easily identifiable as schema files

3. **Use descriptive prefixes for related schemas**
   - Example: All character-related schemas start with `character_`

By following these guidelines, we can maintain a clean, organized schema structure that prevents duplication and makes the system easier to maintain and extend.
