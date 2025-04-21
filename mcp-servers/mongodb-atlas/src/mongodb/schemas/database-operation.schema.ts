import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type DatabaseOperationType = 'create' | 'read' | 'update' | 'delete' | 'query' | 'schema' | 'search';

@Schema({
  timestamps: true,
  collection: 'database_operations',
})
export class DatabaseOperation extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  requestId: string;

  @Prop({ required: true })
  responseId: string;

  @Prop({ required: true, enum: ['create', 'read', 'update', 'delete', 'query', 'schema', 'search'] })
  operationType: DatabaseOperationType;

  @Prop({ required: true })
  databaseName: string;

  @Prop({ required: true })
  collectionName: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: false })
  query: Record<string, any>;

  @Prop({ type: MongooseSchema.Types.Mixed, required: false })
  data: Record<string, any>;

  @Prop({ type: MongooseSchema.Types.Mixed, required: false })
  result: Record<string, any>;

  @Prop({ required: false })
  executionTimeMs: number;

  @Prop({ default: false })
  isSuccessful: boolean;

  @Prop({ required: false })
  errorMessage: string;

  @Prop({ default: Date.now })
  timestamp: number;
}

export const DatabaseOperationSchema = SchemaFactory.createForClass(DatabaseOperation);

// Add indexes
DatabaseOperationSchema.index({ userId: 1, timestamp: -1 });
DatabaseOperationSchema.index({ requestId: 1 });
DatabaseOperationSchema.index({ operationType: 1, timestamp: -1 });
DatabaseOperationSchema.index({ databaseName: 1, collectionName: 1, timestamp: -1 });
