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
exports.StoreMemoryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const base_mcp_request_dto_1 = require("./base-mcp-request.dto");
class StoreMemoryPayloadDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Memory content', example: 'The character entered the dark room cautiously.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], StoreMemoryPayloadDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Memory importance (1-10)', example: 5, required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], StoreMemoryPayloadDto.prototype, "importance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Array of tags for the memory', example: ['character', 'action'], required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], StoreMemoryPayloadDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Story ID this memory belongs to', example: 'story123', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], StoreMemoryPayloadDto.prototype, "storyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Context ID for the memory', example: 'scene42', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], StoreMemoryPayloadDto.prototype, "contextId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Additional metadata for the memory', example: { location: 'mansion', time: 'night' }, required: false }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StoreMemoryPayloadDto.prototype, "metadata", void 0);
class StoreMemoryDto extends base_mcp_request_dto_1.BaseMCPRequestDto {
}
exports.StoreMemoryDto = StoreMemoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Action for store memory (always "store")',
        example: 'store',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], StoreMemoryDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: StoreMemoryPayloadDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => StoreMemoryPayloadDto),
    __metadata("design:type", StoreMemoryPayloadDto)
], StoreMemoryDto.prototype, "payload", void 0);
//# sourceMappingURL=store-memory.dto.js.map