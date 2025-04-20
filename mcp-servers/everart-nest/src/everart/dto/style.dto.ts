import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsArray, IsBoolean, IsNotEmpty, IsEnum } from 'class-validator';
import { McpRequestDto } from './common.dto';

export enum StyleScope {
  PUBLIC = 'public',
  USER = 'user',
  STORY = 'story',
}

export class CreateStyleRequestDto extends McpRequestDto {
  @ApiProperty({
    description: 'Name of the style',
    example: 'Cyberpunk Neo-Tokyo',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Description of the style',
    example: 'A neon-lit cyberpunk aesthetic inspired by Neo-Tokyo with vibrant colors and futuristic technology.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'URL of the preview image',
    example: 'https://example.com/images/cyberpunk-preview.jpg',
  })
  @IsString()
  @IsNotEmpty()
  previewImageUrl: string;

  @ApiProperty({
    description: 'Scope of the style',
    enum: StyleScope,
    example: StyleScope.USER,
    default: StyleScope.USER,
  })
  @IsEnum(StyleScope)
  @IsOptional()
  scope?: StyleScope;

  @ApiProperty({
    description: 'Style parameters',
    example: {
      colorPalette: 'neon',
      lighting: 'dramatic',
      contrast: 'high'
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  parameters?: Record<string, any>;

  @ApiProperty({
    description: 'Tags for the style',
    example: ['cyberpunk', 'neon', 'futuristic'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  tags?: string[];
}

export class GetStylesRequestDto extends McpRequestDto {
  @ApiProperty({
    description: 'ID of the style',
    example: 'style_123456',
    required: false,
  })
  @IsString()
  @IsOptional()
  styleId?: string;

  @ApiProperty({
    description: 'Filter by scope',
    enum: StyleScope,
    example: StyleScope.PUBLIC,
    required: false,
  })
  @IsEnum(StyleScope)
  @IsOptional()
  scope?: StyleScope;

  @ApiProperty({
    description: 'Filter by tags',
    example: ['cyberpunk', 'neon'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: 'Include system styles',
    example: true,
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  includeSystem?: boolean;

  @ApiProperty({
    description: 'Include inactive styles',
    example: false,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  includeInactive?: boolean;

  @ApiProperty({
    description: 'Search query for name and description',
    example: 'cyberpunk',
    required: false,
  })
  @IsString()
  @IsOptional()
  searchQuery?: string;
}

export class UpdateStyleRequestDto extends McpRequestDto {
  @ApiProperty({
    description: 'ID of the style to update',
    example: 'style_123456',
  })
  @IsString()
  @IsNotEmpty()
  styleId: string;

  @ApiProperty({
    description: 'New name for the style',
    example: 'Updated Cyberpunk Neo-Tokyo',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'New description for the style',
    example: 'An updated neon-lit cyberpunk aesthetic.',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'New preview image URL',
    example: 'https://example.com/images/updated-cyberpunk-preview.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  previewImageUrl?: string;

  @ApiProperty({
    description: 'New style parameters',
    example: {
      colorPalette: 'neon',
      lighting: 'dramatic',
      contrast: 'high',
      updated: true
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  parameters?: Record<string, any>;

  @ApiProperty({
    description: 'New tags for the style',
    example: ['cyberpunk', 'neon', 'futuristic', 'updated'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: 'Update active status',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
