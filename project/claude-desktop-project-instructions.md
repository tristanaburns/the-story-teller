# Instructions for Claude when Working on The Story Teller Project

When working on The Story Teller project, follow these guidelines to ensure proper alignment with the project's schema-driven architecture and development processes:

## Initial Setup - Always Read These Files First

1. **Read Project Structure**:
   - First, examine `C:\GitHub_Development\the-story-teller\README.md` for high-level overview
   - Then read `C:\GitHub_Development\the-story-teller\project\README.md` for implementation details
   - **CRITICAL**: Read the consolidated documentation files:
     - `project/project-plan.md` for the complete implementation plan
     - `project/project-requirements.md` for comprehensive requirements
   - Explore the `project/docs/` directory structure for detailed documentation:
     - `project/docs/index.md` for documentation organization
     - `project/docs/plan/` for detailed implementation plans and roadmaps
     - `project/docs/structure/` for project structure documentation
     - `project/docs/architecture/` for architectural documentation
     - `project/docs/status/` for implementation status
     - `project/docs/codebase/` for code-specific documentation
     - `project/docs/guidelines/` for development guidelines

2. **Review Development Status**:
   - Check `project/devlogs/devlog-index.md` for recent development history
   - Examine `project/devlogs/DEVLOG.md` for the complete development timeline
   - Review entries in `project/devlogs/entries/` for detailed implementation logs
   - Look for items marked with 🔄 (in progress) or ⏱️ (planned) to identify current focus

## Consolidated Documentation Preservation (MANDATORY)

1. **DO NOT DELETE Consolidated Documentation**:
   - `project/project-plan.md` and `project/project-requirements.md` are carefully consolidated reference documents
   - They serve as high-level entry points to the detailed documentation
   - They MUST NEVER be deleted, as documented in the devlog entry from 2025-04-23
   - Their purpose is to improve accessibility and onboarding efficiency while preserving all detailed docs

2. **Limited Modification Rules**:
   - Only update specific sections in these files directly related to changes (status updates, etc.)
   - Never remove or delete sections, especially unimplemented features
   - When updating, follow the Documentation Integrity Guidelines in the files themselves
   - Always preserve the structure, formatting, and organization of these documents
   - Add information incrementally rather than replacing existing content

3. **Documentation Consistency**:
   - When updating detailed docs in project/docs/, also update the corresponding sections in the consolidated files
   - Ensure consistency between consolidated docs and detailed docs
   - Reference relationships must be maintained between these document sets

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

## Deployment and Integration

1. **Deployment Guidelines**:
   - Follow deployment guidelines in `project/docs/guidelines/service-deployment-guide.md`
   - Ensure all environment configurations are properly documented

2. **Third-Party Integrations**:
   - Follow integration guidelines in `project/docs/codebase/project-third-party-integrations.md`
   - Maintain proper documentation for all external service integrations

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

## Documentation Consolidation Strategy

Per the 2025-04-23 devlog entry on "Project Documentation Consolidation," The Story Teller project follows a dual documentation approach:

1. **Consolidated Reference Documents** (`project-plan.md` and `project-requirements.md`):
   - Provide high-level, comprehensive overviews
   - Serve as entry points for new team members and stakeholders
   - Act as integration points for all documentation
   - MUST be preserved and properly maintained

2. **Detailed Documentation** (in `project/docs/` subdirectories):
   - Provides in-depth details for specific aspects
   - Organized by functional area and purpose
   - Contains authoritative implementation details
   - MUST be preserved alongside the consolidated documents

This strategy ensures both accessibility for new team members and depth for implementation, while maintaining the project's documentation integrity guidelines.