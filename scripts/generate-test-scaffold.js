/**
 * Script to generate test scaffolding for files
 * 
 * This script analyzes a TypeScript/JavaScript file and generates
 * a test scaffold with test cases for each exported function or component.
 * 
 * Usage: node scripts/generate-test-scaffold.js <file-path> [output-path]
 * If output-path is not provided, it will output to the console.
 */

const fs = require('fs');
const path = require('path');
const ts = require('typescript');

// Get file path from command line arguments
const filePath = process.argv[2];
if (!filePath) {
  console.error('Please provide a file path.');
  process.exit(1);
}

// Get optional output path
const outputPath = process.argv[3];

// Determine the test file path based on the source file path
function getTestFilePath(srcPath) {
  const parsed = path.parse(srcPath);
  const relativePath = path.relative(process.cwd(), srcPath);
  const dirName = parsed.dir.split(path.sep).pop();
  
  // Handle component files
  if (relativePath.includes('components')) {
    return path.join('__tests__', 'components', `${parsed.name}.test.tsx`);
  }
  
  // Handle lib files
  if (relativePath.includes('lib')) {
    const libPath = relativePath.split('lib' + path.sep)[1];
    return path.join('__tests__', 'lib', libPath.replace(parsed.name + parsed.ext, `${parsed.name}.test.ts`));
  }
  
  // Handle API routes
  if (relativePath.includes('app/api')) {
    const apiPath = relativePath.split('app/api/')[1];
    return path.join('__tests__', 'api', apiPath.replace(parsed.name + parsed.ext, `${parsed.name}.test.ts`));
  }
  
  // Default case
  return path.join('__tests__', `${parsed.name}.test.ts`);
}

// Read the file content
try {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  
  // Parse the TypeScript file
  const sourceFile = ts.createSourceFile(
    filePath,
    fileContent,
    ts.ScriptTarget.Latest,
    true
  );
  
  // Extract exported functions, classes, and components
  const exports = [];
  const imports = [];
  let isReactComponent = false;
  
  function visit(node) {
    // Check for React imports
    if (ts.isImportDeclaration(node)) {
      const importPath = node.moduleSpecifier.text;
      if (importPath === 'react' || importPath.startsWith('react-')) {
        isReactComponent = true;
      }
      
      // Collect imports
      const importText = node.getText(sourceFile);
      imports.push(importText);
    }
    
    // Check for exports
    if (ts.isExportDeclaration(node) || 
        (ts.isVariableStatement(node) && node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) ||
        (ts.isFunctionDeclaration(node) && node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) ||
        (ts.isClassDeclaration(node) && node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)))
    {
      // Get the name of the exported item
      let name;
      
      if (ts.isExportDeclaration(node) && node.exportClause) {
        if (ts.isNamedExports(node.exportClause)) {
          node.exportClause.elements.forEach(element => {
            exports.push({
              name: element.name.text,
              kind: 'unknown',
              node: node
            });
          });
        }
      } else if (ts.isVariableStatement(node)) {
        node.declarationList.declarations.forEach(declaration => {
          if (ts.isIdentifier(declaration.name)) {
            exports.push({
              name: declaration.name.text,
              kind: ts.isFunctionExpression(declaration.initializer) || 
                    ts.isArrowFunction(declaration.initializer) ? 'function' : 'variable',
              node: declaration
            });
          }
        });
      } else if (ts.isFunctionDeclaration(node) && node.name) {
        exports.push({
          name: node.name.text,
          kind: 'function',
          node: node
        });
      } else if (ts.isClassDeclaration(node) && node.name) {
        exports.push({
          name: node.name.text,
          kind: 'class',
          node: node
        });
      }
    }
    
    // Visit children
    ts.forEachChild(node, visit);
  }
  
  // Start visiting nodes
  visit(sourceFile);
  
  // Determine if this is a React component file
  const isReactComponentFile = isReactComponent || exports.some(exp => 
    exp.name.match(/^[A-Z]/) && // Component names start with capital letters
    exp.kind !== 'class' // Not a utility class
  );
  
  // Generate test file content
  let testContent = '';
  
  // Add imports
  const isTSX = isReactComponentFile || filePath.endsWith('.tsx');
  
  if (isTSX) {
    testContent += `/**
 * ${path.basename(filePath)} Tests
 *
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
`;
  } else {
    testContent += `/**
 * ${path.basename(filePath)} Tests
 *
 * @jest-environment node
 */

`;
  }
  
  // Import the module under test
  const modulePath = path.relative(
    path.dirname(getTestFilePath(filePath)), 
    filePath
  ).replace(/\\/g, '/').replace(/\.(ts|tsx)$/, '');
  
  if (exports.length > 0) {
    testContent += `import { ${exports.map(e => e.name).join(', ')} } from '${modulePath.startsWith('.') ? modulePath : './' + modulePath}';\n`;
  } else {
    testContent += `import * as moduleUnderTest from '${modulePath.startsWith('.') ? modulePath : './' + modulePath}';\n`;
  }
  
  testContent += '\n';
  
  // Add mocks
  if (imports.length > 0) {
    testContent += '// Add mocks for dependencies\n';
    imports.forEach(importStmt => {
      const match = importStmt.match(/from\s+['"]([^'"]+)['"]/);
      if (match && !match[1].startsWith('.')) {
        testContent += `jest.mock('${match[1]}');\n`;
      }
    });
    testContent += '\n';
  }
  
  // Generate test cases for each export
  exports.forEach(exp => {
    const isComponent = isReactComponentFile && exp.name.match(/^[A-Z]/);
    
    if (isComponent) {
      testContent += `describe('${exp.name}', () => {
  it('should render successfully', () => {
    // Arrange
    render(<${exp.name} />);
    
    // Assert
    expect(screen.getByTestId('${exp.name.toLowerCase()}')).toBeInTheDocument();
  });
  
  it('should handle user interactions', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<${exp.name} />);
    
    // Act
    // TODO: Add interactions with the component
    
    // Assert
    // TODO: Add assertions
  });
});\n\n`;
    } else if (exp.kind === 'function') {
      testContent += `describe('${exp.name}', () => {
  it('should work correctly', () => {
    // Arrange
    // TODO: Set up test data
    
    // Act
    const result = ${exp.name}(/* TODO: Add parameters */);
    
    // Assert
    // TODO: Add assertions
    expect(result).toBeDefined();
  });
  
  it('should handle edge cases', () => {
    // TODO: Test edge cases
  });
  
  it('should handle errors', () => {
    // TODO: Test error scenarios
  });
});\n\n`;
    } else if (exp.kind === 'class') {
      testContent += `describe('${exp.name}', () => {
  let instance;
  
  beforeEach(() => {
    instance = new ${exp.name}(/* TODO: Add constructor parameters */);
  });
  
  it('should initialize correctly', () => {
    // Assert
    expect(instance).toBeInstanceOf(${exp.name});
  });
  
  // TODO: Add tests for class methods
});\n\n`;
    } else {
      testContent += `describe('${exp.name}', () => {
  it('should be defined correctly', () => {
    // Assert
    expect(${exp.name}).toBeDefined();
  });
});\n\n`;
    }
  });
  
  // If no exports, test the module as a whole
  if (exports.length === 0) {
    testContent += `describe('${path.basename(filePath, path.extname(filePath))}', () => {
  it('should work correctly', () => {
    // TODO: Add test implementation
    expect(moduleUnderTest).toBeDefined();
  });
});\n`;
  }
  
  // Output or save the test file
  if (outputPath) {
    // Ensure the directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write the test file
    fs.writeFileSync(outputPath, testContent);
    console.log(`Test scaffold written to ${outputPath}`);
  } else {
    // Get default output path
    const defaultOutputPath = getTestFilePath(filePath);
    
    // Ensure the directory exists
    const outputDir = path.dirname(defaultOutputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write the test file
    fs.writeFileSync(defaultOutputPath, testContent);
    console.log(`Test scaffold written to ${defaultOutputPath}`);
  }
  
} catch (error) {
  console.error('Error generating test scaffold:', error);
  process.exit(1);
}
