import { Model } from 'mongoose';
import { Memory } from '../schemas/memory.schema';
export declare class MemoryRepository {
    private memoryModel;
    constructor(memoryModel: Model<Memory>);
    create(memoryData: Partial<Memory>): Promise<Memory>;
    findById(id: string, userId: string): Promise<Memory | null>;
    findMany(filter: any, sort?: any): Promise<Memory[]>;
    delete(id: string, userId: string): Promise<boolean>;
    count(filter: any): Promise<number>;
    buildSearchFilter(params: {
        userId: string;
        storyId?: string;
        contextId?: string;
        query?: string;
        tags?: string[];
        timeframe?: {
            start?: string;
            end?: string;
        };
        metadata?: Record<string, any>;
    }): Promise<any>;
}
