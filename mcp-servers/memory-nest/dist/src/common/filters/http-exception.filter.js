"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HttpExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger(HttpExceptionFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception.getStatus();
        const errorResponse = exception.getResponse();
        const requestId = request.body?.requestId || 'unknown';
        const action = request.body?.action || 'unknown';
        let errorMessage = 'Internal server error';
        if (typeof errorResponse === 'object' && 'message' in errorResponse) {
            errorMessage = Array.isArray(errorResponse.message)
                ? errorResponse.message.join(', ')
                : errorResponse.message;
        }
        else if (typeof errorResponse === 'string') {
            errorMessage = errorResponse;
        }
        if (typeof errorResponse === 'object' &&
            'serverId' in errorResponse &&
            'action' in errorResponse &&
            'status' in errorResponse) {
            this.logger.error(`MCP Error: ${errorMessage}`);
            return response.status(status).json(errorResponse);
        }
        this.logger.error(`Request ${request.method} ${request.url} failed with status ${status}: ${errorMessage}`);
        const mcpErrorResponse = {
            serverId: 'memory-mcp',
            action,
            status: 'error',
            error: errorMessage,
            requestId,
            responseId: 'res_' + Math.random().toString(36).substring(2, 15),
            timestamp: Date.now(),
            payload: null,
        };
        response.status(status).json(mcpErrorResponse);
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
    (0, common_1.Catch)(common_1.HttpException)
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map