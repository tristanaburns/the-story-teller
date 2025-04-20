# Comprehensive Database Update Prompt for The Shadow Team Chronicles

## 🧭 Overview & Objective

As an AI assistant working with The Shadow Team Chronicles universe, you are tasked with systematically updating the database files to incorporate new narrative content while maintaining schema compliance and relational integrity across the entire story universe. This is a structured, methodical process that requires careful analysis, documentation review, and precise implementation.

## 📚 Required Documentation Review Process

1. **Begin by thoroughly reviewing these files in order:**
   - First, read the entire README.md file to understand the project structure, schema organization, and core documentation references
   - Review all referenced documentation files in the documentation directory, paying particular attention to:
     - `schema_organization_guidelines.md`
     - `schema_implementation_practical_guide.md`
     - `reference_management_guide.md`
     - `timeline_schemas_guide.md`
     - Domain-specific implementations relevant to the content being processed

2. **Schema files review:**
   - Examine all relevant schema files in database_schemas directory
   - Pay close attention to required fields, data types, and nested object structures
   - Note any enum schemas that constrain allowed values
   - Understand cross-reference patterns between schema types

## 📂 Content Analysis & Database Preparation

3. **Read and analyze the target content file:**
   - Locate and read the specified content file:
     ```
     /content/the shadow team chronicles/storyline/draft/2. The Shadow Team Chronicles - DRAFT - STORYLINE - CHAPTER - The Warriors Oath.md
     ```
   - Perform a comprehensive narrative analysis, identifying:
     - All characters with descriptions, traits, and development
     - All locations with features, historical significance, and atmosphere
     - All events with dates, participants, and outcomes
     - All relationships between characters, factions, and locations
     - All artifacts, technologies, and significant objects
     - All cultural elements, traditions, and societal structures
     - Thematic elements, motifs, and symbolic objects

4. **Database inventory preparation:**
   - Create an inventory of existing database files in `/content/The Shadow Team Chronicles/database/`
   - Before making any changes, read the entire contents of each relevant database file
   - Identify existing entries related to elements found in the target content
   - Document potential conflicts, overlaps, or contradictions
   - Map relational structures between existing database elements

## 🔄 Database Update Methodology

5. **Process one database file at a time:**
   - Begin with the database that has the most foundational entities (typically character_database.json)
   - READ THE ENTIRE DATABASE FILE CONTENTS FIRST before making any changes
   - Process a single database file completely before moving to the next
   - Follow this order of operations:
     1. Identify entities to update or create
     2. For existing entities, merge new information with existing data
     3. For new entities, create complete entries conforming to schema
     4. Update all internal references with proper UUIDs
     5. Document all changes with detailed explanations

6. **Critical update rules:**
   - NEVER create duplicate entities - update existing ones instead
   - NEVER change primary IDs (UUIDs) of existing entities
   - Always generate valid UUID v4 for new entities
   - Maintain bi-directional references between related entities
   - Document uncertainty with appropriate confidence ratings
   - Preserve previous versions in version_history fields
   - Ensure chronological accuracy in timeline entries
   - Follow established schema formats precisely

## 📊 Response Format & Continuation Protocol

7. **For each database file, structure your response with:**
   - **Content analysis summary** relevant to this specific database
   - **Planned database operations** (create new entries, update existing entries)
   - **Full JSON** for all new or modified entries
   - **Reference update documentation** showing connections to other databases
   - **Validation assessment** noting any schema compliance issues or conflicts
   - **Continuation indicator** when you've completed this database file

8. **Multi-response workflow:**
   - After completing updates to one database file, explicitly state:
     ```
     === DATABASE FILE COMPLETE: [filename] ===
     Ready to proceed with next database file: [next_filename]
     Shall I continue with the next database file?
     ```
   - Wait for user confirmation before proceeding to the next database
   - If token limits are reached during a database update, state:
     ```
     === CONTINUATION NEEDED ===
     Database file [filename] is partially processed.
     Please respond to continue updating this database file.
     ```

## 🔍 Validation Requirements

9. **Before completing each database file update:**
   - Verify schema compliance for all new and modified entries
   - Check all cross-references for validity
   - Ensure bi-directional references are consistent
   - Validate chronological accuracy of timeline events
   - Confirm all required fields are present and properly formatted
   - Verify that no duplicate entries have been created
   - Document any unresolved issues or ambiguities

## 📌 Begin Execution

Begin by acknowledging these instructions and providing a brief summary of your understanding of the task. Then proceed with analyzing the content file and preparing for database updates. Wait for confirmation before proceeding with the first database file update.