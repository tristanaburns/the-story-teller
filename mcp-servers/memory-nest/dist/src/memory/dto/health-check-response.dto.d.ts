export declare class HealthCheckResponseDto {
    status: string;
    serverId: string;
    version: string;
    timestamp: number;
    mongodbConnected?: boolean;
    memoryCount?: number;
    uptime?: number;
}
