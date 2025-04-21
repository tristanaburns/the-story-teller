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
var ThinkingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThinkingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const uuid_1 = require("uuid");
const thinking_repository_1 = require("./repositories/thinking.repository");
let ThinkingService = ThinkingService_1 = class ThinkingService {
    constructor(thinkingRepository, configService) {
        this.thinkingRepository = thinkingRepository;
        this.configService = configService;
        this.logger = new common_1.Logger(ThinkingService_1.name);
    }
    async createThinkingProcess(createThinkingDto) {
        try {
            const processId = createThinkingDto.processId || `thinking-${(0, uuid_1.v4)()}`;
            const existingProcess = await this.thinkingRepository.findById(processId);
            if (existingProcess) {
                throw new common_1.BadRequestException(`Thinking process with ID ${processId} already exists`);
            }
            const newThinking = await this.thinkingRepository.create({
                ...createThinkingDto,
                processId,
                status: 'pending',
                progress: 0,
                steps: []
            });
            this.processThinking(processId).catch(error => {
                this.logger.error(`Error in thinking process ${processId}: ${error.message}`, error.stack);
            });
            return {
                status: 'success',
                message: 'Thinking process created successfully',
                action: 'create',
                payload: this.formatThinkingProcess(newThinking)
            };
        }
        catch (error) {
            this.logger.error(`Failed to create thinking process: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getThinkingProcess(processId) {
        try {
            const thinking = await this.thinkingRepository.findById(processId);
            if (!thinking) {
                throw new common_1.NotFoundException(`Thinking process with ID ${processId} not found`);
            }
            return {
                status: 'success',
                message: 'Thinking process retrieved successfully',
                action: 'get',
                payload: this.formatThinkingProcess(thinking)
            };
        }
        catch (error) {
            this.logger.error(`Failed to get thinking process ${processId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getThinkingProcessesByUserId(userId, limit = 10, offset = 0) {
        try {
            const processes = await this.thinkingRepository.findByUserId(userId, limit, offset);
            const count = await this.thinkingRepository.countByUserId(userId);
            return {
                status: 'success',
                message: 'Thinking processes retrieved successfully',
                action: 'list',
                payload: {
                    processes: processes.map(this.formatThinkingProcess),
                    pagination: {
                        total: count,
                        limit,
                        offset,
                        hasMore: offset + processes.length < count
                    }
                }
            };
        }
        catch (error) {
            this.logger.error(`Failed to get thinking processes for user ${userId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getThinkingProcessesByStoryId(storyId, limit = 10, offset = 0) {
        try {
            const processes = await this.thinkingRepository.findByStoryId(storyId, limit, offset);
            const count = await this.thinkingRepository.countByStoryId(storyId);
            return {
                status: 'success',
                message: 'Thinking processes retrieved successfully',
                action: 'list',
                payload: {
                    processes: processes.map(this.formatThinkingProcess),
                    pagination: {
                        total: count,
                        limit,
                        offset,
                        hasMore: offset + processes.length < count
                    }
                }
            };
        }
        catch (error) {
            this.logger.error(`Failed to get thinking processes for story ${storyId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async updateThinkingProcess(processId, updateThinkingDto) {
        try {
            const thinking = await this.thinkingRepository.findById(processId);
            if (!thinking) {
                throw new common_1.NotFoundException(`Thinking process with ID ${processId} not found`);
            }
            const updateData = { ...updateThinkingDto };
            if (updateThinkingDto.step) {
                const updatedSteps = [...thinking.steps];
                const stepIndex = updatedSteps.findIndex(s => s.stepNumber === updateThinkingDto.step.stepNumber);
                if (stepIndex >= 0) {
                    updatedSteps[stepIndex] = {
                        ...updatedSteps[stepIndex],
                        ...updateThinkingDto.step
                    };
                }
                else {
                    updatedSteps.push(updateThinkingDto.step);
                }
                updateData.steps = updatedSteps;
                delete updateData.steps;
            }
            if (updateThinkingDto.status === 'in-progress' && !thinking.startedAt) {
                updateData.startedAt = new Date();
            }
            else if (['completed', 'failed'].includes(updateThinkingDto.status) && !thinking.completedAt) {
                updateData.completedAt = new Date();
            }
            const updatedThinking = await this.thinkingRepository.update(processId, updateData);
            return {
                status: 'success',
                message: 'Thinking process updated successfully',
                action: 'update',
                payload: this.formatThinkingProcess(updatedThinking)
            };
        }
        catch (error) {
            this.logger.error(`Failed to update thinking process ${processId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async deleteThinkingProcess(processId) {
        try {
            const thinking = await this.thinkingRepository.findById(processId);
            if (!thinking) {
                throw new common_1.NotFoundException(`Thinking process with ID ${processId} not found`);
            }
            await this.thinkingRepository.delete(processId);
            return {
                status: 'success',
                message: 'Thinking process deleted successfully',
                action: 'delete',
                payload: { processId }
            };
        }
        catch (error) {
            this.logger.error(`Failed to delete thinking process ${processId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    formatThinkingProcess(thinking) {
        if (!thinking)
            return null;
        const { processId, userId, storyId, type, status, input, output, error, progress, startedAt, completedAt, steps } = thinking;
        const formatted = {
            processId,
            userId,
            storyId,
            type,
            status,
            progress,
            startedAt,
            completedAt,
            stepCount: steps ? steps.length : 0,
            createdAt: thinking['createdAt'],
            updatedAt: thinking['updatedAt']
        };
        if (input)
            formatted['input'] = input;
        if (output && Object.keys(output).length > 0)
            formatted['output'] = output;
        if (error)
            formatted['error'] = error;
        if (steps && steps.length > 0) {
            formatted['latestStep'] = steps[steps.length - 1];
        }
        return formatted;
    }
    async processThinking(processId) {
        try {
            await this.thinkingRepository.update(processId, {
                status: 'in-progress',
                startedAt: new Date(),
                progress: 10
            });
            const thinking = await this.thinkingRepository.findById(processId);
            if (!thinking) {
                throw new Error(`Thinking process ${processId} not found during processing`);
            }
            await this.simulateProcessingStep(processId, {
                stepNumber: 1,
                type: 'initial-analysis',
                status: 'in-progress',
                input: thinking.input,
                startedAt: new Date()
            });
            await this.delay(2000);
            await this.simulateProcessingStep(processId, {
                stepNumber: 1,
                type: 'initial-analysis',
                status: 'completed',
                output: {
                    result: 'Initial analysis completed successfully',
                    insights: ['Insight 1', 'Insight 2']
                },
                completedAt: new Date()
            }, 30);
            await this.simulateProcessingStep(processId, {
                stepNumber: 2,
                type: 'deep-processing',
                status: 'in-progress',
                input: {
                    previousStep: 'initial-analysis',
                    context: thinking.input.context
                },
                startedAt: new Date()
            });
            await this.delay(3000);
            await this.simulateProcessingStep(processId, {
                stepNumber: 2,
                type: 'deep-processing',
                status: 'completed',
                output: {
                    result: 'Deep processing completed successfully',
                    recommendations: ['Recommendation 1', 'Recommendation 2']
                },
                completedAt: new Date()
            }, 70);
            await this.simulateProcessingStep(processId, {
                stepNumber: 3,
                type: 'final-synthesis',
                status: 'in-progress',
                input: {
                    previousSteps: [1, 2],
                    finalContext: 'Synthesizing all findings'
                },
                startedAt: new Date()
            });
            await this.delay(2000);
            await this.thinkingRepository.update(processId, {
                status: 'completed',
                progress: 100,
                completedAt: new Date(),
                output: {
                    summary: 'Thinking process completed successfully',
                    keyFindings: [
                        'Finding 1: The story structure is well-balanced',
                        'Finding 2: Character motivations need more development',
                        'Finding 3: The world building has strong elements but lacks consistency'
                    ],
                    recommendations: [
                        'Clarify the protagonist\'s journey',
                        'Develop stronger connections between characters',
                        'Establish clearer rules for the story world'
                    ]
                }
            });
            const updatedThinking = await this.thinkingRepository.findById(processId);
            const steps = updatedThinking.steps || [];
            const lastStepIndex = steps.findIndex(s => s.stepNumber === 3);
            if (lastStepIndex >= 0) {
                steps[lastStepIndex] = {
                    ...steps[lastStepIndex],
                    status: 'completed',
                    output: {
                        result: 'Final synthesis completed successfully',
                        summary: 'All steps completed and synthesized'
                    },
                    completedAt: new Date()
                };
                await this.thinkingRepository.update(processId, { steps });
            }
            this.logger.log(`Thinking process ${processId} completed successfully`);
        }
        catch (error) {
            this.logger.error(`Error processing thinking ${processId}: ${error.message}`, error.stack);
            await this.thinkingRepository.update(processId, {
                status: 'failed',
                completedAt: new Date(),
                error: {
                    message: error.message,
                    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
                }
            });
        }
    }
    async simulateProcessingStep(processId, stepData, progress) {
        try {
            const thinking = await this.thinkingRepository.findById(processId);
            if (!thinking) {
                throw new Error(`Thinking process ${processId} not found during step processing`);
            }
            const steps = [...(thinking.steps || [])];
            const stepIndex = steps.findIndex(s => s.stepNumber === stepData.stepNumber);
            if (stepIndex >= 0) {
                steps[stepIndex] = {
                    ...steps[stepIndex],
                    ...stepData
                };
            }
            else {
                steps.push(stepData);
            }
            const updateData = { steps };
            if (progress !== undefined) {
                updateData.progress = progress;
            }
            await this.thinkingRepository.update(processId, updateData);
        }
        catch (error) {
            this.logger.error(`Error in step processing for ${processId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
exports.ThinkingService = ThinkingService;
exports.ThinkingService = ThinkingService = ThinkingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [thinking_repository_1.ThinkingRepository,
        config_1.ConfigService])
], ThinkingService);
//# sourceMappingURL=thinking.service.js.map