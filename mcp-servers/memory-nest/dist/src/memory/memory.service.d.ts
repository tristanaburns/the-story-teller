import { MemoryRepository } from './repositories/memory.repository';
import { StoreMemoryDto, RetrieveMemoryDto, SearchMemoriesDto, ConsolidateMemoriesDto, RankMemoriesDto, DeleteMemoryDto, BaseMCPResponseDto, HealthCheckResponseDto } from './dto';
import { ConfigService } from '@nestjs/config';
export declare class MemoryService {
    private memoryRepository;
    private configService;
    constructor(memoryRepository: MemoryRepository, configService: ConfigService);
    getHealth(): Promise<HealthCheckResponseDto>;
    storeMemory(dto: StoreMemoryDto): Promise<BaseMCPResponseDto>;
    retrieveMemory(dto: RetrieveMemoryDto): Promise<BaseMCPResponseDto>;
    searchMemories(dto: SearchMemoriesDto): Promise<BaseMCPResponseDto>;
    consolidateMemories(dto: ConsolidateMemoriesDto): Promise<BaseMCPResponseDto>;
    rankMemories(dto: RankMemoriesDto): Promise<BaseMCPResponseDto>;
    deleteMemory(dto: DeleteMemoryDto): Promise<BaseMCPResponseDto>;
    private generateResponseId;
}
