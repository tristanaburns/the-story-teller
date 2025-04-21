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
exports.ThinkingProcessSchema = exports.ThinkingProcess = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const swagger_1 = require("@nestjs/swagger");
let ThinkingProcess = class ThinkingProcess {
};
exports.ThinkingProcess = ThinkingProcess;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique identifier of the thinking process' }),
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], ThinkingProcess.prototype, "processId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID who owns this thinking process' }),
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], ThinkingProcess.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Story ID this thinking process is associated with' }),
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], ThinkingProcess.prototype, "storyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current status of the thinking process' }),
    (0, mongoose_1.Prop)({ required: true, enum: ['pending', 'in-progress', 'completed', 'failed'], default: 'pending' }),
    __metadata("design:type", String)
], ThinkingProcess.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Type of thinking process' }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ThinkingProcess.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Input data for the thinking process' }),
    (0, mongoose_1.Prop)({ type: Object, required: true }),
    __metadata("design:type", Object)
], ThinkingProcess.prototype, "input", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Output data from the thinking process' }),
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], ThinkingProcess.prototype, "output", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Error details if the process failed' }),
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], ThinkingProcess.prototype, "error", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Progress of the thinking process (0-100)' }),
    (0, mongoose_1.Prop)({ default: 0, min: 0, max: 100 }),
    __metadata("design:type", Number)
], ThinkingProcess.prototype, "progress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp when the thinking process started' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], ThinkingProcess.prototype, "startedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp when the thinking process completed' }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], ThinkingProcess.prototype, "completedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Intermediate steps in the thinking process' }),
    (0, mongoose_1.Prop)({ type: [Object], default: [] }),
    __metadata("design:type", Array)
], ThinkingProcess.prototype, "steps", void 0);
exports.ThinkingProcess = ThinkingProcess = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ThinkingProcess);
exports.ThinkingProcessSchema = mongoose_1.SchemaFactory.createForClass(ThinkingProcess);
//# sourceMappingURL=thinking.schema.js.map