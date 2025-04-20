import { ApiProperty } from '@nestjs/swagger';

export class BaseMCPResponseDto {
  @ApiProperty({ description: 'ID of the MCP server', example: 'memory-mcp' })
  serverId: string;

  @ApiProperty({ description: 'Action performed', example: 'store' })
  action: string;

  @ApiProperty({ description: 'Status of the operation', example: 'success', enum: ['success', 'error'] })
  status: 'success' | 'error';

  @ApiProperty({ description: 'Error message (if status is error)', example: 'Memory not found', required: false })
  error?: string;

  @ApiProperty({ description: 'ID of the original request', example: 'req_abc123' })
  requestId: string;

  @ApiProperty({ description: 'ID of the response', example: 'res_def456' })
  responseId: string;

  @ApiProperty({ description: 'Timestamp of the response', example: 1682481632000 })
  timestamp: number;

  @ApiProperty({ description: 'Response payload', type: Object })
  payload: any;
}
