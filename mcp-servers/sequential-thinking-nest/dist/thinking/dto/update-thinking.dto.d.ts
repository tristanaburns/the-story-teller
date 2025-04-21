export declare class UpdateThinkingDto {
    status?: string;
    output?: Record<string, any>;
    error?: Record<string, any>;
    progress?: number;
    startedAt?: Date;
    completedAt?: Date;
    step?: {
        stepNumber: number;
        type: string;
        status: string;
        input?: Record<string, any>;
        output?: Record<string, any>;
        error?: Record<string, any>;
        startedAt?: Date;
        completedAt?: Date;
    };
}
