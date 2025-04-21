import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { BaseMCPRequestDto } from './base-mcp-request.dto';
import { ThinkingType } from './analyze-problem.dto';

export enum ThinkingStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

class SearchThinkingProcessesPayloadDto {
  @ApiProperty({ description: 'Search query for title or description', example: 'character motivation', required: false })
  @IsString()
  @IsOptional()
  query?: string;

  @ApiProperty({ description: 'Filter by thinking type', enum: ThinkingType, required: false })
  @IsEnum(ThinkingType)
  @IsOptional()
  thinkingType?: ThinkingType;

  @ApiProperty({ description: 'Filter by process status', enum: ThinkingStatus, required: false })
  @IsEnum(ThinkingStatus)
  @IsOptional()
  status?: ThinkingStatus;

  @ApiProperty({ description: 'Filter by tags', example: ['character-development', 'worldbuilding'], required: false })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({ description: 'Filter by story ID', example: 'story123', required: false })
  @IsString()
  @IsOptional()
  storyId?: string;

  @ApiProperty({ description: 'Filter by context ID', example: 'chapter-5', required: false })
  @IsString()
  @IsOptional()
  contextId?: string;
}

export class SearchThinkingProcessesDto extends BaseMCPRequestDto {
  @ApiProperty({
    description: 'Action for searching thinking processes (always "search")',
    example: 'search',
  })
  @IsString()
  @IsNotEmpty()
  action: 'search';

  @ApiProperty({ type: SearchThinkingProcessesPayloadDto })
  @ValidateNested()
  @Type(() => SearchThinkingProcessesPayloadDto)
  payload: SearchThinkingProcessesPayloadDto;
}
