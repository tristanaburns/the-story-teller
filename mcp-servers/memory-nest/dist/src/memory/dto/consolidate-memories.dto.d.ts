import { BaseMCPRequestDto } from './base-mcp-request.dto';
declare class ConsolidateMemoriesPayloadDto {
    memoryIds?: string[];
    storyId?: string;
    contextId?: string;
    query?: string;
}
export declare class ConsolidateMemoriesDto extends BaseMCPRequestDto {
    action: 'consolidate';
    payload: ConsolidateMemoriesPayloadDto;
}
export {};
