import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Memory extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true, default: 1 })
  importance: number;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @Prop({ required: true, default: Date.now })
  timestamp: number;

  @Prop({ required: true, default: 'default' })
  contextId: string;
}

export const MemorySchema = SchemaFactory.createForClass(Memory);

// Create indexes for common query patterns
MemorySchema.index({ userId: 1 });
MemorySchema.index({ 'metadata.storyId': 1 });
MemorySchema.index({ contextId: 1 });
MemorySchema.index({ tags: 1 });
MemorySchema.index({ timestamp: -1 });
MemorySchema.index({ importance: -1 });
