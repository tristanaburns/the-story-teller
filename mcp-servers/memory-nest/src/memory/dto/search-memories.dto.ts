import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsOptional, ValidateNested, IsArray, IsObject } from 'class-validator';
import { BaseMCPRequestDto } from './base-mcp-request.dto';

class TimeframeDto {
  @ApiProperty({ description: 'Start time (ISO string or timestamp)', example: '2023-01-01T00:00:00Z', required: false })
  @IsString()
  @IsOptional()
  start?: string;

  @ApiProperty({ description: 'End time (ISO string or timestamp)', example: '2023-01-31T23:59:59Z', required: false })
  @IsString()
  @IsOptional()
  end?: string;
}

class SearchMemoriesPayloadDto {
  @ApiProperty({ description: 'Story ID to filter by', example: 'story123', required: false })
  @IsString()
  @IsOptional()
  storyId?: string;

  @ApiProperty({ description: 'Context ID to filter by', example: 'scene42', required: false })
  @IsString()
  @IsOptional()
  contextId?: string;

  @ApiProperty({ description: 'Search query', example: 'mansion dark', required: false })
  @IsString()
  @IsOptional()
  query?: string;

  @ApiProperty({ description: 'Tags to filter by', example: ['character', 'action'], required: false })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({ type: TimeframeDto, required: false })
  @ValidateNested()
  @Type(() => TimeframeDto)
  @IsOptional()
  timeframe?: TimeframeDto;

  @ApiProperty({ description: 'Additional metadata filters', example: { location: 'mansion' }, required: false })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class SearchMemoriesDto extends BaseMCPRequestDto {
  @ApiProperty({
    description: 'Action for search memories (always "search")',
    example: 'search',
  })
  @IsString()
  @IsNotEmpty()
  action: 'search';

  @ApiProperty({ type: SearchMemoriesPayloadDto })
  @ValidateNested()
  @Type(() => SearchMemoriesPayloadDto)
  payload: SearchMemoriesPayloadDto;
}
