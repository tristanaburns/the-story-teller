import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsArray, ValidateNested } from 'class-validator';
import { BaseMCPRequestDto } from './base-mcp-request.dto';

class CompleteThinkingProcessPayloadDto {
  @ApiProperty({ description: 'ID of the thinking process', example: '60d21b4667d0d8992e610c85' })
  @IsString()
  @IsNotEmpty()
  processId: string;

  @ApiProperty({ description: 'Array of final conclusions', example: ['Character X\'s decisions are driven by unresolved trauma', 'This creates a coherent character arc when viewed through this lens'] })
  @IsArray()
  @IsNotEmpty()
  conclusions: string[];
}

export class CompleteThinkingProcessDto extends BaseMCPRequestDto {
  @ApiProperty({
    description: 'Action for completing a thinking process (always "complete")',
    example: 'complete',
  })
  @IsString()
  @IsNotEmpty()
  action: 'complete';

  @ApiProperty({ type: CompleteThinkingProcessPayloadDto })
  @ValidateNested()
  @Type(() => CompleteThinkingProcessPayloadDto)
  payload: CompleteThinkingProcessPayloadDto;
}
