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
var ThinkingRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThinkingRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const thinking_schema_1 = require("../schemas/thinking.schema");
let ThinkingRepository = ThinkingRepository_1 = class ThinkingRepository {
    constructor(thinkingModel) {
        this.thinkingModel = thinkingModel;
        this.logger = new common_1.Logger(ThinkingRepository_1.name);
    }
    async create(thinking) {
        try {
            const newThinking = new this.thinkingModel(thinking);
            return await newThinking.save();
        }
        catch (error) {
            this.logger.error(`Failed to create thinking process: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findById(processId) {
        try {
            return await this.thinkingModel.findOne({ processId }).exec();
        }
        catch (error) {
            this.logger.error(`Failed to find thinking process ${processId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findByUserId(userId, limit = 10, offset = 0) {
        try {
            return await this.thinkingModel
                .find({ userId })
                .sort({ createdAt: -1 })
                .skip(offset)
                .limit(limit)
                .exec();
        }
        catch (error) {
            this.logger.error(`Failed to find thinking processes for user ${userId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findByStoryId(storyId, limit = 10, offset = 0) {
        try {
            return await this.thinkingModel
                .find({ storyId })
                .sort({ createdAt: -1 })
                .skip(offset)
                .limit(limit)
                .exec();
        }
        catch (error) {
            this.logger.error(`Failed to find thinking processes for story ${storyId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async update(processId, update) {
        try {
            return await this.thinkingModel
                .findOneAndUpdate({ processId }, update, { new: true })
                .exec();
        }
        catch (error) {
            this.logger.error(`Failed to update thinking process ${processId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async delete(processId) {
        try {
            return await this.thinkingModel.findOneAndDelete({ processId }).exec();
        }
        catch (error) {
            this.logger.error(`Failed to delete thinking process ${processId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async countByUserId(userId) {
        try {
            return await this.thinkingModel.countDocuments({ userId }).exec();
        }
        catch (error) {
            this.logger.error(`Failed to count thinking processes for user ${userId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async countByStoryId(storyId) {
        try {
            return await this.thinkingModel.countDocuments({ storyId }).exec();
        }
        catch (error) {
            this.logger.error(`Failed to count thinking processes for story ${storyId}: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ThinkingRepository = ThinkingRepository;
exports.ThinkingRepository = ThinkingRepository = ThinkingRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(thinking_schema_1.ThinkingProcess.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ThinkingRepository);
//# sourceMappingURL=thinking.repository.js.map