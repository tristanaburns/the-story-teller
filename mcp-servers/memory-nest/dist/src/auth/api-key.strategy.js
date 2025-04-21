"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ApiKeyStrategy_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const config_1 = require("@nestjs/config");
const passport_http_bearer_1 = require("passport-http-bearer");
const auth_constants_1 = require("./auth.constants");
let ApiKeyStrategy = ApiKeyStrategy_1 = class ApiKeyStrategy extends (0, passport_1.PassportStrategy)(passport_http_bearer_1.Strategy, auth_constants_1.AUTH_CONSTANTS.API_KEY_STRATEGY) {
    constructor(configService) {
        super();
        this.configService = configService;
        this.logger = new common_1.Logger(ApiKeyStrategy_1.name);
    }
    async validate(apiKey) {
        const isApiKeyRequired = this.configService.get('API_KEY_REQUIRED', 'false') === 'true';
        if (isApiKeyRequired) {
            const validApiKey = this.configService.get('API_KEY');
            if (!validApiKey) {
                this.logger.error('API key validation is enabled but no API key is configured');
                throw new common_1.UnauthorizedException('API key validation is enabled but no API key is configured');
            }
            if (apiKey !== validApiKey) {
                this.logger.warn('Invalid API key provided in request');
                throw new common_1.UnauthorizedException('Invalid API key');
            }
            this.logger.debug('API key validation successful');
        }
        else {
            this.logger.debug('API key validation is disabled');
        }
        return { isValid: true };
    }
};
exports.ApiKeyStrategy = ApiKeyStrategy;
exports.ApiKeyStrategy = ApiKeyStrategy = ApiKeyStrategy_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ApiKeyStrategy);
//# sourceMappingURL=api-key.strategy.js.map