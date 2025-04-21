import { Document } from 'mongoose';
export declare class Memory extends Document {
    userId: string;
    content: string;
    importance: number;
    tags: string[];
    metadata: Record<string, any>;
    timestamp: number;
    contextId: string;
}
export declare const MemorySchema: import("mongoose").Schema<Memory, import("mongoose").Model<Memory, any, any, any, Document<unknown, any, Memory> & Memory & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Memory, Document<unknown, {}, import("mongoose").FlatRecord<Memory>> & import("mongoose").FlatRecord<Memory> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
