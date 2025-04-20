import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { BaseMCPRequestDto } from './base-mcp-request.dto';

class RetrieveMemoryPayloadDto {
  @ApiProperty({ description: 'Memory ID to retrieve', example: '60d5ec9d8e5fc12345abcdef' })
  @IsString()
  @IsNotEmpty()
  memoryId: string;
}

export class RetrieveMemoryDto extends BaseMCPRequestDto {
  @ApiProperty({
    description: 'Action for retrieve memory (always "retrieve")',
    example: 'retrieve',
  })
  @IsString()
  @IsNotEmpty()
  action: 'retrieve';

  @ApiProperty({ type: RetrieveMemoryPayloadDto })
  @ValidateNested()
  @Type(() => RetrieveMemoryPayloadDto)
  payload: RetrieveMemoryPayloadDto;
}
