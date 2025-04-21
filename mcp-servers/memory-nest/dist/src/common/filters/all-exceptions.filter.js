"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AllExceptionsFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    constructor() {
        this.logger = new common_1.Logger(AllExceptionsFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const requestId = request.body?.requestId || 'unknown';
        const action = request.body?.action || 'unknown';
        let statusCode = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let errorMessage = 'Internal server error';
        if (exception instanceof common_1.HttpException) {
            statusCode = exception.getStatus();
            const errorResponse = exception.getResponse();
            if (typeof errorResponse === 'object' && 'message' in errorResponse) {
                errorMessage = Array.isArray(errorResponse.message)
                    ? errorResponse.message.join(', ')
                    : errorResponse.message;
            }
            else if (typeof errorResponse === 'string') {
                errorMessage = errorResponse;
            }
        }
        else if (exception instanceof Error) {
            errorMessage = exception.message;
            this.logger.error(`Unhandled exception: ${exception.message}`, exception.stack);
        }
        else {
            this.logger.error(`Unhandled exception: ${exception}`);
        }
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
        response.status(statusCode).json(mcpErrorResponse);
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map