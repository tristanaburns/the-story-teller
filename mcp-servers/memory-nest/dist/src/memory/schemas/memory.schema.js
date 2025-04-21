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
exports.MemorySchema = exports.Memory = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Memory = class Memory extends mongoose_2.Document {
};
exports.Memory = Memory;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Memory.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Memory.prototype, "content", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 1 }),
    __metadata("design:type", Number)
], Memory.prototype, "importance", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Memory.prototype, "tags", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Memory.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: Date.now }),
    __metadata("design:type", Number)
], Memory.prototype, "timestamp", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'default' }),
    __metadata("design:type", String)
], Memory.prototype, "contextId", void 0);
exports.Memory = Memory = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Memory);
exports.MemorySchema = mongoose_1.SchemaFactory.createForClass(Memory);
exports.MemorySchema.index({ userId: 1 });
exports.MemorySchema.index({ 'metadata.storyId': 1 });
exports.MemorySchema.index({ contextId: 1 });
exports.MemorySchema.index({ tags: 1 });
exports.MemorySchema.index({ timestamp: -1 });
exports.MemorySchema.index({ importance: -1 });
//# sourceMappingURL=memory.schema.js.map