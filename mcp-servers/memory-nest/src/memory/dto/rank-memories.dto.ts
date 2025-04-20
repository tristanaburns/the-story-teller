import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { BaseMCPRequestDto } from './base-mcp-request.dto';

class RankMemoriesPayloadDto {
  @ApiProperty({ description: 'Array of memory IDs to rank', example: ['60d5ec9d8e5fc12345abcdef', '60d5ec9d8e5fc12345abcdee'], required: false })
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

  @ApiProperty({ description: 'Search query for finding memories to rank', example: 'mansion', required: false })
  @IsString()
  @IsOptional()
  query?: string;
}

export class RankMemoriesDto extends BaseMCPRequestDto {
  @ApiProperty({
    description: 'Action for rank memories (always "rank")',
    example: 'rank',
  })
  @IsString()
  @IsNotEmpty()
  action: 'rank';

  @ApiProperty({ type: RankMemoriesPayloadDto })
  @ValidateNested()
  @Type(() => RankMemoriesPayloadDto)
  payload: RankMemoriesPayloadDto;
}
