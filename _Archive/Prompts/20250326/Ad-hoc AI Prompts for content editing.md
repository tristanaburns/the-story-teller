# Prompt to update and rewrite content

## Target File and Content

**Use the following yaml as the variables within the <<>> for all instructions below**

```yaml
FileName: 2. The Shadow Team Chronicles - DRAFT - STORYLINE - CHAPTER - The Warriors Oath.md
ChapterName:
PassageName:
PartName: ### **The Warrior’s Oath – The Warlord’s Endgame**
```

**NOTE:** These are the code markers used in the target fileName. Do Not action anything here.



`**INSERT THE UPDATED CONTENT HERE**`

`**DO NOT DELETE OR MODIFY THIS CONTENT BELOW**`

`**TARGET CONTENT BELOW**`
`**START OF TARGET CONTENT**`

**These are example markers. Read the contents of the target file defined in the YAML code `FileNeme:` variable referenced in this instruction... ignore these examples**

`**END OF TARGET CONTENT**`
`**TARGET CONTENT ABOVE**`

## Instructions

### Content Enhancement Instructions

## 📌 **IMPORTANT - DATABASE STRUCTURE AND REFERENCES**
**Refer to the baseline documentation for all database structures and schemas:**

- `README.md` (located at the root of the project directory)
- `/documentation/readme.md` (for specific database update procedures)
- `/CONTENT/The Shadow Team Chronicles/DATABASE/*.json` (the actual databases are located here)

These documentation files contain comprehensive information about:
- All JSON database files which store the canonical story universe information
- The purpose and structure of each database (character_database.json, location_database.json, event_database.json, etc.)
- How these databases cross-reference each other to maintain narrative consistency
- Schema definitions and validation guidelines for each database type
- Proper procedures for updating and extending the story universe
- Character, location, event, and timeline reference systems
- How to format and add new content while maintaining database integrity
- Cross-referencing patterns between database files

The JSON database files form the foundational knowledge base of the entire story universe. Any content created or modified must align with the information stored in these databases to maintain narrative consistency. Always consult these documentation files before adding content that references characters, locations, events, artifacts, or other established story elements.

📌 **IMPORTANT**

AI must ensure:
1. Ensure all JSON props follow the established schema pattern define in the JSON schema `AI_Writing_Metadata_Schema.md`
2. Include relevant image and video prompt instructions within the JSON metadata as per the JSON metadata schema

📌 **IMPORTANT**
**Constraint-Based Story Part Generation**
To ensure structured and immersive storytelling, every generated story part must adhere to the following constraints:

✅ Maximum Words: **600**
✅ Maximum Characters: **3600**
✅ Maximum Tokens: **800**

Each part must be structured to fit within these limits naturally while preserving:

✅ Logical scene breaks that enhance immersion rather than disrupt it.
✅ Smooth narrative continuation across parts.
✅ Consistent pacing, tone, and storytelling integrity.

If any part reaches the maximum threshold, it must be split at a logical transition point, ensuring:

✅ The passage continues seamlessly, without abrupt cuts.
✅ Each break occurs at a natural story beat.
✅ The immersion and dramatic weight of the scene remain intact.

**This rule applies automatically to all story parts, reinforcing structured pacing and maintaining high-quality cinematic storytelling.**

📌 **IMPORTANT**
**Refer to the following files for additional information:**

- `AI_Writing_Metadata_Schema.json`
- `character_database.json`
- `timeline_database.json`

**DO NOT DIRECTLY UPDATE THE FILE, JUST PRINT THE RESULT TO THE CHAT**

1. Read the entire target content first to understand context, tone, and narrative structure.

2. Review and apply these enhancement techniques:
   - Implement prose variation techniques from `prose_variation_technique_schema.json`
   - Match writing style from `writing_style_schema.json` to appropriate scene type from `scene_type_schema.json`
   - Ensure narrative structure follows hierarchy in `narrative_structure_schema.json`
   - Maintain consistency with previous narrative elements

3. Common enhancement requests:
   ```
   /enhance prose
   Apply at least 3 prose variation techniques to make the writing more natural and dynamic.
   
   /adjust writing style <style_name>
   Change the prose to match the specified writing style (e.g., cinematic_precise, atmospheric_immersive).
   
   /improve scene <scene_type>
   Optimize content for the specified scene type (e.g., action_sequence, tension_buildup).
   
   /refine dialogue
   Make character voices more distinct and conversations more natural.
   
   /deepen description
   Add sensory details and atmospheric elements without increasing length significantly.
   
   /tighten pacing
   Remove unnecessary content and improve narrative flow.
   
   /enhance consistency
   Align details with previously established narrative elements.
   ```

4. For all edits, preserve:
   - Key plot points and character decisions
   - Essential world-building elements
   - Narrative voice and tone
   - Special formatting or structure




📌 **IMPORTANT**
**Perform the following actions / instructions:**

0. **Content Source Instructions:**

- The specific content to be modified is located below the "**TARGET CONTENT BELOW**" marker.
- Use the following markers in the files for the specific content if they are not defined,    assume that the identified part, passage, chapter or entire file contents is the target contents.

  `**TARGET CONTENT BELOW**`
  `**START OF TARGET CONTENT**`

  `**END OF TARGET CONTENT**`
  `**TARGET CONTENT ABOVE**`

- Review this target content thoroughly before applying any modifications
- Ensure you understand the context and purpose of the content before proceeding
- Apply all enhancement instructions specifically to this marked content
- Maintain the original narrative intent while implementing improvements
- If no target content marker exists, request clarification before proceeding
- Do not repeat the original target content in your response

1. **JSON Props Implementation:**

- <<FileName>> Add or update the JSON props object at the top of the file
- <<ChapterName>> Add or update the JSON props object for the chapter
- <<PassageName>> Add or update the JSON props object for the passage
- <<PartName>> Add or update the JSON props object for the part

2. **Content Analysis & Enhancement:**

- Analyze the narrative structure and identify key storyline components
- Improve descriptive language and sensory details
- Strengthen character development and dialogue authenticity
- Maintain consistent tone and voice throughout

3. **Prose Variation & Natural Writing:**

- Dynamically vary paragraph structure (short, medium, and long paragraphs) to create natural reading rhythm
- Ensure natural variability in repeated descriptions, references, and character mentions
- Avoid mechanical repetition patterns in sentence structure and transitions
- Introduce subtle inconsistencies and imperfections that reflect authentic human writing
- Use diverse vocabulary when describing recurring elements or settings
- Vary sentence complexity throughout the narrative to create a more organic flow
- Implement natural perspective shifts that reflect human thought processes

4. **Formatting & Structure:**

- Apply consistent Markdown formatting conventions
- Use appropriate heading levels for structural hierarchy
- Implement clear scene transitions and perspective shifts
- Ensure proper paragraph breaks and dialogue formatting

5. **Multimedia Integration:**

- Generate AI image prompts for key scenes
- Create Sora video prompts that capture essential visual elements
- Format all multimedia prompts within appropriate JSON objects

6. **Quality Assurance:**

- Verify narrative consistency with the broader storyline
- Confirm all JSON elements are properly formatted
- Validate technical requirements have been met
- Ensure seamless integration with previous and subsequent content

**Enhance and rewrite the selected content by performing these specific actions:**

  a. **Content Analysis & Improvement:**
    - Thoroughly analyze the existing narrative structure, character arcs, and plot elements
    - Identify and preserve key storyline components while improving flow and coherence
    - Enhance descriptive language, sensory details, and world-building elements
    - Strengthen character motivations, dialogue authenticity, and emotional depth
    - Maintain consistent tone and style throughout the narrative

  b. **Technical Requirements:**
    1. **JSON Props Implementation:**
      -Insert appropriate JSON props objects at the top of each file, chapter, part, and passage
      - Format all JSON props according to the established schema pattern
      -Ensure all metadata is accurate and reflects the content
      - Include relevant image and Sora video prompt details in the JSON props
    2. **Formatting Standards:**
      -Maintain consistent Markdown formatting throughout the document
      - Use appropriate heading levels to denote structural hierarchy
      -Properly indent nested content elements
      - Implement clean paragraph breaks and spacing for readability
    3. **Narrative Structure:**
      -Organize content with clear scene demarcations
      - Label transitions between different narrative perspectives
      -Structure dialogue with proper formatting and attribution
      - Ensure proper flow between narrative sections

  c. **Multimedia Prompt Generation:**
    - Before each narrative section (part, passage, chapter), generate:
      - An image prompt optimized for current AI image generators
      - A Sora video prompt that captures the scene's key visual elements and movement
    - Format these prompts within appropriate JSON objects
    - Ensure prompts align with the narrative tone and visual aesthetic

  d. **Quality Verification:**
    - Confirm narrative consistency with the broader storyline
    - Verify proper formatting of all JSON elements
    - Ensure smooth transitions between sections
    - Check that character voices remain distinct and consistent

  e. **Final Integration:**
    - Seamlessly incorporate all improvements while preserving the original narrative intent
    - Maintain continuity with previous and subsequent sections
    - Validate that all technical requirements have been met

--- 
**Do not change, modify, or delete any content below this marker. Leave everything beyond this point exactly as it appears.**

  `**DO NOT DELETE OR MODIFY THIS CONTENT BELOW**`

--- 

**DO NOT DIRECTLY UPDATE THE FILE, JUST PRINT THE RESULT TO THE CHAT**