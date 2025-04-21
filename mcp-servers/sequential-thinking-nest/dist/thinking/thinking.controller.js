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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThinkingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const thinking_service_1 = require("./thinking.service");
const create_thinking_dto_1 = require("./dto/create-thinking.dto");
const update_thinking_dto_1 = require("./dto/update-thinking.dto");
const thinking_response_dto_1 = require("./dto/thinking-response.dto");
const api_key_guard_1 = require("../auth/api-key.guard");
let ThinkingController = class ThinkingController {
    constructor(thinkingService) {
        this.thinkingService = thinkingService;
    }
    async createThinkingProcess(createThinkingDto) {
        return this.thinkingService.createThinkingProcess(createThinkingDto);
    }
    async getThinkingProcess(processId) {
        return this.thinkingService.getThinkingProcess(processId);
    }
    async getThinkingProcessesByUserId(userId, limit, offset) {
        return this.thinkingService.getThinkingProcessesByUserId(userId, limit, offset);
    }
    async getThinkingProcessesByStoryId(storyId, limit, offset) {
        return this.thinkingService.getThinkingProcessesByStoryId(storyId, limit, offset);
    }
    async updateThinkingProcess(processId, updateThinkingDto) {
        return this.thinkingService.updateThinkingProcess(processId, updateThinkingDto);
    }
    async deleteThinkingProcess(processId) {
        return this.thinkingService.deleteThinkingProcess(processId);
    }
};
exports.ThinkingController = ThinkingController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new thinking process' }),
    (0, swagger_1.ApiBody)({ type: create_thinking_dto_1.CreateThinkingDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'The thinking process has been successfully created.',
        type: thinking_response_dto_1.ThinkingResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request. Invalid input data.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized. Invalid API key.'
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_thinking_dto_1.CreateThinkingDto]),
    __metadata("design:returntype", Promise)
], ThinkingController.prototype, "createThinkingProcess", null);
__decorate([
    (0, common_1.Get)(':processId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a thinking process by ID' }),
    (0, swagger_1.ApiParam)({ name: 'processId', description: 'ID of the thinking process' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'The thinking process has been successfully retrieved.',
        type: thinking_response_dto_1.ThinkingResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Thinking process not found.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized. Invalid API key.'
    }),
    __param(0, (0, common_1.Param)('processId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ThinkingController.prototype, "getThinkingProcess", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get thinking processes by user ID' }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'ID of the user' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', description: 'Maximum number of results to return', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'offset', description: 'Number of results to skip', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'The thinking processes have been successfully retrieved.',
        type: thinking_response_dto_1.ThinkingResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized. Invalid API key.'
    }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('offset', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], ThinkingController.prototype, "getThinkingProcessesByUserId", null);
__decorate([
    (0, common_1.Get)('story/:storyId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get thinking processes by story ID' }),
    (0, swagger_1.ApiParam)({ name: 'storyId', description: 'ID of the story' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', description: 'Maximum number of results to return', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'offset', description: 'Number of results to skip', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'The thinking processes have been successfully retrieved.',
        type: thinking_response_dto_1.ThinkingResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized. Invalid API key.'
    }),
    __param(0, (0, common_1.Param)('storyId')),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('offset', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], ThinkingController.prototype, "getThinkingProcessesByStoryId", null);
__decorate([
    (0, common_1.Put)(':processId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a thinking process' }),
    (0, swagger_1.ApiParam)({ name: 'processId', description: 'ID of the thinking process to update' }),
    (0, swagger_1.ApiBody)({ type: update_thinking_dto_1.UpdateThinkingDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'The thinking process has been successfully updated.',
        type: thinking_response_dto_1.ThinkingResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Thinking process not found.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request. Invalid input data.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized. Invalid API key.'
    }),
    __param(0, (0, common_1.Param)('processId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_thinking_dto_1.UpdateThinkingDto]),
    __metadata("design:returntype", Promise)
], ThinkingController.prototype, "updateThinkingProcess", null);
__decorate([
    (0, common_1.Delete)(':processId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a thinking process' }),
    (0, swagger_1.ApiParam)({ name: 'processId', description: 'ID of the thinking process to delete' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'The thinking process has been successfully deleted.',
        type: thinking_response_dto_1.ThinkingResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Thinking process not found.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized. Invalid API key.'
    }),
    __param(0, (0, common_1.Param)('processId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ThinkingController.prototype, "deleteThinkingProcess", null);
exports.ThinkingController = ThinkingController = __decorate([
    (0, swagger_1.ApiTags)('thinking'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    (0, common_1.Controller)('thinking'),
    __metadata("design:paramtypes", [thinking_service_1.ThinkingService])
], ThinkingController);
//# sourceMappingURL=thinking.controller.js.map