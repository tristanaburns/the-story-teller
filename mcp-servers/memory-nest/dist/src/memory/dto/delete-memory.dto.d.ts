import { BaseMCPRequestDto } from './base-mcp-request.dto';
declare class DeleteMemoryPayloadDto {
    memoryId: string;
}
export declare class DeleteMemoryDto extends BaseMCPRequestDto {
    action: 'delete';
    payload: DeleteMemoryPayloadDto;
}
export {};
