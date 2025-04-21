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
exports.ThinkingResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class ThinkingResponseDto {
}
exports.ThinkingResponseDto = ThinkingResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Status of the API response',
        example: 'success',
        enum: ['success', 'error']
    }),
    __metadata("design:type", String)
], ThinkingResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Message describing the result of the operation',
        example: 'Thinking process created successfully'
    }),
    __metadata("design:type", String)
], ThinkingResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The action that was performed',
        example: 'create',
        enum: ['create', 'update', 'delete', 'get', 'list']
    }),
    __metadata("design:type", String)
], ThinkingResponseDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Data payload containing the result',
        example: {
            processId: 'thinking-process-123',
            userId: 'user123',
            storyId: 'story456',
            type: 'story-analysis',
            status: 'pending',
            progress: 0,
            createdAt: '2023-05-23T14:56:29.503Z'
        }
    }),
    __metadata("design:type", Object)
], ThinkingResponseDto.prototype, "payload", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Error details if status is error',
        example: {
            code: 'INVALID_INPUT',
            details: 'Missing required field: userId'
        },
        required: false
    }),
    __metadata("design:type", Object)
], ThinkingResponseDto.prototype, "error", void 0);
//# sourceMappingURL=thinking-response.dto.js.map