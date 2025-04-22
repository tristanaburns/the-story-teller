# [fix] Duplicate IDs in Dynamic Routes

**Date:** 2025-04-22 10:00
**Author:** Claude

## Changes Made
- Identified inconsistent path naming convention in the dynamic routes for story-related APIs
- Consolidated all story-related APIs to use the parameter name `[storyId]` consistently instead of mixing `[id]` and `[storyId]`
- Refactored the API routes at:
  - `app/api/stories/[id]/characters/[id]/route.ts` → `app/api/stories/[storyId]/characters/[id]/route.ts`
  - `app/api/stories/[id]/characters/route.ts` → `app/api/stories/[storyId]/characters/route.ts`
  - `app/api/stories/[id]/locations/[id]/route.ts` → `app/api/stories/[storyId]/locations/[id]/route.ts`
  - `app/api/stories/[id]/locations/route.ts` → `app/api/stories/[storyId]/locations/route.ts`
  - `app/api/stories/[id]/events/[id]/route.ts` → `app/api/stories/[storyId]/timeline/[id]/route.ts`
  - `app/api/stories/[id]/events/route.ts` → `app/api/stories/[storyId]/timeline/route.ts`
- Updated parameter type definitions and extraction in route handlers:
  - Old: `{ params }: { params: { id: string[] } }` with extraction via array indices: `params.id[0]`, `params.id[1]`
  - New: `{ params }: { params: { storyId: string; id?: string } }` with direct property access: `params.storyId`, `params.id`
- Updated all corresponding API call references in frontend components (e.g., LocationForm.tsx)
- Added TypeScript type definitions to ensure consistent parameter naming
- Ensured proper cleanup of old routes to prevent duplication

## Decisions
- **Decision:** Standardize on `[storyId]` as the parameter name for story ID in all routes
  **Rationale:** Prevents parameter naming conflicts when multiple dynamic segments exist in the same route (e.g., `[id]/characters/[id]`)

- **Decision:** Use descriptive parameter names rather than generic ones
  **Rationale:** Improves code readability and prevents Next.js route conflicts when multiple dynamic parameters exist in a route

- **Decision:** Keep using `[id]` for sub-resources (characters, locations, events)
  **Rationale:** Maintains a clear distinction between the parent resource ID and the child resource ID

- **Decision:** Rename "events" directory to "timeline" for clarity
  **Rationale:** Better reflects the nature of the endpoint and aligns with frontend terminology

- **Decision:** Change parameter handling from array-based to object-based
  **Rationale:** Provides more explicit and type-safe access to route parameters and eliminates confusion about array indices

## Challenges
- Next.js route parameters with the same name (`[id]`) in the same route path were causing parameter conflicts
- The parameter values were being overwritten, causing incorrect IDs to be used in API calls
- Some routes didn't exist in the structure as originally planned (e.g., events vs. timeline)
- Updating all frontend components to use the correct route parameter format required careful testing
- Some TypeScript types needed updates to reflect the new parameter naming convention
- Ensuring backward compatibility during the transition required temporary route handlers
- Different parameter handling code between old and new routes required careful refactoring

## Next Steps
- Monitor application logs to ensure no routing issues persist
- Update the API documentation to reflect the standardized route parameter naming
- Create a linting rule to enforce consistent parameter naming in route definitions
- Refactor remaining API endpoints to follow the same naming convention
- Update tests to cover the renamed routes
- Consider removing the `/app/api/stories/[id]` directory entirely once all references are updated
- Create TypeScript interfaces for route parameters to ensure consistent typing 