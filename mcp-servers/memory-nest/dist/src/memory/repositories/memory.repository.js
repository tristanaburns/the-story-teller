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
exports.MemoryRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const memory_schema_1 = require("../schemas/memory.schema");
let MemoryRepository = class MemoryRepository {
    constructor(memoryModel) {
        this.memoryModel = memoryModel;
    }
    async create(memoryData) {
        const newMemory = new this.memoryModel(memoryData);
        return newMemory.save();
    }
    async findById(id, userId) {
        try {
            return this.memoryModel.findOne({ _id: id, userId }).exec();
        }
        catch (error) {
            if (error.name === 'CastError') {
                return null;
            }
            throw error;
        }
    }
    async findMany(filter, sort = { importance: -1, timestamp: -1 }) {
        return this.memoryModel.find(filter).sort(sort).exec();
    }
    async delete(id, userId) {
        try {
            const result = await this.memoryModel.deleteOne({ _id: id, userId }).exec();
            return result.deletedCount > 0;
        }
        catch (error) {
            if (error.name === 'CastError') {
                return false;
            }
            throw error;
        }
    }
    async count(filter) {
        return this.memoryModel.countDocuments(filter).exec();
    }
    async buildSearchFilter(params) {
        const { userId, storyId, contextId, query, tags, timeframe, metadata } = params;
        const filter = { userId };
        if (storyId) {
            filter['metadata.storyId'] = storyId;
        }
        if (contextId) {
            filter.contextId = contextId;
        }
        if (tags && tags.length > 0) {
            filter.tags = { $in: tags };
        }
        if (timeframe) {
            filter.timestamp = {};
            if (timeframe.start) {
                filter.timestamp.$gte = new Date(timeframe.start).getTime();
            }
            if (timeframe.end) {
                filter.timestamp.$lte = new Date(timeframe.end).getTime();
            }
        }
        if (metadata) {
            Object.entries(metadata).forEach(([key, value]) => {
                filter[`metadata.${key}`] = value;
            });
        }
        if (query) {
            filter.content = { $regex: query, $options: 'i' };
        }
        return filter;
    }
};
exports.MemoryRepository = MemoryRepository;
exports.MemoryRepository = MemoryRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(memory_schema_1.Memory.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], MemoryRepository);
//# sourceMappingURL=memory.repository.js.map