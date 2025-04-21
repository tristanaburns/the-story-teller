"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThinkingModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const thinking_controller_1 = require("./thinking.controller");
const thinking_service_1 = require("./thinking.service");
const thinking_schema_1 = require("./schemas/thinking.schema");
const thinking_repository_1 = require("./repositories/thinking.repository");
let ThinkingModule = class ThinkingModule {
};
exports.ThinkingModule = ThinkingModule;
exports.ThinkingModule = ThinkingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: thinking_schema_1.ThinkingProcess.name, schema: thinking_schema_1.ThinkingProcessSchema }
            ])
        ],
        controllers: [thinking_controller_1.ThinkingController],
        providers: [thinking_service_1.ThinkingService, thinking_repository_1.ThinkingRepository],
        exports: [thinking_service_1.ThinkingService, thinking_repository_1.ThinkingRepository]
    })
], ThinkingModule);
//# sourceMappingURL=thinking.module.js.map