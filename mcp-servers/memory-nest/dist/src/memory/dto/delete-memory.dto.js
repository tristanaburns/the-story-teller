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
exports.DeleteMemoryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const base_mcp_request_dto_1 = require("./base-mcp-request.dto");
class DeleteMemoryPayloadDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Memory ID to delete', example: '60d5ec9d8e5fc12345abcdef' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DeleteMemoryPayloadDto.prototype, "memoryId", void 0);
class DeleteMemoryDto extends base_mcp_request_dto_1.BaseMCPRequestDto {
}
exports.DeleteMemoryDto = DeleteMemoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Action for delete memory (always "delete")',
        example: 'delete',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DeleteMemoryDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: DeleteMemoryPayloadDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DeleteMemoryPayloadDto),
    __metadata("design:type", DeleteMemoryPayloadDto)
], DeleteMemoryDto.prototype, "payload", void 0);
//# sourceMappingURL=delete-memory.dto.js.map