/**
 * Mongoose schema for thinking processes in Sequential Thinking MCP Server.
 * This schema defines the structure of thinking process documents in MongoDB.
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ThinkingProcessDocument = ThinkingProcess & Document;

export type ThinkingStep = {
  stepNumber: number;
  type: string;
  status: string;
  input?: any;
  output?: any;
  startedAt?: Date;
  completedAt?: Date;
};

@Schema({ timestamps: true })
export class ThinkingProcess extends Document {
  @ApiProperty({ description: 'Unique identifier of the thinking process' })
  @Prop({ required: true, unique: true })
  processId: string;

  @ApiProperty({ description: 'User ID who owns this thinking process' })
  @Prop({ required: true })
  userId: string;

  @ApiProperty({ description: 'Story ID this thinking process is associated with' })
  @Prop()
  storyId?: string;

  @ApiProperty({ description: 'Current status of the thinking process' })
  @Prop({ required: true, enum: ['pending', 'in-progress', 'completed', 'failed'], default: 'pending' })
  status: string;

  @ApiProperty({ description: 'Type of thinking process' })
  @Prop({ required: true })
  type: string;

  @ApiProperty({ description: 'Input data for the thinking process' })
  @Prop({ type: Object })
  input: any;

  @ApiProperty({ description: 'Output data from the thinking process' })
  @Prop({ type: Object })
  output: any;

  @ApiProperty({ description: 'Error details if the process failed' })
  @Prop({ type: Object })
  error: any;

  @ApiProperty({ description: 'Progress of the thinking process (0-100)' })
  @Prop({ default: 0 })
  progress: number;

  @ApiProperty({ description: 'Timestamp when the thinking process started' })
  @Prop()
  startedAt?: Date;

  @ApiProperty({ description: 'Timestamp when the thinking process completed' })
  @Prop()
  completedAt?: Date;

  @ApiProperty({ description: 'Intermediate steps in the thinking process' })
  @Prop({ type: Array })
  steps: ThinkingStep[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ThinkingProcessSchema = SchemaFactory.createForClass(ThinkingProcess); 