import { ConfigService } from '@nestjs/config';
declare const ApiKeyStrategy_base: new (...args: any[]) => any;
export declare class ApiKeyStrategy extends ApiKeyStrategy_base {
    private configService;
    constructor(configService: ConfigService);
    validate(token: string): Promise<boolean>;
}
export {};
