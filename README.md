# StoryTeller: Advanced Narrative Schema System

<div align="center">
  <img src="resources/storyteller_logo.png" alt="StoryTeller Logo" width="200"/>
  <br>
  <em>A structured approach to AI-assisted narrative creation</em>
</div>

## 🌟 Overview

StoryTeller is an advanced schema-driven framework designed to create rich, consistent narrative content with AI assistance. It combines structured metadata, standardized writing patterns, and comprehensive documentation to enable the creation of complex, interconnected stories while maintaining continuity and quality.

The system was developed specifically for "The Shadow Team Chronicles" universe but can be adapted for other narrative projects requiring systematic coherence and quality control.

## 🔑 Key Features

- **Schema-Driven Approach**: Standardized structures for all narrative elements
- **Prose Variation System**: Techniques to ensure natural, non-repetitive writing
- **Comprehensive Metadata Tracking**: Maintains relationships between all narrative objects
- **Timeline Management**: Ensures chronological consistency across stories
- **Database Integration**: Updates character, location, and event databases automatically
- **AI-Optimized Workflows**: Specially designed prompts for working with AI assistants

## 📁 Project Structure

```
TheStoryTeller/
├── README.md                    # This file
├── database_schemas/            # JSON schemas defining narrative structures
│   ├── enums/                   # Enumeration values for writing elements
│   ├── common/                  # Reusable schema components
│   ├── metadata/                # Metadata tracking structures
│   ├── character/               # Character-specific schemas
│   ├── location/                # Location-specific schemas
│   ├── organization/            # Organization-specific schemas
│   ├── timeline/                # Timeline and temporal schemas
│   └── historical_event/        # Historical event schemas
├── documentation/               # Comprehensive guides and instructions
│   ├── README.md                # Documentation guide
│   └── ...                      # Various implementation guides
├── content/                     # Actual narrative content
│   ├── the_shadow_team/         # The Shadow Team Chronicles storyline
│   │   ├── chapters/            # Story chapters and passages
│   │   └── DATABASE/            # JSON databases for this storyline
│   └── ...                      # Other storylines
└── resources/                   # Images, templates and other resources
```

## 🚀 Getting Started

### For Writers & Content Creators

1. **Begin with Documentation**
   - Start by reading the documentation README at [documentation/README.md](documentation/README.md)
   - Follow the recommended reading order to understand the system

2. **Explore Example Content**
   - Look at existing stories in the `content/` directory to see the system in action
   - Examine how metadata and schema implementation work in practice

3. **Use the AI Prompt Templates**
   - Documentation includes ready-to-use prompt templates for AI assistants
   - These guide AI in creating schema-compliant content

### For Developers & Technical Users

1. **Understand the Schema System**
   - Review the database schemas in `database_schemas/` directory
   - See how the schemas interconnect to create a coherent system

2. **Set Up a Development Environment**
   - Clone this repository
   - Use a JSON schema validator to ensure compliance

3. **Contribute Extensions**
   - Follow the schema organization guidelines when creating new schemas
   - Ensure new schemas are documented properly

## 📘 Core Documentation

For a comprehensive understanding of the StoryTeller system, please read these key documents:

1. [Schema Reference Directory](documentation/schema_reference_directory.md) - Complete catalog of all schemas
2. [Writing Schemas Guide](documentation/writing_schemas_guide.md) - Overview of writing schemas and their purpose
3. [Writing Schemas Usage Guide](documentation/writing_schemas_usage_guide.md) - Practical implementation workflow
4. [Schema Implementation Practical Guide](documentation/schema_implementation_practical_guide.md) - Concrete examples
5. [Integrated Schema Workflow](documentation/integrated_schema_workflow.md) - End-to-end content creation process

## Documentation Structure

TheStoryTeller system includes comprehensive documentation:

- **Schema Definitions**: Technical JSON schema files in `/database_schemas/`
- **Implementation Guides**: Practical guides in `/documentation/`
- **Templates**: Ready-to-use templates in `/templates/`
- **Examples**: Sample implementations in `/examples/`

For chapter information documentation specifically, see:

1. [Chapter Information Comprehensive Guide](/documentation/chapter_information_comprehensive_guide.md) - Complete all-in-one resource
2. [Chapter Information Visual Reference](/documentation/chapter_information_visual_reference.md) - Visual representations and troubleshooting
3. [Chapter Information Schema](/database_schemas/character/chapter_information_schema.json) - Technical schema definition

## 🧠 AI Integration

StoryTeller is designed to work seamlessly with AI assistants. The system includes:

- **Specialized Prompt Templates** - Structured prompts for different content creation needs
- **Metadata Validation** - Ensures AI-generated content maintains proper structure
- **Database Integration** - Instructions for updating related databases
- **Prose Variation Guidelines** - Ensures AI writing feels natural and non-repetitive

## 📚 The Shadow Team Chronicles

The primary storyline created with StoryTeller is "The Shadow Team Chronicles" - a near-future cyberpunk narrative set in Neo-Tokyo. The story follows a covert team navigating corporate conspiracies, advanced technology, and ethical dilemmas.

All content for this storyline can be found in the `content/the_shadow_team/` directory.

## 🛠 Advanced Usage

### Database Integration

The StoryTeller system maintains JSON databases for tracking:

- Character information and development
- Locations and their attributes
- Timeline events and chronology
- Organizations and factions
- Technologies and artifacts
- Relationships between entities

These databases are automatically updated when using the provided AI prompt templates.

### Custom Schema Development

You can extend the StoryTeller system by:

1. Creating new schema files following the organization guidelines
2. Documenting the new schemas in the reference directory
3. Creating implementation examples
4. Updating the AI prompt templates to utilize the new schemas

## 📝 Contributing

Contributions to StoryTeller are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Add or modify schemas following the organization guidelines
4. Update documentation to reflect your changes
5. Submit a pull request with a detailed explanation of your changes

## 📃 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- The narrative team who helped define the writing standards
- Contributors to the schema design and documentation
- Anyone using StoryTeller to create amazing narratives

---

<div align="center">
  <p>Created with ❤️ for storytellers everywhere</p>
</div>