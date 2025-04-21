import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Logger } from '@/lib/logging/logger';

// Create a logger instance
const logger = new Logger('api:docs');

// OpenAPI specification for The Story Teller API
const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'The Story Teller API',
    description: 'API for The Story Teller application, providing access to stories, characters, locations, and more.',
    version: '1.0.0',
    contact: {
      name: 'The Story Teller Team',
      url: 'https://thestoryteller.vercel.app'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'https://thestoryteller.vercel.app/api',
      description: 'Production server'
    },
    {
      url: 'http://localhost:3000/api',
      description: 'Local development server'
    }
  ],
  tags: [
    {
      name: 'stories',
      description: 'Operations related to stories'
    },
    {
      name: 'characters',
      description: 'Operations related to characters within stories'
    },
    {
      name: 'locations',
      description: 'Operations related to locations within stories'
    },
    {
      name: 'timeline',
      description: 'Operations related to timeline events'
    },
    {
      name: 'ai',
      description: 'AI-assisted content generation'
    },
    {
      name: 'settings',
      description: 'User settings management'
    },
    {
      name: 'mcp',
      description: 'MCP server integration'
    }
  ],
  paths: {
    '/api/stories': {
      get: {
        summary: 'Get all stories',
        description: 'Retrieves all stories for the authenticated user',
        tags: ['stories'],
        security: [{ session: [] }],
        parameters: [
          {
            name: 'limit',
            in: 'query',
            description: 'Maximum number of stories to return',
            schema: { type: 'integer', default: 10 }
          },
          {
            name: 'offset',
            in: 'query',
            description: 'Number of stories to skip',
            schema: { type: 'integer', default: 0 }
          },
          {
            name: 'sort',
            in: 'query',
            description: 'Sort field',
            schema: { type: 'string', enum: ['title', 'createdAt', 'updatedAt'], default: 'updatedAt' }
          },
          {
            name: 'order',
            in: 'query',
            description: 'Sort order',
            schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
          }
        ],
        responses: {
          '200': {
            description: 'A list of stories',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    stories: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Story'
                      }
                    },
                    total: {
                      type: 'integer',
                      description: 'Total number of stories'
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create a new story',
        description: 'Creates a new story for the authenticated user',
        tags: ['stories'],
        security: [{ session: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/StoryCreate'
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Story created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Story'
                }
              }
            }
          },
          '400': {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/stories/{id}': {
      get: {
        summary: 'Get a story by ID',
        description: 'Retrieves a specific story by its ID',
        tags: ['stories'],
        security: [{ session: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID of the story to retrieve',
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Story found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Story'
                }
              }
            }
          },
          '404': {
            description: 'Story not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      },
      put: {
        summary: 'Update a story',
        description: 'Updates an existing story',
        tags: ['stories'],
        security: [{ session: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID of the story to update',
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/StoryUpdate'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Story updated successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Story'
                }
              }
            }
          },
          '400': {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '404': {
            description: 'Story not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      },
      delete: {
        summary: 'Delete a story',
        description: 'Deletes an existing story and all its related data',
        tags: ['stories'],
        security: [{ session: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID of the story to delete',
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Story deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' }
                  }
                }
              }
            }
          },
          '404': {
            description: 'Story not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/stories/{storyId}/characters': {
      get: {
        summary: 'Get all characters for a story',
        description: 'Retrieves all characters for a specific story',
        tags: ['characters'],
        security: [{ session: [] }],
        parameters: [
          {
            name: 'storyId',
            in: 'path',
            required: true,
            description: 'ID of the story',
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'A list of characters',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Character'
                  }
                }
              }
            }
          },
          '404': {
            description: 'Story not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create a new character',
        description: 'Creates a new character for a specific story',
        tags: ['characters'],
        security: [{ session: [] }],
        parameters: [
          {
            name: 'storyId',
            in: 'path',
            required: true,
            description: 'ID of the story',
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CharacterCreate'
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Character created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Character'
                }
              }
            }
          },
          '400': {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '404': {
            description: 'Story not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/settings': {
      get: {
        summary: 'Get user settings',
        description: 'Retrieves the settings for the authenticated user',
        tags: ['settings'],
        security: [{ session: [] }],
        responses: {
          '200': {
            description: 'User settings',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UserSettings'
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      },
      put: {
        summary: 'Update user settings',
        description: 'Updates the settings for the authenticated user',
        tags: ['settings'],
        security: [{ session: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UserSettingsUpdate'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Settings updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/ai': {
      post: {
        summary: 'Generate AI content',
        description: 'Generates content using AI based on provided parameters',
        tags: ['ai'],
        security: [{ session: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  prompt: {
                    type: 'string',
                    description: 'The prompt for content generation'
                  },
                  type: {
                    type: 'string',
                    enum: ['character', 'location', 'event', 'plotIdea', 'description'],
                    description: 'The type of content to generate'
                  },
                  context: {
                    type: 'object',
                    description: 'Additional context for the generation'
                  }
                },
                required: ['prompt', 'type']
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Generated content',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    content: {
                      type: 'string',
                      description: 'The generated content'
                    },
                    metadata: {
                      type: 'object',
                      description: 'Additional metadata about the generation'
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/mcp/memory': {
      post: {
        summary: 'Create or retrieve memories',
        description: 'Interacts with the Memory MCP server to store or retrieve information',
        tags: ['mcp'],
        security: [{ session: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  operation: {
                    type: 'string',
                    enum: ['store', 'retrieve', 'search', 'consolidate'],
                    description: 'The operation to perform'
                  },
                  storyId: {
                    type: 'string',
                    description: 'The ID of the story'
                  },
                  data: {
                    type: 'object',
                    description: 'The data required for the operation'
                  }
                },
                required: ['operation', 'storyId']
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Operation completed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'object' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Story: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Unique identifier for the story'
          },
          title: {
            type: 'string',
            description: 'Title of the story'
          },
          description: {
            type: 'string',
            description: 'Description of the story'
          },
          genre: {
            type: 'string',
            description: 'Genre of the story'
          },
          tags: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Tags associated with the story'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp'
          },
          userId: {
            type: 'string',
            description: 'ID of the user who owns the story'
          },
          status: {
            type: 'string',
            enum: ['draft', 'in-progress', 'completed', 'published'],
            description: 'Status of the story'
          }
        }
      },
      StoryCreate: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Title of the story'
          },
          description: {
            type: 'string',
            description: 'Description of the story'
          },
          genre: {
            type: 'string',
            description: 'Genre of the story'
          },
          tags: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Tags associated with the story'
          }
        },
        required: ['title']
      },
      StoryUpdate: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Title of the story'
          },
          description: {
            type: 'string',
            description: 'Description of the story'
          },
          genre: {
            type: 'string',
            description: 'Genre of the story'
          },
          tags: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Tags associated with the story'
          },
          status: {
            type: 'string',
            enum: ['draft', 'in-progress', 'completed', 'published'],
            description: 'Status of the story'
          }
        }
      },
      Character: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Unique identifier for the character'
          },
          name: {
            type: 'string',
            description: 'Name of the character'
          },
          storyId: {
            type: 'string',
            description: 'ID of the story the character belongs to'
          },
          description: {
            type: 'string',
            description: 'Description of the character'
          },
          background: {
            type: 'string',
            description: 'Background story of the character'
          },
          attributes: {
            type: 'object',
            properties: {
              role: {
                type: 'string',
                description: 'Role of the character in the story'
              },
              age: {
                type: 'number',
                description: 'Age of the character'
              },
              gender: {
                type: 'string',
                description: 'Gender of the character'
              }
            }
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp'
          }
        }
      },
      CharacterCreate: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Name of the character'
          },
          description: {
            type: 'string',
            description: 'Description of the character'
          },
          background: {
            type: 'string',
            description: 'Background story of the character'
          },
          attributes: {
            type: 'object',
            properties: {
              role: {
                type: 'string',
                description: 'Role of the character in the story'
              },
              age: {
                type: 'number',
                description: 'Age of the character'
              },
              gender: {
                type: 'string',
                description: 'Gender of the character'
              }
            }
          }
        },
        required: ['name']
      },
      UserSettings: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            description: 'ID of the user'
          },
          displayName: {
            type: 'string',
            description: 'Display name of the user'
          },
          email: {
            type: 'string',
            description: 'Email of the user'
          },
          theme: {
            type: 'string',
            enum: ['light', 'dark', 'system'],
            description: 'Theme preference'
          },
          editorFontSize: {
            type: 'number',
            description: 'Font size for the editor'
          },
          enableAIFeatures: {
            type: 'boolean',
            description: 'Whether AI features are enabled'
          },
          enableEmailNotifications: {
            type: 'boolean',
            description: 'Whether email notifications are enabled'
          },
          logLevel: {
            type: 'string',
            enum: ['error', 'warn', 'info', 'debug'],
            description: 'Log level preference'
          },
          mcpServers: {
            type: 'object',
            properties: {
              memory: {
                type: 'boolean',
                description: 'Whether the memory MCP server is enabled'
              },
              art: {
                type: 'boolean',
                description: 'Whether the art MCP server is enabled'
              },
              thinking: {
                type: 'boolean',
                description: 'Whether the thinking MCP server is enabled'
              },
              database: {
                type: 'boolean',
                description: 'Whether the database MCP server is enabled'
              }
            }
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp'
          }
        }
      },
      UserSettingsUpdate: {
        type: 'object',
        properties: {
          displayName: {
            type: 'string',
            description: 'Display name of the user'
          },
          theme: {
            type: 'string',
            enum: ['light', 'dark', 'system'],
            description: 'Theme preference'
          },
          editorFontSize: {
            type: 'number',
            description: 'Font size for the editor'
          },
          enableAIFeatures: {
            type: 'boolean',
            description: 'Whether AI features are enabled'
          },
          enableEmailNotifications: {
            type: 'boolean',
            description: 'Whether email notifications are enabled'
          },
          logLevel: {
            type: 'string',
            enum: ['error', 'warn', 'info', 'debug'],
            description: 'Log level preference'
          },
          mcpServers: {
            type: 'object',
            properties: {
              memory: {
                type: 'boolean',
                description: 'Whether the memory MCP server is enabled'
              },
              art: {
                type: 'boolean',
                description: 'Whether the art MCP server is enabled'
              },
              thinking: {
                type: 'boolean',
                description: 'Whether the thinking MCP server is enabled'
              },
              database: {
                type: 'boolean',
                description: 'Whether the database MCP server is enabled'
              }
            }
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message'
          },
          details: {
            type: 'object',
            description: 'Additional error details'
          }
        }
      }
    },
    securitySchemes: {
      session: {
        type: 'apiKey',
        name: 'session',
        in: 'cookie',
        description: 'NextAuth.js session cookie'
      }
    }
  }
};

export async function GET(req: NextRequest) {
  try {
    // Only show API docs to authenticated users in production
    if (process.env.NODE_ENV === 'production') {
      const session = await getServerSession(authOptions);
      
      if (!session?.user) {
        logger.warn('Unauthorized API docs access attempt', { 
          path: req.nextUrl.pathname,
          method: 'GET' 
        });
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      logger.info('API docs accessed', { 
        userId: session.user.email, 
        path: req.nextUrl.pathname 
      });
    } else {
      logger.debug('API docs accessed in development mode');
    }
    
    return NextResponse.json(openApiSpec);
  } catch (error) {
    logger.error('Error serving API docs', { error });
    return NextResponse.json(
      { error: 'Failed to serve API documentation' },
      { status: 500 }
    );
  }
}
