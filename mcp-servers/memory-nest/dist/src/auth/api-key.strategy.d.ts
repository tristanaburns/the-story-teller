import { ConfigService } from '@nestjs/config';
declare const ApiKeyStrategy_base: new (...args: any) => any;
export declare class ApiKeyStrategy extends ApiKeyStrategy_base {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    validate(apiKey: string): Promise<any>;
}
export {};
