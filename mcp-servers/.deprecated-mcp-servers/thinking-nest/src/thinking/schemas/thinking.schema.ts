import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'thinking_processes',
})
export class ThinkingProcess extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, default: [] })
  steps: {
    index: number;
    title: string;
    content: string;
    reasoning: string;
    conclusion: string;
  }[];

  @Prop({ required: true, default: [] })
  conclusions: string[];

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @Prop({ required: true, default: Date.now })
  timestamp: number;

  @Prop({ required: true, default: 'default' })
  contextId: string;

  @Prop({ required: false })
  storyId: string;

  @Prop({ required: true, enum: ['character', 'plot', 'worldbuilding', 'analysis'], default: 'analysis' })
  thinkingType: string;

  @Prop({ required: true, enum: ['in_progress', 'completed', 'abandoned'], default: 'in_progress' })
  status: string;
}

export const ThinkingProcessSchema = SchemaFactory.createForClass(ThinkingProcess);

// Create indexes for common query patterns
ThinkingProcessSchema.index({ userId: 1 });
ThinkingProcessSchema.index({ storyId: 1 });
ThinkingProcessSchema.index({ contextId: 1 });
ThinkingProcessSchema.index({ tags: 1 });
ThinkingProcessSchema.index({ timestamp: -1 });
ThinkingProcessSchema.index({ thinkingType: 1 });
ThinkingProcessSchema.index({ status: 1 });
