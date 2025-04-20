import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested, IsNumber } from 'class-validator';
import { BaseMCPRequestDto } from './base-mcp-request.dto';

class AddThinkingStepPayloadDto {
  @ApiProperty({ description: 'ID of the thinking process', example: '60d21b4667d0d8992e610c85' })
  @IsString()
  @IsNotEmpty()
  processId: string;

  @ApiProperty({ description: 'Step title', example: 'Examining past behavior patterns' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Step content', example: 'Based on chapters 1-3, character X has shown a consistent pattern of...' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'Step reasoning', example: 'This indicates an internal conflict between the character\'s stated goals and their deeper motivations.' })
  @IsString()
  @IsNotEmpty()
  reasoning: string;

  @ApiProperty({ description: 'Step conclusion', example: 'The character\'s inconsistent decisions are actually consistent with their deeper character arc.' })
  @IsString()
  @IsNotEmpty()
  conclusion: string;

  @ApiProperty({ description: 'Step index number (0-based)', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  index: number;
}

export class AddThinkingStepDto extends BaseMCPRequestDto {
  @ApiProperty({
    description: 'Action for adding a thinking step (always "addStep")',
    example: 'addStep',
  })
  @IsString()
  @IsNotEmpty()
  action: 'addStep';

  @ApiProperty({ type: AddThinkingStepPayloadDto })
  @ValidateNested()
  @Type(() => AddThinkingStepPayloadDto)
  payload: AddThinkingStepPayloadDto;
}
