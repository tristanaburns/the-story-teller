import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StyleDocument = Style & Document;

@Schema({ timestamps: true })
export class Style {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  previewImageUrl: string;

  @Prop({ required: true, default: 'public' })
  scope: string; // 'public', 'user', 'story'

  @Prop({ required: false })
  userId: string;

  @Prop({ required: false })
  storyId: string;

  @Prop({ type: Object, default: {} })
  parameters: Record<string, any>;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: false })
  isSystem: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const StyleSchema = SchemaFactory.createForClass(Style);

// Create indexes
StyleSchema.index({ name: 1 });
StyleSchema.index({ scope: 1 });
StyleSchema.index({ userId: 1 });
StyleSchema.index({ storyId: 1 });
StyleSchema.index({ tags: 1 });
StyleSchema.index({ isSystem: 1 });
StyleSchema.index({ isActive: 1 });
