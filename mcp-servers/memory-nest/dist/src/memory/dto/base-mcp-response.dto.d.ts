export declare class BaseMCPResponseDto {
    serverId: string;
    action: string;
    status: 'success' | 'error';
    error?: string;
    requestId: string;
    responseId: string;
    timestamp: number;
    payload: any;
}
