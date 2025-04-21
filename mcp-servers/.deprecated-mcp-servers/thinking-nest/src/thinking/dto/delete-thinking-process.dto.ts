import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { BaseMCPRequestDto } from './base-mcp-request.dto';

class DeleteThinkingProcessPayloadDto {
  @ApiProperty({ description: 'ID of the thinking process', example: '60d21b4667d0d8992e610c85' })
  @IsString()
  @IsNotEmpty()
  processId: string;
}

export class DeleteThinkingProcessDto extends BaseMCPRequestDto {
  @ApiProperty({
    description: 'Action for deleting a thinking process (always "delete")',
    example: 'delete',
  })
  @IsString()
  @IsNotEmpty()
  action: 'delete';

  @ApiProperty({ type: DeleteThinkingProcessPayloadDto })
  @ValidateNested()
  @Type(() => DeleteThinkingProcessPayloadDto)
  payload: DeleteThinkingProcessPayloadDto;
}
