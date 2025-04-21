import { Document } from 'mongoose';
export type ThinkingProcessDocument = ThinkingProcess & Document;
export declare class ThinkingProcess {
    processId: string;
    userId: string;
    storyId: string;
    status: string;
    type: string;
    input: Record<string, any>;
    output: Record<string, any>;
    error?: Record<string, any>;
    progress: number;
    startedAt?: Date;
    completedAt?: Date;
    steps: Array<{
        stepNumber: number;
        type: string;
        status: string;
        input?: Record<string, any>;
        output?: Record<string, any>;
        error?: Record<string, any>;
        startedAt?: Date;
        completedAt?: Date;
    }>;
}
export declare const ThinkingProcessSchema: import("mongoose").Schema<ThinkingProcess, import("mongoose").Model<ThinkingProcess, any, any, any, Document<unknown, any, ThinkingProcess> & ThinkingProcess & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ThinkingProcess, Document<unknown, {}, import("mongoose").FlatRecord<ThinkingProcess>> & import("mongoose").FlatRecord<ThinkingProcess> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
