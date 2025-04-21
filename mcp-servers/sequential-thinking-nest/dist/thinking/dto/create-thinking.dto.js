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
exports.CreateThinkingDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateThinkingDto {
}
exports.CreateThinkingDto = CreateThinkingDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User ID who owns this thinking process',
        example: 'user123'
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateThinkingDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Story ID this thinking process is associated with',
        example: 'story456'
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateThinkingDto.prototype, "storyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of thinking process',
        example: 'story-analysis',
        enum: ['story-analysis', 'character-development', 'plot-generation', 'scene-planning', 'worldbuilding']
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsEnum)(['story-analysis', 'character-development', 'plot-generation', 'scene-planning', 'worldbuilding']),
    __metadata("design:type", String)
], CreateThinkingDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Input data for the thinking process',
        example: {
            prompt: 'Analyze the current state of my story',
            context: 'This is a fantasy story set in a medieval world.'
        }
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateThinkingDto.prototype, "input", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Custom process ID (optional)',
        example: 'custom-process-id-123',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateThinkingDto.prototype, "processId", void 0);
//# sourceMappingURL=create-thinking.dto.js.map