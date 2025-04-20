import { ObjectId } from 'mongodb';

export const storySchema = {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'createdAt', 'updatedAt', 'userId'],
      properties: {
        _id: {
          bsonType: 'objectId',
        },
        title: {
          bsonType: 'string',
          description: 'Title is required and must be a string',
        },
        description: {
          bsonType: 'string',
          description: 'Description must be a string',
        },
        coverImage: {
          bsonType: ['string', 'null'],
          description: 'Cover image URL or null',
        },
        createdAt: {
          bsonType: 'date',
          description: 'Creation date is required',
        },
        updatedAt: {
          bsonType: 'date',
          description: 'Update date is required',
        },
        userId: {
          bsonType: 'string',
          description: 'User ID is required',
        },
        content: {
          bsonType: 'string',
          description: 'Story content must be a string',
        },
        status: {
          enum: ['draft', 'published', 'archived'],
          description: 'Status must be one of: draft, published, archived',
        },
        metadata: {
          bsonType: 'object',
          properties: {
            genre: {
              bsonType: ['string', 'null'],
            },
            setting: {
              bsonType: ['string', 'null'],
            },
            timeline: {
              bsonType: ['string', 'null'],
            },
            tags: {
              bsonType: 'array',
              items: {
                bsonType: 'string',
              },
            },
          },
        },
      },
    },
  },
  validationLevel: 'moderate',
  validationAction: 'error',
};

export const characterSchema = {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'storyId', 'createdAt', 'updatedAt'],
      properties: {
        _id: {
          bsonType: 'objectId',
        },
        id: {
          bsonType: 'string',
          description: 'Internal ID for cross-referencing',
        },
        storyId: {
          bsonType: 'string',
          description: 'Reference to the story this character belongs to',
        },
        name: {
          bsonType: 'string',
          description: 'Character name is required',
        },
        full_name: {
          bsonType: ['string', 'null'],
          description: 'Character full name if different from name',
        },
        type: {
          enum: ['protagonist', 'antagonist', 'supporting', 'minor'],
          description: 'Character type must be one of the defined types',
        },
        status: {
          enum: ['alive', 'deceased', 'unknown'],
          description: 'Character status must be one of the defined statuses',
        },
        description: {
          bsonType: 'string',
          description: 'Character description',
        },
        physical_appearance: {
          bsonType: 'object',
          properties: {
            height: {
              bsonType: ['string', 'null'],
            },
            build: {
              bsonType: ['string', 'null'],
            },
            distinctive_features: {
              bsonType: 'array',
              items: {
                bsonType: 'string',
              },
            },
            typical_attire: {
              bsonType: ['string', 'null'],
            },
          },
        },
        personality: {
          bsonType: 'object',
          properties: {
            traits: {
              bsonType: 'array',
              items: {
                bsonType: 'string',
              },
            },
            values: {
              bsonType: 'array',
              items: {
                bsonType: 'string',
              },
            },
            motivations: {
              bsonType: 'array',
              items: {
                bsonType: 'string',
              },
            },
          },
        },
        background: {
          bsonType: 'object',
          properties: {
            birthplace: {
              bsonType: ['string', 'null'],
            },
            occupation: {
              bsonType: ['string', 'null'],
            },
            significant_events: {
              bsonType: 'array',
              items: {
                bsonType: 'string',
              },
            },
          },
        },
        relationships: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            required: ['character_id', 'relationship_type'],
            properties: {
              character_id: {
                bsonType: 'string',
              },
              relationship_type: {
                bsonType: 'string',
              },
              dynamics: {
                bsonType: 'string',
              },
            },
          },
        },
        story_role: {
          bsonType: 'string',
        },
        createdAt: {
          bsonType: 'date',
          description: 'Creation date is required',
        },
        updatedAt: {
          bsonType: 'date',
          description: 'Update date is required',
        },
      },
    },
  },
  validationLevel: 'moderate',
  validationAction: 'error',
};

export const locationSchema = {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'storyId', 'createdAt', 'updatedAt'],
      properties: {
        _id: {
          bsonType: 'objectId',
        },
        id: {
          bsonType: 'string',
          description: 'Internal ID for cross-referencing',
        },
        storyId: {
          bsonType: 'string',
          description: 'Reference to the story this location belongs to',
        },
        name: {
          bsonType: 'string',
          description: 'Location name is required',
        },
        type: {
          bsonType: 'string',
          description: 'Type of location',
        },
        description: {
          bsonType: 'string',
          description: 'Location description',
        },
        physical_characteristics: {
          bsonType: 'object',
          properties: {
            size: {
              bsonType: ['string', 'null'],
            },
            climate: {
              bsonType: ['string', 'null'],
            },
            notable_features: {
              bsonType: 'array',
              items: {
                bsonType: 'string',
              },
            },
          },
        },
        cultural_aspects: {
          bsonType: 'object',
          properties: {
            inhabitants: {
              bsonType: 'array',
              items: {
                bsonType: 'string',
              },
            },
            customs: {
              bsonType: 'array',
              items: {
                bsonType: 'string',
              },
            },
            history: {
              bsonType: ['string', 'null'],
            },
          },
        },
        related_locations: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            required: ['location_id', 'relationship'],
            properties: {
              location_id: {
                bsonType: 'string',
              },
              relationship: {
                bsonType: 'string',
              },
            },
          },
        },
        appeared_in: {
          bsonType: 'array',
          items: {
            bsonType: 'string',
          },
        },
        createdAt: {
          bsonType: 'date',
          description: 'Creation date is required',
        },
        updatedAt: {
          bsonType: 'date',
          description: 'Update date is required',
        },
      },
    },
  },
  validationLevel: 'moderate',
  validationAction: 'error',
};

export const timelineEventSchema = {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'storyId', 'createdAt', 'updatedAt'],
      properties: {
        _id: {
          bsonType: 'objectId',
        },
        id: {
          bsonType: 'string',
          description: 'Internal ID for cross-referencing',
        },
        storyId: {
          bsonType: 'string',
          description: 'Reference to the story this event belongs to',
        },
        title: {
          bsonType: 'string',
          description: 'Event title is required',
        },
        description: {
          bsonType: 'string',
          description: 'Event description',
        },
        date: {
          bsonType: 'string',
          description: 'Text representation of the date',
        },
        chronology_date: {
          bsonType: ['date', 'null'],
          description: 'Actual date for chronological ordering',
        },
        significance: {
          bsonType: 'string',
          description: 'Significance of the event',
        },
        characters_involved: {
          bsonType: 'array',
          items: {
            bsonType: 'string',
          },
          description: 'Characters involved in the event',
        },
        locations_involved: {
          bsonType: 'array',
          items: {
            bsonType: 'string',
          },
          description: 'Locations involved in the event',
        },
        preceding_events: {
          bsonType: 'array',
          items: {
            bsonType: 'string',
          },
          description: 'Events that precede this one',
        },
        following_events: {
          bsonType: 'array',
          items: {
            bsonType: 'string',
          },
          description: 'Events that follow this one',
        },
        createdAt: {
          bsonType: 'date',
          description: 'Creation date is required',
        },
        updatedAt: {
          bsonType: 'date',
          description: 'Update date is required',
        },
      },
    },
  },
  validationLevel: 'moderate',
  validationAction: 'error',
};

export const metadataSchema = {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'createdAt', 'updatedAt', 'storiesCount'],
      properties: {
        _id: {
          bsonType: 'objectId',
        },
        userId: {
          bsonType: 'string',
          description: 'User ID is required',
        },
        createdAt: {
          bsonType: 'date',
          description: 'Creation date is required',
        },
        updatedAt: {
          bsonType: 'date',
          description: 'Update date is required',
        },
        plan: {
          enum: ['free', 'premium'],
          description: 'User plan must be free or premium',
        },
        storiesCount: {
          bsonType: 'int',
          description: 'Number of stories created by the user',
        },
      },
    },
  },
  validationLevel: 'moderate',
  validationAction: 'error',
};