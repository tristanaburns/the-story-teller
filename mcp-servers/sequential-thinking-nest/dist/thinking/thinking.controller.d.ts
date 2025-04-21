import { ThinkingService } from './thinking.service';
import { CreateThinkingDto } from './dto/create-thinking.dto';
import { UpdateThinkingDto } from './dto/update-thinking.dto';
import { ThinkingResponseDto } from './dto/thinking-response.dto';
export declare class ThinkingController {
    private readonly thinkingService;
    constructor(thinkingService: ThinkingService);
    createThinkingProcess(createThinkingDto: CreateThinkingDto): Promise<ThinkingResponseDto>;
    getThinkingProcess(processId: string): Promise<ThinkingResponseDto>;
    getThinkingProcessesByUserId(userId: string, limit: number, offset: number): Promise<ThinkingResponseDto>;
    getThinkingProcessesByStoryId(storyId: string, limit: number, offset: number): Promise<ThinkingResponseDto>;
    updateThinkingProcess(processId: string, updateThinkingDto: UpdateThinkingDto): Promise<ThinkingResponseDto>;
    deleteThinkingProcess(processId: string): Promise<ThinkingResponseDto>;
}
