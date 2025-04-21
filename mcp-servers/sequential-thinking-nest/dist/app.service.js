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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const os = require("os");
let AppService = class AppService {
    constructor(configService) {
        this.configService = configService;
        this.startTime = new Date();
    }
    getHealth() {
        try {
            return {
                status: 'ok',
                serverId: 'sequential-thinking-mcp',
                version: '1.0.0',
                uptime: Math.floor((new Date().getTime() - this.startTime.getTime()) / 1000),
                timestamp: new Date().toISOString(),
                memory: {
                    free: os.freemem(),
                    total: os.totalmem()
                },
                os: {
                    platform: os.platform(),
                    type: os.type(),
                    release: os.release()
                }
            };
        }
        catch (error) {
            return {
                status: 'error',
                serverId: 'sequential-thinking-mcp',
                error: error.message
            };
        }
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AppService);
//# sourceMappingURL=app.service.js.map