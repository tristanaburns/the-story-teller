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
exports.SearchMemoriesDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const base_mcp_request_dto_1 = require("./base-mcp-request.dto");
class TimeframeDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Start time (ISO string or timestamp)', example: '2023-01-01T00:00:00Z', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TimeframeDto.prototype, "start", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'End time (ISO string or timestamp)', example: '2023-01-31T23:59:59Z', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TimeframeDto.prototype, "end", void 0);
class SearchMemoriesPayloadDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Story ID to filter by', example: 'story123', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SearchMemoriesPayloadDto.prototype, "storyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Context ID to filter by', example: 'scene42', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SearchMemoriesPayloadDto.prototype, "contextId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Search query', example: 'mansion dark', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SearchMemoriesPayloadDto.prototype, "query", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tags to filter by', example: ['character', 'action'], required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], SearchMemoriesPayloadDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: TimeframeDto, required: false }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => TimeframeDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", TimeframeDto)
], SearchMemoriesPayloadDto.prototype, "timeframe", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Additional metadata filters', example: { location: 'mansion' }, required: false }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SearchMemoriesPayloadDto.prototype, "metadata", void 0);
class SearchMemoriesDto extends base_mcp_request_dto_1.BaseMCPRequestDto {
}
exports.SearchMemoriesDto = SearchMemoriesDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Action for search memories (always "search")',
        example: 'search',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SearchMemoriesDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: SearchMemoriesPayloadDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => SearchMemoriesPayloadDto),
    __metadata("design:type", SearchMemoriesPayloadDto)
], SearchMemoriesDto.prototype, "payload", void 0);
//# sourceMappingURL=search-memories.dto.js.map