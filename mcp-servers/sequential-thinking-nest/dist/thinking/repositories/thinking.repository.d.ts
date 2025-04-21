import { Model } from 'mongoose';
import { ThinkingProcess, ThinkingProcessDocument } from '../schemas/thinking.schema';
export declare class ThinkingRepository {
    private thinkingModel;
    private readonly logger;
    constructor(thinkingModel: Model<ThinkingProcessDocument>);
    create(thinking: Partial<ThinkingProcess>): Promise<ThinkingProcess>;
    findById(processId: string): Promise<ThinkingProcess | null>;
    findByUserId(userId: string, limit?: number, offset?: number): Promise<ThinkingProcess[]>;
    findByStoryId(storyId: string, limit?: number, offset?: number): Promise<ThinkingProcess[]>;
    update(processId: string, update: Partial<ThinkingProcess>): Promise<ThinkingProcess | null>;
    delete(processId: string): Promise<ThinkingProcess | null>;
    countByUserId(userId: string): Promise<number>;
    countByStoryId(storyId: string): Promise<number>;
}
