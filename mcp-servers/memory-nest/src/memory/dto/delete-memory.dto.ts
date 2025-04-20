import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { BaseMCPRequestDto } from './base-mcp-request.dto';

class DeleteMemoryPayloadDto {
  @ApiProperty({ description: 'Memory ID to delete', example: '60d5ec9d8e5fc12345abcdef' })
  @IsString()
  @IsNotEmpty()
  memoryId: string;
}

export class DeleteMemoryDto extends BaseMCPRequestDto {
  @ApiProperty({
    description: 'Action for delete memory (always "delete")',
    example: 'delete',
  })
  @IsString()
  @IsNotEmpty()
  action: 'delete';

  @ApiProperty({ type: DeleteMemoryPayloadDto })
  @ValidateNested()
  @Type(() => DeleteMemoryPayloadDto)
  payload: DeleteMemoryPayloadDto;
}
