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
var MemoryController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const memory_service_1 = require("./memory.service");
const dto_1 = require("./dto");
const api_key_guard_1 = require("../auth/api-key.guard");
let MemoryController = MemoryController_1 = class MemoryController {
    constructor(memoryService) {
        this.memoryService = memoryService;
        this.logger = new common_1.Logger(MemoryController_1.name);
    }
    async getHealth() {
        return this.memoryService.getHealth();
    }
    async processRequest(requestDto) {
        this.logger.log(`Processing ${requestDto.action} request with ID ${requestDto.requestId}`);
        try {
            const { action } = requestDto;
            switch (action) {
                case 'store':
                    return await this.memoryService.storeMemory(requestDto);
                case 'retrieve':
                    return await this.memoryService.retrieveMemory(requestDto);
                case 'search':
                    return await this.memoryService.searchMemories(requestDto);
                case 'consolidate':
                    return await this.memoryService.consolidateMemories(requestDto);
                case 'rank':
                    return await this.memoryService.rankMemories(requestDto);
                case 'delete':
                    return await this.memoryService.deleteMemory(requestDto);
                default:
                    return {
                        serverId: 'memory-mcp',
                        action,
                        status: 'error',
                        error: `Unknown action: ${action}`,
                        requestId: requestDto.requestId,
                        responseId: this.generateResponseId(),
                        timestamp: Date.now(),
                        payload: null
                    };
            }
        }
        catch (error) {
            this.logger.error(`Error processing request: ${error.message}`, error.stack);
            return {
                serverId: 'memory-mcp',
                action: requestDto.action || 'unknown',
                status: 'error',
                error: error.message,
                requestId: requestDto.requestId,
                responseId: this.generateResponseId(),
                timestamp: Date.now(),
                payload: null
            };
        }
    }
    async storeMemory(storeMemoryDto) {
        this.logger.log(`Storing new memory with request ID ${storeMemoryDto.requestId}`);
        return this.memoryService.storeMemory(storeMemoryDto);
    }
    async retrieveMemory(retrieveMemoryDto) {
        this.logger.log(`Retrieving memory ${retrieveMemoryDto.payload.memoryId} with request ID ${retrieveMemoryDto.requestId}`);
        return this.memoryService.retrieveMemory(retrieveMemoryDto);
    }
    async searchMemories(searchMemoriesDto) {
        this.logger.log(`Searching memories with request ID ${searchMemoriesDto.requestId}`);
        return this.memoryService.searchMemories(searchMemoriesDto);
    }
    async consolidateMemories(consolidateMemoriesDto) {
        this.logger.log(`Consolidating memories with request ID ${consolidateMemoriesDto.requestId}`);
        return this.memoryService.consolidateMemories(consolidateMemoriesDto);
    }
    async rankMemories(rankMemoriesDto) {
        this.logger.log(`Ranking memories with request ID ${rankMemoriesDto.requestId}`);
        return this.memoryService.rankMemories(rankMemoriesDto);
    }
    async deleteMemory(deleteMemoryDto) {
        this.logger.log(`Deleting memory ${deleteMemoryDto.payload.memoryId} with request ID ${deleteMemoryDto.requestId}`);
        return this.memoryService.deleteMemory(deleteMemoryDto);
    }
    generateResponseId() {
        return 'res_' + Math.random().toString(36).substring(2, 15);
    }
};
exports.MemoryController = MemoryController;
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Check server health' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Server is healthy',
        type: dto_1.HealthCheckResponseDto
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Process memory MCP requests' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Request processed successfully',
        type: dto_1.BaseMCPResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Bad request parameters'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized request'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Resource not found'
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "processRequest", null);
__decorate([
    (0, common_1.Post)('store'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Store a new memory' }),
    (0, swagger_1.ApiBody)({ type: dto_1.StoreMemoryDto }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Memory stored successfully',
        type: dto_1.BaseMCPResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid request parameters'
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.StoreMemoryDto]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "storeMemory", null);
__decorate([
    (0, common_1.Post)('retrieve'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve a memory by ID' }),
    (0, swagger_1.ApiBody)({ type: dto_1.RetrieveMemoryDto }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Memory retrieved successfully',
        type: dto_1.BaseMCPResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Memory not found'
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.RetrieveMemoryDto]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "retrieveMemory", null);
__decorate([
    (0, common_1.Post)('search'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Search for memories' }),
    (0, swagger_1.ApiBody)({ type: dto_1.SearchMemoriesDto }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Search results',
        type: dto_1.BaseMCPResponseDto
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.SearchMemoriesDto]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "searchMemories", null);
__decorate([
    (0, common_1.Post)('consolidate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Consolidate multiple memories' }),
    (0, swagger_1.ApiBody)({ type: dto_1.ConsolidateMemoriesDto }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Memories consolidated successfully',
        type: dto_1.BaseMCPResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'No memories found to consolidate'
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ConsolidateMemoriesDto]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "consolidateMemories", null);
__decorate([
    (0, common_1.Post)('rank'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Rank memories by importance' }),
    (0, swagger_1.ApiBody)({ type: dto_1.RankMemoriesDto }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Memories ranked successfully',
        type: dto_1.BaseMCPResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'No memories found to rank'
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.RankMemoriesDto]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "rankMemories", null);
__decorate([
    (0, common_1.Post)('delete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a memory' }),
    (0, swagger_1.ApiBody)({ type: dto_1.DeleteMemoryDto }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Memory deleted successfully',
        type: dto_1.BaseMCPResponseDto
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Memory not found'
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.DeleteMemoryDto]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "deleteMemory", null);
exports.MemoryController = MemoryController = MemoryController_1 = __decorate([
    (0, swagger_1.ApiTags)('memory'),
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [memory_service_1.MemoryService])
], MemoryController);
//# sourceMappingURL=memory.controller.js.map