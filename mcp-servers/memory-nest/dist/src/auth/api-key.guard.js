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
var ApiKeyGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyGuard = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const config_1 = require("@nestjs/config");
const auth_constants_1 = require("./auth.constants");
let ApiKeyGuard = ApiKeyGuard_1 = class ApiKeyGuard extends (0, passport_1.AuthGuard)(auth_constants_1.AUTH_CONSTANTS.API_KEY_STRATEGY) {
    constructor(configService) {
        super();
        this.configService = configService;
        this.logger = new common_1.Logger(ApiKeyGuard_1.name);
    }
    canActivate(context) {
        const isApiKeyRequired = this.configService.get('API_KEY_REQUIRED', 'false') === 'true';
        if (!isApiKeyRequired) {
            this.logger.debug('API key validation is disabled, skipping check');
            return true;
        }
        this.logger.debug('API key validation is enabled, checking key');
        return super.canActivate(context);
    }
    handleRequest(err, user, info, context) {
        if (err || !user) {
            const request = context.switchToHttp().getRequest();
            const action = request.body?.action || 'unknown';
            const requestId = request.body?.requestId || 'unknown';
            this.logger.error(`Authentication failed for action: ${action}, requestId: ${requestId}`);
            const errorResponse = {
                serverId: 'memory-mcp',
                action,
                status: 'error',
                error: 'Unauthorized: Invalid API key',
                requestId,
                responseId: 'res_' + Math.random().toString(36).substring(2, 15),
                timestamp: Date.now(),
                payload: null
            };
            throw new common_1.UnauthorizedException(errorResponse);
        }
        return user;
    }
};
exports.ApiKeyGuard = ApiKeyGuard;
exports.ApiKeyGuard = ApiKeyGuard = ApiKeyGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ApiKeyGuard);
//# sourceMappingURL=api-key.guard.js.map