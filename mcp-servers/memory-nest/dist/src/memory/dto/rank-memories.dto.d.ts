import { BaseMCPRequestDto } from './base-mcp-request.dto';
declare class RankMemoriesPayloadDto {
    memoryIds?: string[];
    storyId?: string;
    contextId?: string;
    query?: string;
}
export declare class RankMemoriesDto extends BaseMCPRequestDto {
    action: 'rank';
    payload: RankMemoriesPayloadDto;
}
export {};
