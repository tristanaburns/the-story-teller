import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsArray, IsBoolean, IsNotEmpty } from 'class-validator';
import { McpRequestDto } from './common.dto';

export class UpdateArtworkRequestDto extends McpRequestDto {
  @ApiProperty({
    description: 'ID of the artwork to update',
    example: 'art_123456',
  })
  @IsString()
  @IsNotEmpty()
  artworkId: string;

  @ApiProperty({
    description: 'New title for the artwork',
    example: 'Updated Commander Shepard Portrait',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'New description for the artwork',
    example: 'An updated portrait of Commander Shepard in N7 armor.',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'New tags for the artwork',
    example: ['portrait', 'sci-fi', 'commander', 'updated'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: 'New metadata for the artwork',
    example: {
      version: 2,
      lastModifiedBy: 'user_123'
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'New related entities',
    example: ['char_123', 'loc_456'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  relatedEntities?: string[];

  @ApiProperty({
    description: 'Update favorite status',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isFavorite?: boolean;

  @ApiProperty({
    description: 'Update archived status',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;
}
