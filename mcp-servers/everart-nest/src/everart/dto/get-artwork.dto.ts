import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsEnum, IsNotEmpty, IsBoolean } from 'class-validator';
import { McpRequestDto } from './common.dto';
import { ArtworkType } from './generate-artwork.dto';

export class GetArtworkRequestDto extends McpRequestDto {
  @ApiProperty({
    description: 'ID of the artwork to retrieve',
    example: 'art_123456',
    required: false,
  })
  @IsString()
  @IsOptional()
  artworkId?: string;

  @ApiProperty({
    description: 'Filter by artwork type',
    enum: ArtworkType,
    example: ArtworkType.CHARACTER_PORTRAIT,
    required: false,
  })
  @IsEnum(ArtworkType)
  @IsOptional()
  artworkType?: ArtworkType;

  @ApiProperty({
    description: 'Filter by entity ID',
    example: 'char_123456',
    required: false,
  })
  @IsString()
  @IsOptional()
  entityId?: string;

  @ApiProperty({
    description: 'Filter by style ID',
    example: 'style_123456',
    required: false,
  })
  @IsString()
  @IsOptional()
  styleId?: string;

  @ApiProperty({
    description: 'Filter by tags',
    example: ['portrait', 'sci-fi'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: 'Include archived artworks',
    example: false,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  includeArchived?: boolean;

  @ApiProperty({
    description: 'Filter by favorite status',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isFavorite?: boolean;

  @ApiProperty({
    description: 'Search query for title and description',
    example: 'commander portrait',
    required: false,
  })
  @IsString()
  @IsOptional()
  searchQuery?: string;

  @ApiProperty({
    description: 'Maximum number of results to return',
    example: 10,
    required: false,
    default: 10,
  })
  @IsOptional()
  limit?: number;

  @ApiProperty({
    description: 'Offset for pagination',
    example: 0,
    required: false,
    default: 0,
  })
  @IsOptional()
  offset?: number;
}
