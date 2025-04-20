import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class BaseMCPRequestDto {
  @ApiProperty({ description: 'ID of the MCP server', example: 'thinking-mcp' })
  @IsString()
  @IsNotEmpty()
  serverId: string;

  @ApiProperty({ description: 'Action to perform', example: 'analyze' })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiProperty({ description: 'User ID for the request', example: 'user123' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Unique request ID', example: 'req_abc123' })
  @IsString()
  @IsNotEmpty()
  requestId: string;

  @ApiProperty({ description: 'Timestamp of the request', example: 1682481632000 })
  @IsNumber()
  timestamp: number;
}
