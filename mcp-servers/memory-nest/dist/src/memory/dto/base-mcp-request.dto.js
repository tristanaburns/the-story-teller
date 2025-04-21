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
exports.BaseMCPRequestDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class BaseMCPRequestDto {
}
exports.BaseMCPRequestDto = BaseMCPRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the MCP server', example: 'memory-mcp' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BaseMCPRequestDto.prototype, "serverId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Action to perform', example: 'store' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BaseMCPRequestDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID for the request', example: 'user123' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BaseMCPRequestDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique request ID', example: 'req_abc123' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BaseMCPRequestDto.prototype, "requestId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp of the request', example: 1682481632000 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BaseMCPRequestDto.prototype, "timestamp", void 0);
//# sourceMappingURL=base-mcp-request.dto.js.map