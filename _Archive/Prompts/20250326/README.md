# The StoryTeller AI Instruction Templates

This directory contains the core instruction files used by The StoryTeller AI Writing Assistant system. These templates define the structure, metadata requirements, and content generation processes for creating consistent narrative content within The Shadow Team Chronicles universe.

## Directory Contents

### Metadata and Schema Files

- **AI_Writing_Metadata_Schema.md**
  - Comprehensive documentation of all metadata schemas in human-readable format
  - Includes JSON schema snippets, field descriptions, and implementation guides
  - Serves as the authoritative reference for all metadata structures

- **AI_Writing_Metadata_Schema.json**
  - Complete JSON Schema definition for validating metadata objects
  - Used by automated validation tools to ensure metadata compliance
  - Contains all required field definitions, value constraints, and data types

### Content Generation Templates

- **UPDATED_Ad-hoc_AI_Prompt_for_Content_Expansion.md**
  - Detailed prompt for expanding narrative content while maintaining structural integrity
  - Includes specific instructions for natural prose variation, word count requirements, and multimedia integration
  - Enforces character voice consistency and proper narrative hierarchy

## How to Use These Files

### For Content Generation

1. **Reference the Schema Documentation First**
   - Before generating new content, review `AI_Writing_Metadata_Schema.md` to understand the metadata requirements
   - Pay special attention to the narrative structure hierarchy and required fields for your content type

2. **Use the Content Expansion Prompt**
   - When expanding existing content, use `UPDATED_Ad-hoc_AI_Prompt_for_Content_Expansion.md` as your base prompt
   - Modify the YAML section at the top to reference your specific content source files
   - Ensure that your AI provider has access to both this prompt and the referenced source files

3. **Validate Generated Metadata**
   - After content generation, validate the JSON metadata against `AI_Writing_Metadata_Schema.json`
   - Use a JSON Schema validator tool to confirm compliance
   - Fix any validation errors before integrating the content into the main storyline

### Example Workflow

1. **Identify Content for Expansion**
   ```
   File: The Shadow Team Chronicles - DRAFT - STORYLINE - CHAPTER - The Warriors Oath.md
   Part: The Warrior's Oath – The Warlord's Endgame
   ```

2. **Prepare the Prompt**
   - Open `UPDATED_Ad-hoc_AI_Prompt_for_Content_Expansion.md`
   - Update the YAML content source section with your file information
   - Submit to your AI provider with references to required database files

3. **Review and Validate the Output**
   - Check that the generated content follows all writing rules and constraints
   - Validate the JSON metadata for proper structure and field values
   - Ensure multimedia prompts are properly formatted for image/video generation

4. **Integrate into Main Storyline**
   - Once validated, integrate the expanded content into your story structure
   - Update database references as needed for any new elements introduced

## Metadata Compliance Requirements

All content generated using these templates must:

1. Include complete JSON metadata objects with all required fields
2. Follow the hierarchical narrative structure (storyline → volume → act → story → chapter → passage → part)
3. Maintain proper parent-child relationships between narrative elements
4. Include UUIDv4 identifiers for all objects
5. Specify appropriate writing styles, scene types, and narrative pacing
6. Include properly formatted multimedia generation prompts
7. Follow prose variation techniques for natural-sounding content

## Dependencies

- JSON Schema validator (for metadata validation)
- Access to character, location, and event databases
- Familiarity with the overall narrative structure and universe rules

## Notes on Version Control

When updating these template files:

1. Increment the version number in the YAML frontmatter
2. Update the `last_updated` date
3. Document changes in the project's main change log
4. Ensure backward compatibility with existing content where possible

For questions or issues with these templates, refer to the main project documentation or contact the system administrator.
