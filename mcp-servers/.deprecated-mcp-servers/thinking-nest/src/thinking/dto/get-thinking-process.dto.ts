import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { BaseMCPRequestDto } from './base-mcp-request.dto';

class GetThinkingProcessPayloadDto {
  @ApiProperty({ description: 'ID of the thinking process', example: '60d21b4667d0d8992e610c85' })
  @IsString()
  @IsNotEmpty()
  processId: string;
}

export class GetThinkingProcessDto extends BaseMCPRequestDto {
  @ApiProperty({
    description: 'Action for retrieving a thinking process (always "getProcess")',
    example: 'getProcess',
  })
  @IsString()
  @IsNotEmpty()
  action: 'getProcess';

  @ApiProperty({ type: GetThinkingProcessPayloadDto })
  @ValidateNested()
  @Type(() => GetThinkingProcessPayloadDto)
  payload: GetThinkingProcessPayloadDto;
}
