// Route Migration Planning Script
// This script generates a detailed migration plan for standardizing route parameter names

const fs = require('fs');
const path = require('path');

console.log('🔄 Generating route standardization plan...');

// Step 1: Document the existing project structure
const apiRoutesPath = path.join(__dirname, 'app', 'api', 'stories');
const pageRoutesPath = path.join(__dirname, 'app', 'stories');

// Function to scan directories recursively
function scanDirectory(dir, basePath = '') {
  const result = [];
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const relativePath = path.join(basePath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      // Special handling for dynamic route segments
      if (file.startsWith('[') && file.endsWith(']')) {
        if (file !== '[id]') {
          result.push({
            type: 'directory',
            path: relativePath,
            name: file,
            needsMigration: true,
            targetName: '[id]',
            children: scanDirectory(filePath, relativePath)
          });
        } else {
          result.push({
            type: 'directory',
            path: relativePath,
            name: file,
            needsMigration: false,
            children: scanDirectory(filePath, relativePath)
          });
        }
      } else {
        result.push({
          type: 'directory',
          path: relativePath,
          name: file,
          needsMigration: false,
          children: scanDirectory(filePath, relativePath)
        });
      }
    } else {
      // Check if this is a route file
      if (file === 'route.ts' || file === 'page.tsx') {
        // Read file to check for parameter naming
        const content = fs.readFileSync(filePath, 'utf8');
        const hasStoryIdParam = content.includes('storyId:') || content.includes('params.storyId');
        const hasCharacterIdParam = content.includes('characterId:') || content.includes('params.characterId');
        
        result.push({
          type: 'file',
          path: relativePath,
          name: file,
          needsMigration: hasStoryIdParam || hasCharacterIdParam,
          issues: [
            ...(hasStoryIdParam ? ['Uses storyId parameter'] : []),
            ...(hasCharacterIdParam ? ['Uses characterId parameter'] : [])
          ]
        });
      } else {
        result.push({
          type: 'file',
          path: relativePath,
          name: file,
          needsMigration: false
        });
      }
    }
  });
  
  return result;
}

// Scan both API and page routes
console.log('📂 Scanning project structure...');
const apiStructure = scanDirectory(apiRoutesPath, 'app/api/stories');
const pageStructure = scanDirectory(pageRoutesPath, 'app/stories');

// Generate migration plan
console.log('📝 Generating migration plan...');
let migrationPlan = '# Route Parameter Standardization - Generated Plan\n\n';
migrationPlan += '## API Routes Migration Tasks\n\n';

function generateMigrationSteps(structure, depth = 0) {
  let plan = '';
  const indent = '  '.repeat(depth);
  
  structure.forEach(item => {
    if (item.type === 'directory') {
      if (item.needsMigration) {
        plan += `${indent}- [ ] Rename \`${item.path}\` to \`${item.path.replace(item.name, item.targetName)}\`\n`;
      }
      
      if (item.children && item.children.length > 0) {
        plan += generateMigrationSteps(item.children, depth + 1);
      }
    } else if (item.type === 'file' && item.needsMigration) {
      plan += `${indent}- [ ] Update parameter references in \`${item.path}\`\n`;
      item.issues.forEach(issue => {
        plan += `${indent}  - ${issue}\n`;
      });
    }
  });
  
  return plan;
}

migrationPlan += generateMigrationSteps(apiStructure);
migrationPlan += '\n## Page Routes Migration Tasks\n\n';
migrationPlan += generateMigrationSteps(pageStructure);

// Add implementation instructions
migrationPlan += `
## Implementation Guidelines

1. Start by renaming all folders first:
   \`\`\`bash
   # Example command format for Windows
   Move-Item app/api/stories/[storyId] app/api/stories/[id]
   \`\`\`

2. After folder renaming, update parameter references:
   - Change \`params: { storyId: string }\` to \`params: { id: string }\`
   - Change \`const { storyId } = params\` to \`const id = params.id\`
   - Update variable references from \`storyId\` to \`id\` where appropriate
   - Change fetch calls and links to use consistent /stories/[id] structure

3. For handling nested routes, use array indexing for parameters:
   \`\`\`typescript
   // Before
   { params }: { params: { storyId: string; characterId: string } }
   
   // After
   { params }: { params: { id: string[] } }
   const [storyId, characterId] = params.id; // Destructure array of IDs
   \`\`\`

4. Run the build after each significant change to check for errors:
   \`\`\`bash
   npm run build
   \`\`\`
`;

// Write plan to file
fs.writeFileSync('ROUTE_MIGRATION_PLAN.md', migrationPlan);
console.log('✅ Migration plan generated: ROUTE_MIGRATION_PLAN.md'); 