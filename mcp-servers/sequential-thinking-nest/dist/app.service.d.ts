import { ConfigService } from '@nestjs/config';
export declare class AppService {
    private configService;
    private startTime;
    constructor(configService: ConfigService);
    getHealth(): {
        status: string;
        serverId: string;
        version: string;
        uptime: number;
        timestamp: string;
        memory: {
            free: number;
            total: number;
        };
        os: {
            platform: NodeJS.Platform;
            type: string;
            release: string;
        };
        error?: undefined;
    } | {
        status: string;
        serverId: string;
        error: any;
        version?: undefined;
        uptime?: undefined;
        timestamp?: undefined;
        memory?: undefined;
        os?: undefined;
    };
}
