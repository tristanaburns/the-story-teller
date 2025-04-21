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
exports.ConsolidateMemoriesDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const base_mcp_request_dto_1 = require("./base-mcp-request.dto");
class ConsolidateMemoriesPayloadDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Array of memory IDs to consolidate', example: ['60d5ec9d8e5fc12345abcdef', '60d5ec9d8e5fc12345abcdee'], required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], ConsolidateMemoriesPayloadDto.prototype, "memoryIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Story ID to filter by', example: 'story123', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ConsolidateMemoriesPayloadDto.prototype, "storyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Context ID to filter by', example: 'scene42', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ConsolidateMemoriesPayloadDto.prototype, "contextId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Search query for finding memories to consolidate', example: 'mansion', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ConsolidateMemoriesPayloadDto.prototype, "query", void 0);
class ConsolidateMemoriesDto extends base_mcp_request_dto_1.BaseMCPRequestDto {
}
exports.ConsolidateMemoriesDto = ConsolidateMemoriesDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Action for consolidate memories (always "consolidate")',
        example: 'consolidate',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ConsolidateMemoriesDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: ConsolidateMemoriesPayloadDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ConsolidateMemoriesPayloadDto),
    __metadata("design:type", ConsolidateMemoriesPayloadDto)
], ConsolidateMemoriesDto.prototype, "payload", void 0);
//# sourceMappingURL=consolidate-memories.dto.js.map