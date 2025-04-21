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
exports.HealthCheckResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class HealthCheckResponseDto {
}
exports.HealthCheckResponseDto = HealthCheckResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Status of the server',
        example: 'ok',
        enum: ['ok', 'error', 'degraded']
    }),
    __metadata("design:type", String)
], HealthCheckResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the MCP server',
        example: 'memory-mcp'
    }),
    __metadata("design:type", String)
], HealthCheckResponseDto.prototype, "serverId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Version of the MCP server',
        example: '1.0.0'
    }),
    __metadata("design:type", String)
], HealthCheckResponseDto.prototype, "version", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp of the health check',
        example: 1682481632000
    }),
    __metadata("design:type", Number)
], HealthCheckResponseDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'MongoDB connection status',
        example: true,
        required: false
    }),
    __metadata("design:type", Boolean)
], HealthCheckResponseDto.prototype, "mongodbConnected", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Memory count in database',
        example: 42,
        required: false
    }),
    __metadata("design:type", Number)
], HealthCheckResponseDto.prototype, "memoryCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'System uptime in seconds',
        example: 3600,
        required: false
    }),
    __metadata("design:type", Number)
], HealthCheckResponseDto.prototype, "uptime", void 0);
//# sourceMappingURL=health-check-response.dto.js.map