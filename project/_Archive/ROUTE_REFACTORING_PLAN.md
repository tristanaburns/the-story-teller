# Route Parameter Standardization Plan

## Current Issue

The project currently has inconsistent parameter naming in dynamic routes:
- Some routes use `[id]` 
- Others use `[storyId]`

Next.js 15 enforces consistent parameter naming across route segments, which is why our build is failing with:

```
Error: You cannot use different slug names for the same dynamic path ('id' !== 'storyId').
```

## Standardization Plan

### 1. Choose One Parameter Name

We will standardize on `[storyId]` since it's more descriptive and already used in multiple places.

### 2. API Routes to Update

- [x] Copy `app/api/stories/[id]/route.ts` to `app/api/stories/[storyId]/route.ts` (already completed)
- [ ] Update parameter references in:
  - [ ] Update `app/api/stories/[storyId]/characters/[id]/route.ts` to use consistent naming
  - [ ] Update `app/api/stories/[storyId]/locations/[id]/route.ts` to use consistent naming
  - [ ] Update `app/api/stories/[storyId]/timeline/[id]/route.ts` to use consistent naming
  
### 3. Page Routes to Update

- [ ] Copy `app/stories/[id]` content to `app/stories/[storyId]` 
- [ ] Update parameter references in all pages using the route parameter
- [ ] Ensure all links and navigation in the UI are updated to use the correct parameter

### 4. Data Fetching Updates

- [ ] Update all data fetching functions that reference these parameters to use the new standardized name
- [ ] Check for any hardcoded route path references in components or hooks

### 5. Testing Post-Refactoring

- [ ] Test all routes to ensure they work properly
- [ ] Verify all navigation between pages works correctly
- [ ] Test CRUD operations on stories, characters, locations, etc.

### 6. Cleanup

- [ ] Once everything is working, remove the old route files and directories
- [ ] Update the Next.js config to remove temporary workarounds
- [ ] Run ESLint to check for any remaining issues

## Implementation Strategy

This is a high-risk change that affects core routing functionality. To minimize disruption:

1. Create a feature branch for this work
2. Implement changes one route at a time
3. Test thoroughly after each route is migrated
4. Consider implementing the changes during low-traffic periods

## Timeline

This refactoring should be prioritized as it's currently blocking production builds. Estimated work time: 2-4 hours. 