import { MemoryService } from './memory.service';
import { StoreMemoryDto, RetrieveMemoryDto, SearchMemoriesDto, ConsolidateMemoriesDto, RankMemoriesDto, DeleteMemoryDto, BaseMCPResponseDto, HealthCheckResponseDto } from './dto';
export declare class MemoryController {
    private readonly memoryService;
    private readonly logger;
    constructor(memoryService: MemoryService);
    getHealth(): Promise<HealthCheckResponseDto>;
    processRequest(requestDto: any): Promise<BaseMCPResponseDto>;
    storeMemory(storeMemoryDto: StoreMemoryDto): Promise<BaseMCPResponseDto>;
    retrieveMemory(retrieveMemoryDto: RetrieveMemoryDto): Promise<BaseMCPResponseDto>;
    searchMemories(searchMemoriesDto: SearchMemoriesDto): Promise<BaseMCPResponseDto>;
    consolidateMemories(consolidateMemoriesDto: ConsolidateMemoriesDto): Promise<BaseMCPResponseDto>;
    rankMemories(rankMemoriesDto: RankMemoriesDto): Promise<BaseMCPResponseDto>;
    deleteMemory(deleteMemoryDto: DeleteMemoryDto): Promise<BaseMCPResponseDto>;
    private generateResponseId;
}
