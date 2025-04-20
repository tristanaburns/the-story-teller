# Route Parameter Standardization - Generated Plan

## API Routes Migration Tasks

  - [ ] Update parameter references in `app\api\stories\[id]\route.ts`
    - Uses storyId parameter
- [ ] Rename `app\api\stories\[storyId]` to `app\api\stories\[id]`
    - [ ] Update parameter references in `app\api\stories\[storyId]\characters\route.ts`
      - Uses storyId parameter
      - [ ] Update parameter references in `app\api\stories\[storyId]\characters\[id]\route.ts`
        - Uses storyId parameter
    - [ ] Update parameter references in `app\api\stories\[storyId]\content\route.ts`
      - Uses storyId parameter
    - [ ] Update parameter references in `app\api\stories\[storyId]\locations\route.ts`
      - Uses storyId parameter
      - [ ] Update parameter references in `app\api\stories\[storyId]\locations\[id]\route.ts`
        - Uses storyId parameter
    - [ ] Update parameter references in `app\api\stories\[storyId]\route\route.ts`
      - Uses storyId parameter
    - [ ] Update parameter references in `app\api\stories\[storyId]\timeline\route.ts`
      - Uses storyId parameter
      - [ ] Update parameter references in `app\api\stories\[storyId]\timeline\[id]\route.ts`
        - Uses storyId parameter

## Page Routes Migration Tasks

      - [ ] Update parameter references in `app\stories\[id]\characters\new\page.tsx`
        - Uses storyId parameter
    - [ ] Update parameter references in `app\stories\[id]\characters\page.tsx`
      - Uses storyId parameter
      - Uses characterId parameter
    - [ ] Rename `app\stories\[id]\characters\[characterId]` to `app\stories\[id]\characters\[id]`
        - [ ] Update parameter references in `app\stories\[id]\characters\[characterId]\edit\page.tsx`
          - Uses storyId parameter
          - Uses characterId parameter
      - [ ] Update parameter references in `app\stories\[id]\characters\[characterId]\page.tsx`
        - Uses storyId parameter
        - Uses characterId parameter
- [ ] Rename `app\stories\[storyId2]` to `app\stories\[id]`
- [ ] Rename `app\stories\[storyId]` to `app\stories\[id]`
    - [ ] Update parameter references in `app\stories\[storyId]\editor\page.tsx`
      - Uses storyId parameter
  - [ ] Update parameter references in `app\stories\[storyId]\page.tsx`
    - Uses storyId parameter

## Implementation Guidelines

1. Start by renaming all folders first:
   ```bash
   # Example command format for Windows
   Move-Item app/api/stories/[storyId] app/api/stories/[id]
   ```

2. After folder renaming, update parameter references:
   - Change `params: { storyId: string }` to `params: { id: string }`
   - Change `const { storyId } = params` to `const id = params.id`
   - Update variable references from `storyId` to `id` where appropriate
   - Change fetch calls and links to use consistent /stories/[id] structure

3. For handling nested routes, use array indexing for parameters:
   ```typescript
   // Before
   { params }: { params: { storyId: string; characterId: string } }
   
   // After
   { params }: { params: { id: string[] } }
   const [storyId, characterId] = params.id; // Destructure array of IDs
   ```

4. Run the build after each significant change to check for errors:
   ```bash
   npm run build
   ```
