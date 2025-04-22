# The Story Teller: File Naming Conventions

*Last Updated: 2025-04-22*

This document outlines the file naming standards used throughout The Story Teller project. Consistent naming conventions make the codebase more navigable and maintainable.

## General Naming Principles

All file names in The Story Teller project should:

1. **Be Descriptive**: Clearly indicate the file's purpose
2. **Be Concise**: Remain as short as possible while being descriptive
3. **Be Consistent**: Follow established patterns
4. **Use Appropriate Case**: Apply the correct case style for the file type
5. **Avoid Special Characters**: Stick to alphanumeric characters, hyphens, and underscores

## Case Styles

The project uses these case styles for different file types:

| Case Style | Format | Example | Usage |
|------------|--------|---------|-------|
| PascalCase | WordWord | StoryEditor.tsx | React components |
| camelCase | wordWord | useStoryEditor.ts | JavaScript/TypeScript utility files, hooks |
| kebab-case | word-word | story-editor.css | CSS files, documentation, configuration files |
| snake_case | word_word | database_connection.js | Database-related files |

## Component File Naming

React components follow these conventions:

1. **Main Components**: `ComponentName.tsx`
2. **Component Styles**: `ComponentName.module.css`
3. **Component Tests**: `ComponentName.test.tsx`
4. **Component Stories**: `ComponentName.stories.tsx`
5. **Component Utilities**: `ComponentName.utils.ts`
6. **Component Types**: `ComponentName.types.ts`

Examples:
```
StoryEditor.tsx
StoryEditor.module.css
StoryEditor.test.tsx
StoryEditor.stories.tsx
StoryEditor.utils.ts
StoryEditor.types.ts
```

## API Route File Naming

API route files follow these conventions:

1. **Route Handler**: `route.ts`
2. **Route Validation**: `schema.ts`
3. **Route Controller**: `controller.ts`
4. **Route Models**: `model.ts`
5. **Route Types**: `types.ts`

## Hook File Naming

Custom React hooks should:

1. Start with the prefix `use`
2. Describe their purpose
3. Use camelCase

Examples:
```
useStoryData.ts
useFormValidation.ts
useAuthentication.ts
useLocalStorage.ts
```

## Utility File Naming

Utility files should:

1. Describe their functionality clearly
2. Use kebab-case
3. Group related functions in a single file

Examples:
```
date-formatting.ts
string-manipulation.ts
data-validation.ts
file-operations.ts
```

## Test File Naming

Test files should:

1. Match the name of the file being tested
2. Add the `.test` suffix
3. Use the same case as the file being tested

Examples:
```
StoryEditor.test.tsx        # For component tests
date-formatting.test.ts     # For utility tests
auth-service.test.ts        # For service tests
```

## Documentation File Naming

Documentation files should:

1. Use kebab-case
2. Start with a prefix indicating document type
3. Be descriptive of the content

Examples:
```
project-architecture-overview.md
project-structure-directory.md
project-plan-milestones.md
project-status-completed.md
```

## Asset File Naming

Media and asset files should:

1. Use kebab-case
2. Include purpose or location as a prefix
3. Include dimensions for images when appropriate

Examples:
```
logo-primary.svg
icon-dashboard-24x24.png
background-login-page.jpg
animation-loading.gif
```

## Configuration File Naming

Configuration files should:

1. Use kebab-case
2. Clearly indicate their purpose
3. Include environment indicator when applicable

Examples:
```
next.config.js
tailwind.config.js
eslint.config.js
tsconfig.json
env.development.local
```

## Database File Naming

Database-related files should:

1. Use snake_case (to match common database conventions)
2. Indicate the entity they relate to
3. Include their purpose

Examples:
```
user_repository.ts
story_schema.ts
database_migration_20250422.ts
query_builder.ts
```

## Version Control File Naming

Files related to version control should:

1. Use standard naming conventions for the tool
2. Use kebab-case for custom scripts

Examples:
```
.gitignore
.github/workflows/ci-pipeline.yml
scripts/pre-commit-hook.js
```

## File Extension Usage

Use these file extensions consistently:

| Extension | Purpose |
|-----------|---------|
| .tsx | React components with TypeScript |
| .ts | TypeScript files |
| .js | JavaScript files (avoid when possible) |
| .css | Standard CSS files |
| .module.css | CSS Modules |
| .json | JSON data files |
| .md | Markdown documentation |
| .svg | SVG graphics |
| .png, .jpg | Raster images |

## Directory Name Matching

When a file is the main export for a directory, its name should match:

```
/components/StoryEditor/StoryEditor.tsx  # Main component matches directory
/hooks/useAuth/useAuth.ts                # Main hook matches directory
```

## Special Cases

These special cases have specific naming requirements:

1. **Next.js Special Files**:
   - `page.tsx` for routes
   - `layout.tsx` for layouts
   - `loading.tsx` for loading states
   - `error.tsx` for error states
   - `not-found.tsx` for 404 pages

2. **Root Configuration Files**:
   - Follow standard conventions: `.eslintrc.js`, `package.json`, etc.

3. **Generated Files**:
   - Prefix with `generated-` to indicate they shouldn't be edited manually

## Enforcement

These naming conventions are enforced via:

1. **Linting Rules**: ESLint rules check file naming patterns
2. **Code Reviews**: Reviewers verify naming compliance
3. **Documentation**: This reference guide
4. **Project Templates**: Starter templates with correct naming

## Relation to Other Documentation

This naming convention document connects with:

- **Project Structure Directory**: For the overall directory structure
- **Code Organization**: For how files fit into the organizational structure
- **Architecture Documentation**: For how naming conventions support the architecture 