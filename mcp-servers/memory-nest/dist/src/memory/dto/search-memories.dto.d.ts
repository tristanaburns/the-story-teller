import { BaseMCPRequestDto } from './base-mcp-request.dto';
declare class TimeframeDto {
    start?: string;
    end?: string;
}
declare class SearchMemoriesPayloadDto {
    storyId?: string;
    contextId?: string;
    query?: string;
    tags?: string[];
    timeframe?: TimeframeDto;
    metadata?: Record<string, any>;
}
export declare class SearchMemoriesDto extends BaseMCPRequestDto {
    action: 'search';
    payload: SearchMemoriesPayloadDto;
}
export {};
