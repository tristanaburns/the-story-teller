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
exports.BaseMCPResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class BaseMCPResponseDto {
}
exports.BaseMCPResponseDto = BaseMCPResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the MCP server', example: 'memory-mcp' }),
    __metadata("design:type", String)
], BaseMCPResponseDto.prototype, "serverId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Action performed', example: 'store' }),
    __metadata("design:type", String)
], BaseMCPResponseDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Status of the operation', example: 'success', enum: ['success', 'error'] }),
    __metadata("design:type", String)
], BaseMCPResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Error message (if status is error)', example: 'Memory not found', required: false }),
    __metadata("design:type", String)
], BaseMCPResponseDto.prototype, "error", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the original request', example: 'req_abc123' }),
    __metadata("design:type", String)
], BaseMCPResponseDto.prototype, "requestId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the response', example: 'res_def456' }),
    __metadata("design:type", String)
], BaseMCPResponseDto.prototype, "responseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp of the response', example: 1682481632000 }),
    __metadata("design:type", Number)
], BaseMCPResponseDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Response payload', type: Object }),
    __metadata("design:type", Object)
], BaseMCPResponseDto.prototype, "payload", void 0);
//# sourceMappingURL=base-mcp-response.dto.js.map