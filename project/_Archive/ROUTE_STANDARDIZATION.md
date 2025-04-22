# Route Parameter Standardization Plan

## Current Issue

The project has inconsistent parameter naming in dynamic routes:
- Some routes use `[id]` (preferred)
- Others use `[storyId]`, `[characterId]`, etc.

Next.js 15 requires consistent parameter naming across route segments. We will standardize all routes to use `[id]` for simplicity and consistency.

## Migration Steps

### API Routes

1. **API Story Routes**
   - ✅ Keep `app/api/stories/[id]/route.ts` as the main story handler
   - ✅ Update parameter references from `storyId` to `id` in this file

2. **Nested API Routes**
   - Create nested routes with consistent naming:
     - `app/api/stories/[id]/characters/route.ts`
       - Update parameter handling to extract from `params.id`
     - `app/api/stories/[id]/characters/[id]/route.ts`
       - Adopt a consistent variable naming: `storyId = params.id[0], characterId = params.id[1]`
     - Apply same pattern to:
       - `app/api/stories/[id]/locations/[id]/route.ts`
       - `app/api/stories/[id]/timeline/[id]/route.ts`
       - `app/api/stories/[id]/content/route.ts`

### Page Routes

1. **Story Pages**
   - Keep `app/stories/[id]/page.tsx`
   - Update parameter references from `storyId` to `id`

2. **Character Pages**
   - Update `app/stories/[id]/characters/page.tsx`
     - Ensure consistent param handling with `params.id`
   - Rename `app/stories/[id]/characters/[characterId]` to `app/stories/[id]/characters/[id]`
   - Update `app/stories/[id]/characters/[id]/page.tsx` 
     - Use consistent variable naming: `storyId = params.id[0], characterId = params.id[1]`
   - Update `app/stories/[id]/characters/[id]/edit/page.tsx`
     - Apply same parameter handling

3. **Location Pages**
   - Apply same standardization to location routes

4. **Editor Pages**
   - Rename `app/stories/[storyId]/editor` to `app/stories/[id]/editor`
   - Update parameter handling in all editor components

### Frontend Components

1. **Update Link Components**
   - Find all `<Link href=...>` components that use `storyId` in paths
   - Update to consistent `id` naming

2. **Update Fetch Calls**
   - Find all `fetch()` calls that reference paths with dynamic segments
   - Ensure they use consistent parameter naming

### Tests (if applicable)

- Update any test files that may be referencing these routes
- Ensure test fixtures use the standardized parameter names

## Implementation Strategy

1. Update Next.js config to bypass build errors (✅ Done)
2. Identify and update all API endpoint parameter handling
3. Update page component parameter handling
4. Standardize folder structure
5. Remove temporary build configuration workarounds

## Post-Migration Verification

After completing the migration:
1. Run the application and test all routes
2. Ensure data fetching works correctly
3. Validate navigation between all pages
4. Remove workarounds in the Next.js configuration 