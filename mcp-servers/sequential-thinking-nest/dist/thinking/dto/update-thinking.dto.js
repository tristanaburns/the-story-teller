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
exports.UpdateThinkingDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UpdateThinkingDto {
}
exports.UpdateThinkingDto = UpdateThinkingDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current status of the thinking process',
        example: 'in-progress',
        enum: ['pending', 'in-progress', 'completed', 'failed'],
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsEnum)(['pending', 'in-progress', 'completed', 'failed']),
    __metadata("design:type", String)
], UpdateThinkingDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Output data from the thinking process',
        example: {
            analysis: 'The story has a strong protagonist but lacks a clear antagonist.',
            suggestions: ['Develop a more complex villain', 'Add more conflict in the middle act']
        },
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateThinkingDto.prototype, "output", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Error details if the process failed',
        example: {
            message: 'Failed to process the thinking step',
            step: 'character-analysis',
            details: 'Insufficient data provided for character analysis'
        },
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateThinkingDto.prototype, "error", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Progress of the thinking process (0-100)',
        example: 75,
        minimum: 0,
        maximum: 100,
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UpdateThinkingDto.prototype, "progress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp when the thinking process started',
        example: '2023-05-23T14:56:29.503Z',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], UpdateThinkingDto.prototype, "startedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp when the thinking process completed',
        example: '2023-05-23T15:12:45.789Z',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], UpdateThinkingDto.prototype, "completedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Step to add to the thinking process',
        example: {
            stepNumber: 3,
            type: 'character-analysis',
            status: 'completed',
            input: { character: 'Protagonist' },
            output: { strengths: ['Determined', 'Resourceful'], weaknesses: ['Impulsive'] },
            startedAt: '2023-05-23T15:05:12.123Z',
            completedAt: '2023-05-23T15:08:36.456Z'
        },
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateThinkingDto.prototype, "step", void 0);
//# sourceMappingURL=update-thinking.dto.js.map