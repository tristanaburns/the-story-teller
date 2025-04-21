import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'schema_definitions',
})
export class SchemaDefinition extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  databaseName: string;

  @Prop({ required: true })
  collectionName: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  schema: Record<string, any>;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [String], default: [] })
  validationErrors: string[];

  @Prop({ default: false })
  isDraft: boolean;

  @Prop({ default: 1 })
  version: number;

  @Prop({ required: false })
  description: string;

  @Prop({ default: Date.now })
  createdAt: number;

  @Prop({ default: Date.now })
  updatedAt: number;
}

export const SchemaDefinitionSchema = SchemaFactory.createForClass(SchemaDefinition);

// Add indexes
SchemaDefinitionSchema.index({ userId: 1, databaseName: 1, collectionName: 1 }, { unique: true });
SchemaDefinitionSchema.index({ userId: 1, isActive: 1 });
SchemaDefinitionSchema.index({ databaseName: 1, collectionName: 1, isActive: 1 });
