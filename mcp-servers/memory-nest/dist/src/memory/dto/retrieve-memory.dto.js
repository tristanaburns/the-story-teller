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
exports.RetrieveMemoryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const base_mcp_request_dto_1 = require("./base-mcp-request.dto");
class RetrieveMemoryPayloadDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Memory ID to retrieve', example: '60d5ec9d8e5fc12345abcdef' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RetrieveMemoryPayloadDto.prototype, "memoryId", void 0);
class RetrieveMemoryDto extends base_mcp_request_dto_1.BaseMCPRequestDto {
}
exports.RetrieveMemoryDto = RetrieveMemoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Action for retrieve memory (always "retrieve")',
        example: 'retrieve',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RetrieveMemoryDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: RetrieveMemoryPayloadDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => RetrieveMemoryPayloadDto),
    __metadata("design:type", RetrieveMemoryPayloadDto)
], RetrieveMemoryDto.prototype, "payload", void 0);
//# sourceMappingURL=retrieve-memory.dto.js.map