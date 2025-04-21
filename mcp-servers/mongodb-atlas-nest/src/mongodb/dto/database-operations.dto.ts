import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsObject, IsOptional, IsArray, IsNumber, IsBoolean } from 'class-validator';
import { BaseMCPRequestDto } from './base-mcp.dto';

// Query Operation DTOs
export class QueryPayloadDto {
  @ApiProperty({
    description: 'The name of the database to query',
    example: 'storydb',
  })
  @IsString()
  @IsNotEmpty()
  databaseName: string;

  @ApiProperty({
    description: 'The name of the collection to query',
    example: 'characters',
  })
  @IsString()
  @IsNotEmpty()
  collectionName: string;

  @ApiProperty({
    description: 'The query filter object',
    example: { name: { $regex: 'John', $options: 'i' } },
  })
  @IsObject()
  filter: Record<string, any>;

  @ApiProperty({
    description: 'The projection object specifying which fields to include or exclude',
    example: { name: 1, description: 1, _id: 0 },
    required: false,
  })
  @IsObject()
  @IsOptional()
  projection?: Record<string, any>;

  @ApiProperty({
    description: 'The sort order',
    example: { createdAt: -1 },
    required: false,
  })
  @IsObject()
  @IsOptional()
  sort?: Record<string, any>;

  @ApiProperty({
    description: 'The number of documents to skip',
    example: 0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  skip?: number;

  @ApiProperty({
    description: 'The maximum number of documents to return',
    example: 10,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  limit?: number;
}

export class QueryRequestDto extends BaseMCPRequestDto {
  @ApiProperty({
    description: 'The query operation payload',
    type: QueryPayloadDto,
  })
  payload: QueryPayloadDto;
}

// Create Operation DTOs
export class CreatePayloadDto {
  @ApiProperty({
    description: 'The name of the database',
    example: 'storydb',
  })
  @IsString()
  @IsNotEmpty()
  databaseName: string;

  @ApiProperty({
    description: 'The name of the collection',
    example: 'characters',
  })
  @IsString()
  @IsNotEmpty()
  collectionName: string;

  @ApiProperty({
    description: 'The document(s) to insert',
    type: [Object],
    example: [{ name: 'John Doe', age: 30 }],
  })
  @IsArray()
  documents: Record<string, any>[];

  @ApiProperty({
    description: 'Whether to validate documents against schema',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  validateSchema?: boolean;
}

export class CreateRequestDto extends BaseMCPRequestDto {
  @ApiProperty({
    description: 'The create operation payload',
    type: CreatePayloadDto,
  })
  payload: CreatePayloadDto;
}

// Update Operation DTOs
export class UpdatePayloadDto {
  @ApiProperty({
    description: 'The name of the database',
    example: 'storydb',
  })
  @IsString()
  @IsNotEmpty()
  databaseName: string;

  @ApiProperty({
    description: 'The name of the collection',
    example: 'characters',
  })
  @IsString()
  @IsNotEmpty()
  collectionName: string;

  @ApiProperty({
    description: 'The filter to find documents to update',
    example: { _id: '507f1f77bcf86cd799439011' },
  })
  @IsObject()
  filter: Record<string, any>;

  @ApiProperty({
    description: 'The update operations to apply',
    example: { $set: { name: 'Jane Doe' } },
  })
  @IsObject()
  update: Record<string, any>;

  @ApiProperty({
    description: 'Whether to update multiple documents',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  multi?: boolean;

  @ApiProperty({
    description: 'Whether to upsert (create if not exists)',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  upsert?: boolean;

  @ApiProperty({
    description: 'Whether to validate update against schema',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  validateSchema?: boolean;
}

export class UpdateRequestDto extends BaseMCPRequestDto {
  @ApiProperty({
    description: 'The update operation payload',
    type: UpdatePayloadDto,
  })
  payload: UpdatePayloadDto;
}

// Delete Operation DTOs
export class DeletePayloadDto {
  @ApiProperty({
    description: 'The name of the database',
    example: 'storydb',
  })
  @IsString()
  @IsNotEmpty()
  databaseName: string;

  @ApiProperty({
    description: 'The name of the collection',
    example: 'characters',
  })
  @IsString()
  @IsNotEmpty()
  collectionName: string;

  @ApiProperty({
    description: 'The filter to find documents to delete',
    example: { _id: '507f1f77bcf86cd799439011' },
  })
  @IsObject()
  filter: Record<string, any>;

  @ApiProperty({
    description: 'Whether to delete multiple documents',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  multi?: boolean;
}

export class DeleteRequestDto extends BaseMCPRequestDto {
  @ApiProperty({
    description: 'The delete operation payload',
    type: DeletePayloadDto,
  })
  payload: DeletePayloadDto;
}

// Schema Operation DTOs
export class SchemaPayloadDto {
  @ApiProperty({
    description: 'The name of the database',
    example: 'storydb',
  })
  @IsString()
  @IsNotEmpty()
  databaseName: string;

  @ApiProperty({
    description: 'The name of the collection',
    example: 'characters',
  })
  @IsString()
  @IsNotEmpty()
  collectionName: string;

  @ApiProperty({
    description: 'The schema definition',
    example: {
      title: 'Character',
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      }
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  schema?: Record<string, any>;

  @ApiProperty({
    description: 'Whether to retrieve the schema only (GET)',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  getSchema?: boolean;

  @ApiProperty({
    description: 'Whether this is a draft schema',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isDraft?: boolean;

  @ApiProperty({
    description: 'Description of the schema',
    example: 'Character schema with name and age',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class SchemaRequestDto extends BaseMCPRequestDto {
  @ApiProperty({
    description: 'The schema operation payload',
    type: SchemaPayloadDto,
  })
  payload: SchemaPayloadDto;
}

// Search Operation DTOs
export class SearchPayloadDto {
  @ApiProperty({
    description: 'The name of the database',
    example: 'storydb',
  })
  @IsString()
  @IsNotEmpty()
  databaseName: string;

  @ApiProperty({
    description: 'The name of the collection',
    example: 'characters',
  })
  @IsString()
  @IsNotEmpty()
  collectionName: string;

  @ApiProperty({
    description: 'The text to search for',
    example: 'John hero',
  })
  @IsString()
  @IsNotEmpty()
  searchText: string;

  @ApiProperty({
    description: 'The fields to search in',
    example: ['name', 'description'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  fields?: string[];

  @ApiProperty({
    description: 'The projection object specifying which fields to include or exclude',
    example: { name: 1, description: 1, _id: 0 },
    required: false,
  })
  @IsObject()
  @IsOptional()
  projection?: Record<string, any>;

  @ApiProperty({
    description: 'The sort order',
    example: { score: { $meta: 'textScore' } },
    required: false,
  })
  @IsObject()
  @IsOptional()
  sort?: Record<string, any>;

  @ApiProperty({
    description: 'The number of documents to skip',
    example: 0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  skip?: number;

  @ApiProperty({
    description: 'The maximum number of documents to return',
    example: 10,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  limit?: number;
}

export class SearchRequestDto extends BaseMCPRequestDto {
  @ApiProperty({
    description: 'The search operation payload',
    type: SearchPayloadDto,
  })
  payload: SearchPayloadDto;
}

// Execute Operation DTOs
export class ExecutePayloadDto {
  @ApiProperty({
    description: 'The name of the database',
    example: 'storydb',
  })
  @IsString()
  @IsNotEmpty()
  databaseName: string;

  @ApiProperty({
    description: 'The aggregation pipeline to execute',
    type: [Object],
    example: [
      { $match: { status: 'published' } },
      { $group: { _id: '$author', count: { $sum: 1 } } }
    ],
  })
  @IsArray()
  pipeline: Record<string, any>[];

  @ApiProperty({
    description: 'The name of the collection to execute pipeline on',
    example: 'stories',
  })
  @IsString()
  @IsNotEmpty()
  collectionName: string;

  @ApiProperty({
    description: 'Aggregation options',
    example: { allowDiskUse: true },
    required: false,
  })
  @IsObject()
  @IsOptional()
  options?: Record<string, any>;
}

export class ExecuteRequestDto extends BaseMCPRequestDto {
  @ApiProperty({
    description: 'The execute operation payload',
    type: ExecutePayloadDto,
  })
  payload: ExecutePayloadDto;
}

// Export all DTOs
export const AllDtos = {
  QueryRequestDto,
  CreateRequestDto,
  UpdateRequestDto,
  DeleteRequestDto,
  SchemaRequestDto,
  SearchRequestDto,
  ExecuteRequestDto,
};
