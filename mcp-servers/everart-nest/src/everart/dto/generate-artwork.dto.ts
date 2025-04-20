import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsArray, IsEnum, IsNotEmpty, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { McpRequestDto } from './common.dto';

export enum ArtworkType {
  CHARACTER_PORTRAIT = 'character-portrait',
  LOCATION_VISUALIZATION = 'location-visualization',
  SCENE_ILLUSTRATION = 'scene-illustration',
}

export class EntityReferenceDto {
  @ApiProperty({
    description: 'Entity ID',
    example: 'char_123456',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Entity type',
    example: 'character',
    enum: ['character', 'location', 'scene'],
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    description: 'Entity name',
    example: 'Commander Shepard',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Entity description',
    example: 'A veteran soldier and the main protagonist of the Mass Effect trilogy.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Additional entity metadata',
    example: {
      age: 29,
      height: 'tall',
      hairColor: 'brown',
      features: ['scar on left cheek', 'military posture']
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class GenerateArtworkRequestDto extends McpRequestDto {
  @ApiProperty({
    description: 'Type of artwork to generate',
    enum: ArtworkType,
    example: ArtworkType.CHARACTER_PORTRAIT,
  })
  @IsEnum(ArtworkType)
  artworkType: ArtworkType;

  @ApiProperty({
    description: 'Title for the artwork',
    example: 'Commander Shepard Portrait',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Description or prompt for the artwork',
    example: 'A battle-hardened Commander Shepard in N7 armor, standing confidently with arms crossed.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'ID of the style to use',
    example: 'style_123456',
    required: false,
  })
  @IsString()
  @IsOptional()
  styleId?: string;

  @ApiProperty({
    description: 'Related entities for context',
    type: [EntityReferenceDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EntityReferenceDto)
  @IsOptional()
  entities?: EntityReferenceDto[];

  @ApiProperty({
    description: 'Additional generation parameters',
    example: {
      width: 1024,
      height: 1024,
      seed: 1234,
      negativePrompt: 'blurry, low quality'
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  generationParams?: Record<string, any>;

  @ApiProperty({
    description: 'Tags for the artwork',
    example: ['portrait', 'sci-fi', 'commander'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: 'Whether to save the artwork to the database',
    example: true,
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  saveArtwork?: boolean;
}
