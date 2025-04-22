/**
 * @file schema-registry-usage.js
 * @description Example demonstrating how to use the SchemaRegistry
 */

const { SchemaRegistry } = require('../lib/schemas/schema-registry');
const path = require('path');
const fs = require('fs');

// Set up a logger
const logger = {
  debug: (message) => console.log(`[DEBUG] ${message}`),
  info: (message) => console.log(`[INFO] ${message}`),
  warn: (message) => console.log(`[WARN] ${message}`),
  error: (message) => console.log(`[ERROR] ${message}`)
};

// Create the schema registry instance
const registry = new SchemaRegistry({
  logger,
  autoLoadSchemas: true,
  schemasDir: path.join(__dirname, '../lib/schemas/examples'),
  schemaFileExtension: '.schema.json'
});

// Example 1: Validate data against a schema
function validateCharacterExample() {
  // Valid character data
  const validCharacter = {
    id: "12345678-1234-1234-1234-123456789012",
    name: "John Doe",
    age: 30,
    gender: "male",
    occupation: "Detective",
    biography: "A brilliant detective with a dark past.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Invalid character data (missing required name field)
  const invalidCharacter = {
    id: "12345678-1234-1234-1234-123456789012",
    age: 30,
    gender: "male",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Validate the valid character
  const validResult = registry.validate('https://storyteller.app/schemas/character', validCharacter);
  console.log('\nValidating valid character:');
  console.log('Valid:', validResult.valid);
  if (!validResult.valid && validResult.errors) {
    console.log('Errors:', validResult.errors);
  }

  // Validate the invalid character
  const invalidResult = registry.validate('https://storyteller.app/schemas/character', invalidCharacter);
  console.log('\nValidating invalid character (missing name):');
  console.log('Valid:', invalidResult.valid);
  if (!invalidResult.valid && invalidResult.errors) {
    console.log('Errors:', invalidResult.errors);
  }
}

// Example 2: Working with schema metadata
function schemaMetadataExample() {
  // Get all schema IDs
  const schemaIds = registry.getSchemaIds();
  console.log('\nAvailable schema IDs:');
  schemaIds.forEach(id => console.log(`- ${id}`));

  // Get information about a specific schema
  const characterSchemaInfo = registry.getSchemaInfo('https://storyteller.app/schemas/character');
  console.log('\nCharacter Schema Info:');
  console.log(JSON.stringify(characterSchemaInfo, null, 2));

  // Get all schemas
  const allSchemas = registry.getAllSchemas();
  console.log('\nTotal number of registered schemas:', Object.keys(allSchemas).length);
}

// Example 3: Manually registering a schema
function manualRegistrationExample() {
  // Define a simple schema for a book
  const bookSchema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "https://storyteller.app/schemas/book",
    "title": "Book",
    "description": "A book containing stories",
    "type": "object",
    "required": ["id", "title"],
    "properties": {
      "id": {
        "type": "string",
        "description": "Unique identifier for the book"
      },
      "title": {
        "type": "string",
        "description": "Book title"
      },
      "author": {
        "type": "string",
        "description": "Book author"
      },
      "publishedDate": {
        "type": "string",
        "format": "date",
        "description": "Publication date"
      }
    }
  };

  // Register the schema manually
  registry.registerSchema(bookSchema, 'memory-schema');
  console.log('\nManually registered book schema');
  
  // Validate a book using the manually registered schema
  const book = {
    id: "book-001",
    title: "The Adventures of Sherlock Holmes",
    author: "Arthur Conan Doyle",
    publishedDate: "1892-10-14"
  };
  
  const validationResult = registry.validate('https://storyteller.app/schemas/book', book);
  console.log('\nValidating book:');
  console.log('Valid:', validationResult.valid);
  if (!validationResult.valid && validationResult.errors) {
    console.log('Errors:', validationResult.errors);
  }
}

// Example 4: Unregistering a schema
function unregisteringExample() {
  console.log('\nUnregistering book schema');
  registry.unregisterSchema('https://storyteller.app/schemas/book');
  
  // Verify that the schema has been unregistered
  console.log('Book schema is still registered:', registry.hasSchema('https://storyteller.app/schemas/book'));
  
  // Try to get schema that is no longer registered
  try {
    const schemaInfo = registry.getSchemaInfo('https://storyteller.app/schemas/book');
    console.log('Schema info:', schemaInfo);
  } catch (error) {
    console.log('Error retrieving schema (expected):', error.message);
  }
}

// Run all examples
console.log('SCHEMA REGISTRY USAGE EXAMPLES');
console.log('==============================');

// Wait for schemas to load
setTimeout(() => {
  validateCharacterExample();
  schemaMetadataExample();
  manualRegistrationExample();
  unregisteringExample();
}, 500);

// Example output of available schemas for debugging
console.log('\nInitial loading of schemas...'); 