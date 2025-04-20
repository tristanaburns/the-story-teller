import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Artwork, ArtworkDocument } from '../schemas/artwork.schema';
import { GetArtworkRequestDto } from '../dto/get-artwork.dto';
import { UpdateArtworkRequestDto } from '../dto/update-artwork.dto';

@Injectable()
export class ArtworkRepository {
  constructor(
    @InjectModel(Artwork.name) private artworkModel: Model<ArtworkDocument>,
  ) {}

  async create(artwork: Partial<Artwork>): Promise<Artwork> {
    const createdArtwork = new this.artworkModel(artwork);
    return createdArtwork.save();
  }

  async findById(artworkId: string): Promise<Artwork> {
    return this.artworkModel.findById(artworkId).exec();
  }

  async findAll(query: GetArtworkRequestDto): Promise<Artwork[]> {
    const { 
      userId, 
      storyId, 
      artworkType, 
      entityId, 
      styleId, 
      tags, 
      includeArchived = false, 
      isFavorite, 
      searchQuery,
      limit = 10,
      offset = 0
    } = query;

    const filter: any = { userId, storyId };

    // Add optional filters if provided
    if (artworkType) filter.type = artworkType;
    if (styleId) filter.styleId = styleId;
    if (entityId) filter.relatedEntities = entityId;
    if (tags && tags.length > 0) filter.tags = { $in: tags };
    if (typeof isFavorite === 'boolean') filter.isFavorite = isFavorite;
    
    // Handle archived filter
    if (!includeArchived) filter.isArchived = false;

    // Add text search if provided
    if (searchQuery) {
      filter.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
      ];
    }

    return this.artworkModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();
  }

  async count(query: GetArtworkRequestDto): Promise<number> {
    const { 
      userId, 
      storyId, 
      artworkType, 
      entityId, 
      styleId, 
      tags, 
      includeArchived = false, 
      isFavorite, 
      searchQuery 
    } = query;

    const filter: any = { userId, storyId };

    // Add optional filters if provided
    if (artworkType) filter.type = artworkType;
    if (styleId) filter.styleId = styleId;
    if (entityId) filter.relatedEntities = entityId;
    if (tags && tags.length > 0) filter.tags = { $in: tags };
    if (typeof isFavorite === 'boolean') filter.isFavorite = isFavorite;
    
    // Handle archived filter
    if (!includeArchived) filter.isArchived = false;

    // Add text search if provided
    if (searchQuery) {
      filter.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
      ];
    }

    return this.artworkModel.countDocuments(filter).exec();
  }

  async update(artworkId: string, updateData: Partial<Artwork>): Promise<Artwork> {
    return this.artworkModel
      .findByIdAndUpdate(artworkId, { $set: updateData }, { new: true })
      .exec();
  }

  async delete(artworkId: string): Promise<boolean> {
    const result = await this.artworkModel.deleteOne({ _id: artworkId }).exec();
    return result.deletedCount > 0;
  }

  async archive(artworkId: string): Promise<Artwork> {
    return this.update(artworkId, { isArchived: true });
  }

  async unarchive(artworkId: string): Promise<Artwork> {
    return this.update(artworkId, { isArchived: false });
  }

  async setFavorite(artworkId: string, isFavorite: boolean): Promise<Artwork> {
    return this.update(artworkId, { isFavorite });
  }

  async findByRelatedEntity(entityId: string, userId: string, storyId: string): Promise<Artwork[]> {
    return this.artworkModel
      .find({
        userId,
        storyId,
        relatedEntities: entityId,
        isArchived: false,
      })
      .sort({ createdAt: -1 })
      .exec();
  }
}
