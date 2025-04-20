# The Shadow Team Chronicles: Writing Schemas Guide

This document provides technical specifications for the database schemas used in TheStoryTeller system.

## Schema Types

TheStoryTeller uses a collection of interrelated schemas to document narrative elements:

### Core Schemas

1. **Character Schema** - Defines character attributes, relationships, and development
2. **Location Schema** - Documents physical and conceptual settings
3. **Event Schema** - Records significant narrative occurrences
4. **Timeline Schema** - Establishes chronological sequence of events
5. **Relationship Schema** - Maps connections between characters
6. **Theme Schema** - Catalogs recurring motifs and concepts
7. **Chapter Information Schema** - Documents and analyzes narrative chapters

### Supporting Schemas

1. **Artifact Schema** - Documents significant objects
2. **Sensory Schema** - Records atmospheric and sensory details
3. **Cultural Schema** - Details societal and cultural elements
4. **Worldbuilding Schema** - Establishes broader setting elements
5. **Organization Schema** - Documents groups and institutions
6. **Event Relationships Schema** - Maps connections between events
7. **Chapter Analysis Schema** - Provides deeper analytical insights into chapters
8. **Chapter Summary Schema** - Creates concise summaries of chapters

## Schema Structure

Each schema follows a consistent structure to ensure interoperability:

### Common Elements

1. **Unique Identifier (id)** - String identifier with format [type]-[name]-[number]
2. **Metadata Section** - Creation date, modification date, version, and canon status
3. **Cross-References** - IDs that link to other relevant database entries
4. **Descriptive Content** - Detailed information specific to the schema type

### Chapter Information Schema Structure

The Chapter Information Schema includes:

1. **Core Identifiers**
   - `id`: Unique identifier (format: `chapter-[name]-[number]`)
   - `title`: Chapter title
   - `chapter_number`: Sequential position
   - `file_path`: Location of chapter content

2. **Status Information**
   - `created_date`: When chapter was first created
   - `last_modified`: When chapter was last updated
   - `status`: Current state (draft, review, final)
   - `version`: Version number

3. **Narrative Content**
   - `word_count`: Total words in chapter
   - `reading_time_minutes`: Estimated reading time
   - `narrative_time`: When events occur (start_date, end_date)
   - `previous_chapter` & `next_chapter`: Links to sequential chapters
   - `locations`: Places where action occurs
   - `characters`: Individuals appearing in chapter (primary, secondary, mentioned)
   - `point_of_view`: Narrative perspective
   - `narrative_style`: Stylistic approach

4. **Thematic Elements**
   - `primary_themes`: Main themes explored
   - `secondary_themes`: Supporting themes
   - `key_events`: Major occurrences
   - `event_chain`: Connection to event sequences

5. **Structural Analysis**
   - `chapter_sections`: Breakdown of chapter structure
   - `pacing`: Assessment of narrative rhythm
   - `character_arcs`: Character development details
   - `editorial_notes`: Strengths and areas for improvement
   - `setting_details`: Environmental and atmospheric elements

## ID Formatting Standards

Proper ID formatting is essential for maintaining database integrity:

1. **Character IDs**: `char-[name]-[number]` (e.g., `char-yoshi-001`)
2. **Location IDs**: `loc-[name]-[number]` (e.g., `loc-gojo-bridge-001`)
3. **Event IDs**: `event-[description]-[number]` (e.g., `event-benkei-oath-001`)
4. **Theme IDs**: `theme-[concept]-[number]` (e.g., `theme-honor-001`)
5. **Chapter IDs**: `chapter-[name]-[number]` (e.g., `chapter-warriors-oath-001`)
6. **Artifact IDs**: `artifact-[name]-[number]` (e.g., `artifact-sword-001`)
7. **Organization IDs**: `org-[name]-[number]` (e.g., `org-minamoto-001`)
8. **Event Chain IDs**: `event-chain-[description]-[number]` (e.g., `event-chain-yoshi-benkei-001`)

## Cross-Referencing

The power of TheStoryTeller system comes from cross-references between schemas:

1. **Direct References** - Using IDs to link directly to other database entries
   - Example: A chapter entry references character IDs that appear in the chapter

2. **Relationship References** - Establishing the nature of connections
   - Example: An event entry specifies how it relates to characters ("participant", "witness")

3. **Hierarchical References** - Establishing parent-child relationships
   - Example: An organization entry references its parent organization

4. **Temporal References** - Establishing chronological relationships
   - Example: An event references its position in the timeline

## Chapter Information Schema Usage

The Chapter Information Schema serves multiple purposes:

1. **Documentation** - Records key details about each chapter
2. **Analysis** - Provides structural and narrative assessment
3. **Continuity** - Ensures consistency across chapters
4. **Planning** - Aids in developing future chapters

For detailed guidance on implementing the Chapter Information Schema, see [Chapter Information Comprehensive Guide](chapter_information_comprehensive_guide.md).

## Schema Validation

All schemas should be validated against their corresponding JSON Schema definitions:

1. Character Schema: `database_schemas/character/character_schema.json`
2. Location Schema: `database_schemas/location/location_schema.json`
3. Event Schema: `database_schemas/event/event_schema.json`
4. Chapter Information Schema: `database_schemas/character/chapter_information_schema.json`

Validation ensures that all required fields are present, values conform to expected formats, and cross-references maintain database integrity.

## Best Practices

1. **Be Comprehensive** - Include all relevant information, even if it seems minor
2. **Be Consistent** - Follow established patterns for similar entries
3. **Be Precise** - Use specific language rather than vague descriptions
4. **Be Connected** - Ensure robust cross-referencing between related entries
5. **Be Current** - Update entries when new information becomes available

## Conclusion

The Writing Schemas documentation provides the technical foundation for TheStoryTeller database system. By following these specifications and standards, you'll create a robust, interconnected narrative database that supports sophisticated storytelling and analysis.
