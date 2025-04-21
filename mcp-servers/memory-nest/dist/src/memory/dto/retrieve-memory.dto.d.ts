import { BaseMCPRequestDto } from './base-mcp-request.dto';
declare class RetrieveMemoryPayloadDto {
    memoryId: string;
}
export declare class RetrieveMemoryDto extends BaseMCPRequestDto {
    action: 'retrieve';
    payload: RetrieveMemoryPayloadDto;
}
export {};
