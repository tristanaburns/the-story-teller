import { BaseMCPRequestDto } from './base-mcp-request.dto';
declare class StoreMemoryPayloadDto {
    content: string;
    importance?: number;
    tags?: string[];
    storyId?: string;
    contextId?: string;
    metadata?: Record<string, any>;
}
export declare class StoreMemoryDto extends BaseMCPRequestDto {
    action: 'store';
    payload: StoreMemoryPayloadDto;
}
export {};
