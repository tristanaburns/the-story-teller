# The Shadow Team Chronicles: Schema Reference Directory

This document serves as the **definitive catalog** of all schema files in The Shadow Team Chronicles project, organized by directory and purpose. Use this as your first reference point when looking for specific schemas.

## Schema Organization Overview

The schema system follows a structured organization pattern:

```
database_schemas/
├── enums/           # Standardized enumeration values
├── common/          # Reusable schema components
├── metadata/        # Metadata tracking structures
├── character/       # Character-specific schemas
├── location/        # Location-specific schemas
├── organization/    # Organization-specific schemas
├── timeline/        # Timeline and temporal schemas
└── historical_event/# Historical event schemas
```

## Core Schema Categories

### Enum Schema Files (`enums/`)

These define standardized enumeration values for consistent narrative elements:

| Schema Filename | Purpose | Primary Use Case |
|----------------|---------|------------------|
| `narrative_structure_schema.json` | Defines story hierarchy levels | Organizing narrative content |
| `scene_type_schema.json` | Categorizes scene functions | Determining appropriate writing approach |
| `writing_style_schema.json` | Defines standardized writing styles | Guiding prose style selection |
| `prose_variation_technique_schema.json` | Lists natural writing techniques | Ensuring organic, non-repetitive text |
| `narrative_pacing_schema.json` | Controls storytelling speed | Setting appropriate scene rhythm |
| `scene_transition_schema.json` | Defines scene movement methods | Creating smooth narrative flow |
| `dialogue_tag_style_schema.json` | Standardizes dialogue presentation | Maintaining consistent speech attribution |
| `emotional_tone_schema.json` | Defines emotional atmosphere options | Creating specific feeling in scenes |
| `description_focus_schema.json` | Prioritizes descriptive elements | Emphasizing sensory details |
| `character_dynamic_schema.json` | Defines relationship patterns | Ensuring consistent character interactions |

### Common Schema Files (`common/`)

These define reusable components used across multiple schema types:

| Schema Filename | Purpose | Primary Use Case |
|----------------|---------|------------------|
| `timestamp_schema.json` | Standard datetime format | Temporal tracking in metadata |
| `location_reference_schema.json` | Location reference structure | Spatial positioning in content |
| `object_reference_schema.json` | Entity reference structure | Cross-referencing narrative objects |
| `time_period_schema.json` | Time span definition | Historical and temporal contexts |
| `metadata_base_schema.json` | Core metadata structure | Foundation for all metadata objects |
| `references_schema.json` | Reference linking structure | Creating connections between content |
| `object_type_schema.json` | Content type classification | Categorizing narrative objects |
| `writing_elements_schema.json` | Writing component definitions | Standardizing narrative elements |
| `historical_significance_schema.json` | Historical impact measures | Contextualizing events and artifacts |
| `multimedia_schema.json` | Media reference structure | Integrating visual and audio elements |

### Domain-Specific Schema Files

These schemas define structures for specific narrative elements:

#### Character Schemas (`character/`)
- `personal_data_schema.json` - Core character attributes
- `timeline_schema.json` - Character chronology
- `relationships_schema.json` - Character connections
- `affiliations_schema.json` - Organizational ties
- `character_arc_schema.json` - Development trajectory
- `attributes_schema.json` - Character traits
- `skills_schema.json` - Character capabilities
- `abilities_schema.json` - Special talents/powers
- `equipment_schema.json` - Character possessions
- `voice_schema.json` - Speech patterns and dialogue
- `narrative_function_schema.json` - Story role
- `visual_representation_schema.json` - Physical appearance
- `identity_schema.json` - Self-conception
- `psychological_profile_schema.json` - Mental characteristics
- `backstory_schema.json` - Personal history
- `character_metadata_schema.json` - Character documentation
- `chapter_information_schema.json` - Comprehensive chapter documentation and analysis

#### Chapter Information Schemas (`chapter/`)
- `chapter_information_schema.json` - Primary schema for chapter documentation and analysis
- `chapter_sections_schema.json` - Structure for breaking down chapter components
- `chapter_narrative_elements_schema.json` - Elements that compose narrative structure
- `character_arc_schema.json` - Character development tracking within chapters
- `editorial_notes_schema.json` - Writing guidance and improvement tracking
- `pacing_analysis_schema.json` - Rhythm and flow analysis of narrative sections

#### Location Schemas (`location/`)
- `geographic_data_schema.json` - Physical characteristics
- `time_variants_schema.json` - Temporal changes
- `celestial_body_schema.json` - Planetary/space objects
- `accessibility_schema.json` - Access restrictions
- `environment_schema.json` - Natural conditions
- `governance_schema.json` - Political control
- `inhabitants_schema.json` - Population data
- `features_schema.json` - Distinctive elements
- `history_schema.json` - Location chronology
- `culture_schema.json` - Cultural aspects

#### Organization Schemas (`organization/`)
- `formation_schema.json` - Founding information
- `structure_schema.json` - Organizational hierarchy
- `assets_schema.json` - Resources and possessions
- `relationships_schema.json` - Inter-organizational ties
- `culture_schema.json` - Internal values and practices
- `history_schema.json` - Organizational timeline
- `goals_schema.json` - Motivations and objectives
- `membership_schema.json` - Member characteristics
- `communication_methods_schema.json` - Information flow
- `notable_activities_schema.json` - Significant actions
- `influence_spheres_schema.json` - Areas of impact
- `resource_management_schema.json` - Asset allocation

#### Timeline Schemas (`timeline/`)
- `temporal_positioning_schema.json` - Time placement
- `time_bound_history_schema.json` - Historical records
- `timeline_event_schema.json` - Temporal occurrences
- `timeline_schema.json` - Complete chronology structure

### Metadata Schema Files (`metadata/`)

These define structures for content tracking and management:

| Schema Filename | Purpose | Primary Use Case |
|----------------|---------|------------------|
| `ai_writing_metadata_schema.json` | Master AI content metadata | Complete tracking of generated content |
| `base_metadata_schema.json` | Foundation metadata structure | Core fields for all metadata |
| `document_metadata_schema.json` | Document-specific metadata | Tracking document-level information |
| `system_metadata_schema.json` | System-level metadata | Managing process data |
| `versioning_schema.json` | Version control metadata | Tracking content changes |

## Documentation Guide

For guidance on implementing these schemas, refer to our documentation suite:

* **[Writing Schemas Usage Guide](writing_schemas_usage_guide.md)** - Step-by-step workflow for implementing schemas
* **[Schema Implementation Practical Guide](schema_implementation_practical_guide.md)** - Concrete code examples and patterns
* **[Integrated Schema Workflow](integrated_schema_workflow.md)** - End-to-end process for combining schemas
* **[Prose Variation Techniques](prose_variation_techniques.md)** - Detailed examples for natural writing variation
* **[Schema Organization Guidelines](schema_organization_guidelines.md)** - Rules for organizing schema files
* **[Character Creation Guide](character_creation_guide.md)** - Character schema implementation
* **[Location Schemas Guide](location_schemas_guide.md)** - Location schema implementation
* **[Organization Schemas Guide](organization_schemas_guide.md)** - Organization schema implementation
* **[Timeline Schemas Guide](timeline_schemas_guide.md)** - Timeline schema implementation
* **[Chapter Information Comprehensive Guide](chapter_information_comprehensive_guide.md)** - Complete guide to chapter documentation
* **[Chapter Information Visual Reference](chapter_information_visual_reference.md)** - Visual guide to chapter documentation
* **[Historical Events Guide](historical_events_guide.md)** - Historical event schema implementation
* **[Implementing Metadata System](implementing_metadata_system.md)** - Metadata schema implementation
