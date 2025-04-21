import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
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
