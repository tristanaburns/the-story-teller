import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested, IsObject, IsEnum } from 'class-validator';
import { BaseMCPRequestDto } from './base-mcp-request.dto';

export enum ThinkingType {
  CHARACTER = 'character',
  PLOT = 'plot',
  WORLDBUILDING = 'worldbuilding',
  ANALYSIS = 'analysis',
}

class AnalyzeProblemPayloadDto {
  @ApiProperty({ description: 'Title of the thinking process', example: 'Character motivation analysis' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Description of the problem to analyze', example: 'Why is character X making inconsistent decisions?' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Type of thinking process',
    enum: ThinkingType,
    example: ThinkingType.CHARACTER,
  })
  @IsEnum(ThinkingType)
  @IsNotEmpty()
  thinkingType: ThinkingType;

  @ApiProperty({ description: 'Array of tags for the process', example: ['character-development', 'motivation'], required: false })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({ description: 'Story ID this process belongs to', example: 'story123', required: false })
  @IsString()
  @IsOptional()
  storyId?: string;

  @ApiProperty({ description: 'Context ID for the process', example: 'character-arc-42', required: false })
  @IsString()
  @IsOptional()
  contextId?: string;

  @ApiProperty({ description: 'Additional metadata for the process', example: { character: 'John Smith', chapter: 5 }, required: false })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class AnalyzeProblemDto extends BaseMCPRequestDto {
  @ApiProperty({
    description: 'Action for analyze problem (always "analyze")',
    example: 'analyze',
  })
  @IsString()
  @IsNotEmpty()
  action: 'analyze';

  @ApiProperty({ type: AnalyzeProblemPayloadDto })
  @ValidateNested()
  @Type(() => AnalyzeProblemPayloadDto)
  payload: AnalyzeProblemPayloadDto;
}
