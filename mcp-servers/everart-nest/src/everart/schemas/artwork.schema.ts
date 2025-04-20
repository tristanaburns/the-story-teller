import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ArtworkDocument = Artwork & Document;

@Schema({ timestamps: true })
export class Artwork {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  storyId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  type: string; // character-portrait, location-visualization, scene-illustration

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: false })
  thumbnailUrl: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  metadata: Record<string, any>;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: String, ref: 'Style', required: false })
  styleId: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  generationParams: Record<string, any>;

  @Prop({ type: [String], default: [] })
  relatedEntities: string[]; // IDs of related characters, locations, etc.

  @Prop({ default: false })
  isFavorite: boolean;

  @Prop({ default: false })
  isArchived: boolean;

  @Prop({ default: 0 })
  version: number;

  @Prop({ type: [{ type: String }], default: [] })
  previousVersions: string[]; // Array of previous artwork IDs
}

export const ArtworkSchema = SchemaFactory.createForClass(Artwork);

// Create indexes
ArtworkSchema.index({ userId: 1 });
ArtworkSchema.index({ storyId: 1 });
ArtworkSchema.index({ type: 1 });
ArtworkSchema.index({ tags: 1 });
ArtworkSchema.index({ styleId: 1 });
ArtworkSchema.index({ relatedEntities: 1 });
