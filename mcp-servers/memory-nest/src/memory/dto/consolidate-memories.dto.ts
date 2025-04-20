import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { BaseMCPRequestDto } from './base-mcp-request.dto';

class ConsolidateMemoriesPayloadDto {
  @ApiProperty({ description: 'Array of memory IDs to consolidate', example: ['60d5ec9d8e5fc12345abcdef', '60d5ec9d8e5fc12345abcdee'], required: false })
  @IsArray()
  @IsOptional()
  memoryIds?: string[];

  @ApiProperty({ description: 'Story ID to filter by', example: 'story123', required: false })
  @IsString()
  @IsOptional()
  storyId?: string;

  @ApiProperty({ description: 'Context ID to filter by', example: 'scene42', required: false })
  @IsString()
  @IsOptional()
  contextId?: string;

  @ApiProperty({ description: 'Search query for finding memories to consolidate', example: 'mansion', required: false })
  @IsString()
  @IsOptional()
  query?: string;
}

export class ConsolidateMemoriesDto extends BaseMCPRequestDto {
  @ApiProperty({
    description: 'Action for consolidate memories (always "consolidate")',
    example: 'consolidate',
  })
  @IsString()
  @IsNotEmpty()
  action: 'consolidate';

  @ApiProperty({ type: ConsolidateMemoriesPayloadDto })
  @ValidateNested()
  @Type(() => ConsolidateMemoriesPayloadDto)
  payload: ConsolidateMemoriesPayloadDto;
}
