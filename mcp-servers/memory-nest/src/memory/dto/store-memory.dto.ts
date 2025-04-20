import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, ValidateNested, IsObject } from 'class-validator';
import { BaseMCPRequestDto } from './base-mcp-request.dto';

class StoreMemoryPayloadDto {
  @ApiProperty({ description: 'Memory content', example: 'The character entered the dark room cautiously.' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'Memory importance (1-10)', example: 5, required: false })
  @IsNumber()
  @IsOptional()
  importance?: number;

  @ApiProperty({ description: 'Array of tags for the memory', example: ['character', 'action'], required: false })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({ description: 'Story ID this memory belongs to', example: 'story123', required: false })
  @IsString()
  @IsOptional()
  storyId?: string;

  @ApiProperty({ description: 'Context ID for the memory', example: 'scene42', required: false })
  @IsString()
  @IsOptional()
  contextId?: string;

  @ApiProperty({ description: 'Additional metadata for the memory', example: { location: 'mansion', time: 'night' }, required: false })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class StoreMemoryDto extends BaseMCPRequestDto {
  @ApiProperty({
    description: 'Action for store memory (always "store")',
    example: 'store',
  })
  @IsString()
  @IsNotEmpty()
  action: 'store';

  @ApiProperty({ type: StoreMemoryPayloadDto })
  @ValidateNested()
  @Type(() => StoreMemoryPayloadDto)
  payload: StoreMemoryPayloadDto;
}
