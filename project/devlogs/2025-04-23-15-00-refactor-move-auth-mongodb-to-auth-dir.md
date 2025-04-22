# [Refactor] Move Auth MongoDB Client to Auth Directory

**Date:** 2025-04-23 15:00
**Author:** Development Team

## Changes Made
- Moved `lib/auth-mongodb.ts` to `lib/auth/mongodb.ts` for better organization
- Updated `lib/auth-mongodb.ts` to be a re-export file with deprecation warning
- Updated imports in `lib/auth/options.ts` to use relative path to mongodb.ts
- Updated imports in `lib/auth/index.ts` to use the new path
- Added export of mongodb module in `lib/auth/index.ts` for cleaner imports
- Updated imports in root `auth.ts` file
- Updated project documentation to reflect the new file structure

## Decisions
- **Decision:** Consolidate auth-related code in the auth directory

**Rationale:**
- Improves code organization by grouping related functionality
- Follows the principle of separation of concerns
- Creates a clearer, more logical directory structure
- Makes it easier to find authentication-related code
- All auth-related files are now in a single directory
- Makes future auth module enhancements easier to implement

## Challenges
- Maintaining backward compatibility for existing code
- Ensuring all import statements are properly updated
- Maintaining the global variables for development mode hot reload
- Ensuring the deprecation warnings don't cause console clutter

## Next Steps
- Update unit tests that may directly import from the old path
- Gradually migrate usage of the deprecated file in the codebase
- Consider adding linting rules to discourage direct imports from the old file
- Update any devlogs that might reference the old file location
- Review if other auth-related files could be further consolidated 