# Instructions for AI Coding Assistant

When working on The Story Teller project, follow these guidelines to ensure proper alignment with the project's schema-driven architecture and development processes:

## Efficient Project Understanding Workflow

For maximum efficiency, follow this priority sequence to understand the project's current state and next tasks:

1. **Check Status First**: Begin by examining current project status
   - Start with `project/docs/status/project-status-overview.md` for high-level status
   - Then check `project/docs/status/project-status-in-progress.md` for active work
   - Review `project/docs/status/project-status-planned.md` for upcoming work
   - Reference `project/docs/status/project-status-completed.md` for historical context

2. **Understanding Planning**: After status, check planning documentation
   - Review `project/docs/planning/project-roadmap.md` for overall timeline
   - Check `project/docs/planning/project-sprint-planning.md` for current sprint details
   - Examine `project/docs/planning/project-feature-specifications.md` for feature details
   
3. **Detailed Plan Reference**: For deeper implementation details
   - Read `project/docs/plan/project-plan-overview.md` for project overview
   - Reference `project/docs/plan/project-plan-milestones.md` for key milestones
   - Check `project/docs/plan/project-plan-phases.md` for implementation phases

4. **Requirements Verification**: To ensure alignment with requirements
   - Review `project/docs/requirements/project-requirements-overview.md` for high-level requirements
   - Check appropriate specialized requirements documents as needed:
     - `project/docs/requirements/functional-requirements.md`
     - `project/docs/requirements/non-functional-requirements.md`
     - `project/docs/requirements/technical-requirements.md`
     - `project/docs/requirements/mcp-requirements.md`

## Directory Structure Guide

The project documentation is organized into these key directories:

- **`project/docs/status/`**: Current implementation status (START HERE)
  - Contains real-time status of all project components
  - Shows what's completed, in-progress, and planned
  - Provides the most up-to-date information on project state

- **`project/docs/planning/`**: Short-term planning and feature details
  - Contains sprint plans, resource allocation, and feature specifications
  - Provides detailed roadmap and release planning
  - Describes specific implementation plans for features

- **`project/docs/plan/`**: High-level project planning
  - Contains project overview, milestones, phases, and testing approach
  - Provides the big picture of the project implementation
  - Outlines long-term goals and extensions

- **`project/docs/requirements/`**: Project requirements
  - Contains detailed requirements specifications
  - Defines what must be built and system constraints
  - Provides the foundation for implementation decisions

- **`project/devlogs/`**: Development history
  - Contains chronological logs of implementation decisions
  - Provides historical context for implementation choices
  - Tracks development progress over time

## Task-Specific Workflow

When working on specific tasks or features:

1. **For Current Task Context**:
   - First check `project/docs/status/project-status-in-progress.md` to understand active work
   - Then review the relevant feature specification in `project/docs/planning/project-feature-specifications.md`
   - Verify requirements in the appropriate requirements document

2. **For Implementation Guidance**:
   - Check for relevant guidelines in `project/docs/guidelines/`
   - Review architecture documentation in `project/docs/architecture/`
   - Reference codebase documentation in `project/docs/codebase/`

3. **When Implementing New Features**:
   - First understand where the feature fits in the overall plan from status documents
   - Then check requirements to ensure alignment with project needs
   - Finally review planning documents for implementation details

## Schema Integration Requirements

1. **Schema Compliance**:
   - Always check relevant JSON schemas in `database_schemas/` before modifying data models
   - Ensure all code adheres to the schema structure defined in these files
   - Validate data against schemas in database operations

2. **Metadata Tracking**:
   - Maintain proper cross-references between narrative objects
   - Preserve relationship integrity when modifying data

## Code Implementation Guidelines

1. **File System Operations**:
   - Use the file system to read and write code when implementing features
   - Maintain the Next.js directory structure as defined in `project/docs/structure/project-structure-directory.md`
   - Add new files in appropriate directories following established patterns in `project/docs/structure/project-structure-file-naming-conventions.md`

2. **Component Development**:
   - Place UI components according to the conventions in `project/docs/structure/project-structure-module-structure.md`
   - Follow component naming and organization conventions as documented in `project/docs/structure/project-structure-code-organization.md`
   - Ensure components support schema-driven data structures

3. **API Development**:
   - Implement API endpoints in the appropriate locations following Next.js App Router conventions
   - Ensure API operations maintain data integrity according to schemas
   - Include proper validation and error handling as specified in `project/docs/guidelines/`

4. **Testing Requirements**:
   - Follow testing guidelines outlined in `project/testing/test-implementation-plan.md`
   - Write tests according to the project's testing philosophy and approach

## Documentation Preservation (MANDATORY)

1. **DO NOT DELETE Detailed Documentation**:
   - Documentation files in `project/docs/plan/` and `project/docs/requirements/` are carefully maintained reference documents
   - They serve as high-level entry points to the project details
   - They MUST NEVER be deleted
   - Their purpose is to improve accessibility and onboarding efficiency

2. **Limited Modification Rules**:
   - Only update specific sections in these files directly related to changes (status updates, etc.)
   - Never remove or delete sections, especially unimplemented features
   - When updating, follow the Documentation Integrity Guidelines in the files themselves
   - Always preserve the structure, formatting, and organization of these documents
   - Add information incrementally rather than replacing existing content

3. **Documentation Consistency**:
   - When updating detailed docs in project/docs/, ensure consistency across all documentation
   - Ensure consistency between related documentation files
   - Reference relationships must be maintained between these document sets

## Development Log Requirements

1. **Create DEVLOG Entries**:
   - For significant changes, create new entries in `project/devlogs/entries/`
   - Follow naming convention: `YYYY-MM-DD-HH-MM-category-brief-title.md`
   - Use format specified in `project/devlogs/devlog-instructions.md`

2. **Document Reasoning**:
   - Explain architectural decisions in devlog entries
   - Document challenges and solutions
   - Reference related schema files when implementing features

## Integration with AI Instruction Templates

1. **AI Prompt Implementation**:
   - Review templates in `AI_INSTRUCTION_TEMPLATES/`
   - When implementing AI integration features, follow prompt structure from these templates
   - Ensure AI outputs are validated against relevant schemas

## Current Project Focus

As of the last update, the project is focused on:

1. **Core Editor Functionality**: Implementing rich text editing, chapter navigation, and autosave
2. **Character Management System**: Creating profile components, data models, and relationship mapping
3. **Upcoming**: Location management, timeline visualization, and AI assistance features

When assisting with these areas, prioritize checking the status files for the most up-to-date information on implementation progress and next steps.

## General Rules

1. **Never Delete Unimplemented Features**:
   - In documentation, never remove features marked as planned (⏱️)
   - Maintain the full project roadmap as defined in the plan documents

2. **Maintain Documentation Integrity**:
   - Update documentation incrementally, don't replace entire sections
   - Preserve historical context in all documentation
   - Follow the five documentation integrity guidelines outlined in `project/docs/index.md`

3. **Follow Schema-Driven Development**:
   - Always prioritize schema compliance over convenience
   - Ensure all data manipulations preserve relational integrity
   - Think in terms of narrative objects and their relationships

4. **Coding Standards**:
   - Adhere to coding standards defined in `project/docs/codebase/project-coding-standards.md`
   - Maintain consistent error handling and logging approaches

When suggesting or implementing code, always refer back to these foundational principles and ensure your work aligns with the schema-driven architecture that defines The Story Teller project.

## Documentation Structure

The Story Teller project follows a structured documentation approach:

1. **Plan Documentation** (in `project/docs/plan/` subdirectory):
   - Project overview and guiding principles (`project-plan-overview.md`)
   - Detailed implementation phases (`project-plan-phases.md`)
   - Project milestones and timeline (`project-plan-milestones.md`)
   - Testing philosophy and approach (`project-plan-testing.md`)
   - Future extensions and enhancements (`project-plan-extensions.md`)

2. **Requirements Documentation** (in `project/docs/requirements/` subdirectory):
   - High-level requirements overview (`project-requirements-overview.md`)
   - Functional requirements (`functional-requirements.md`)
   - Non-functional requirements (`non-functional-requirements.md`)
   - Technical requirements (`technical-requirements.md`)
   - MCP server requirements (`mcp-requirements.md`)

3. **Detailed Documentation** (in other `project/docs/` subdirectories):
   - Architecture documentation (`architecture/` subdirectory)
   - Project structure documentation (`structure/` subdirectory)
   - Implementation status tracking (`status/` subdirectory)
   - Code-specific documentation (`codebase/` subdirectory)
   - Development guidelines (`guidelines/` subdirectory)

This structure ensures both accessibility for new team members and depth for implementation, while maintaining the project's documentation integrity guidelines.