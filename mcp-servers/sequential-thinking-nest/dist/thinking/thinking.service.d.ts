import { ConfigService } from '@nestjs/config';
import { ThinkingRepository } from './repositories/thinking.repository';
import { CreateThinkingDto } from './dto/create-thinking.dto';
import { UpdateThinkingDto } from './dto/update-thinking.dto';
import { ThinkingResponseDto } from './dto/thinking-response.dto';
export declare class ThinkingService {
    private readonly thinkingRepository;
    private readonly configService;
    private readonly logger;
    constructor(thinkingRepository: ThinkingRepository, configService: ConfigService);
    createThinkingProcess(createThinkingDto: CreateThinkingDto): Promise<ThinkingResponseDto>;
    getThinkingProcess(processId: string): Promise<ThinkingResponseDto>;
    getThinkingProcessesByUserId(userId: string, limit?: number, offset?: number): Promise<ThinkingResponseDto>;
    getThinkingProcessesByStoryId(storyId: string, limit?: number, offset?: number): Promise<ThinkingResponseDto>;
    updateThinkingProcess(processId: string, updateThinkingDto: UpdateThinkingDto): Promise<ThinkingResponseDto>;
    deleteThinkingProcess(processId: string): Promise<ThinkingResponseDto>;
    private formatThinkingProcess;
    private processThinking;
    private simulateProcessingStep;
    private delay;
}
