import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ArtworkRepository } from './repositories/artwork.repository';
import { StyleRepository } from './repositories/style.repository';
import { 
  GenerateArtworkRequestDto,
  GetArtworkRequestDto,
  UpdateArtworkRequestDto,
  CreateStyleRequestDto,
  GetStylesRequestDto,
  UpdateStyleRequestDto
} from './dto';

@Injectable()
export class EverartService {
  constructor(
    private readonly artworkRepository: ArtworkRepository,
    private readonly styleRepository: StyleRepository,
  ) {
    // Initialize system styles
    this.initializeSystemStyles();
  }

  private async initializeSystemStyles(): Promise<void> {
    await this.styleRepository.createSystemStyles();
  }

  // Artwork Methods
  async generateArtwork(request: GenerateArtworkRequestDto): Promise<any> {
    const { 
      requestId, 
      userId, 
      storyId, 
      artworkType, 
      title, 
      description, 
      styleId, 
      entities,
      generationParams,
      tags,
      saveArtwork = true
    } = request;

    // Validate the style if provided
    let style = null;
    if (styleId) {
      style = await this.styleRepository.findById(styleId);
      if (!style) {
        throw new NotFoundException(`Style with ID ${styleId} not found`);
      }
    } else {
      // Use default style
      style = await this.styleRepository.findDefaultStyle();
    }

    // In a real implementation, this would call an AI image generation API
    // For now, we'll simulate the process
    
    // Combine style parameters with generation parameters
    const combinedParams = {
      ...(style?.parameters || {}),
      ...(generationParams || {}),
    };

    // Generate a mock image URL
    // In production, this would be the URL returned from the AI service
    const imageUrl = `https://example.com/generated/${artworkType}/${Date.now()}.png`;
    const thumbnailUrl = `https://example.com/generated/${artworkType}/${Date.now()}_thumb.png`;

    // Prepare related entities
    const relatedEntities = entities?.map(entity => entity.id) || [];

    // Create the artwork record if saveArtwork is true
    let artwork = null;
    if (saveArtwork) {
      artwork = await this.artworkRepository.create({
        userId,
        storyId,
        title,
        description,
        type: artworkType,
        imageUrl,
        thumbnailUrl,
        styleId: style?._id.toString(),
        generationParams: combinedParams,
        tags: tags || [],
        relatedEntities,
        isFavorite: false,
        isArchived: false,
        version: 1,
        previousVersions: [],
        metadata: {
          generatedAt: new Date().toISOString(),
          prompt: description,
          styleParameters: style?.parameters || {},
          entities: entities || [],
        },
      });
    }

    return {
      requestId,
      status: 'success',
      data: {
        artwork: artwork || {
          title,
          description,
          type: artworkType,
          imageUrl,
          thumbnailUrl,
          styleId: style?._id.toString(),
          generationParams: combinedParams,
          tags: tags || [],
          relatedEntities,
          metadata: {
            generatedAt: new Date().toISOString(),
            prompt: description,
          },
        },
      },
    };
  }

  async getArtwork(request: GetArtworkRequestDto): Promise<any> {
    const { requestId, artworkId } = request;

    // If artworkId is provided, return that specific artwork
    if (artworkId) {
      const artwork = await this.artworkRepository.findById(artworkId);
      if (!artwork) {
        throw new NotFoundException(`Artwork with ID ${artworkId} not found`);
      }
      return {
        requestId,
        status: 'success',
        data: { artwork },
      };
    }

    // Otherwise, search with filters
    const artworks = await this.artworkRepository.findAll(request);
    const total = await this.artworkRepository.count(request);

    return {
      requestId,
      status: 'success',
      data: {
        artworks,
        total,
        offset: request.offset || 0,
        limit: request.limit || 10,
      },
    };
  }

  async updateArtwork(request: UpdateArtworkRequestDto): Promise<any> {
    const { 
      requestId, 
      artworkId, 
      title, 
      description, 
      tags, 
      metadata, 
      relatedEntities, 
      isFavorite, 
      isArchived 
    } = request;

    // Find the artwork
    const existingArtwork = await this.artworkRepository.findById(artworkId);
    if (!existingArtwork) {
      throw new NotFoundException(`Artwork with ID ${artworkId} not found`);
    }

    // Update the artwork
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (tags !== undefined) updateData.tags = tags;
    if (metadata !== undefined) updateData.metadata = { ...existingArtwork.metadata, ...metadata };
    if (relatedEntities !== undefined) updateData.relatedEntities = relatedEntities;
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite;
    if (isArchived !== undefined) updateData.isArchived = isArchived;

    const updatedArtwork = await this.artworkRepository.update(artworkId, updateData);

    return {
      requestId,
      status: 'success',
      data: { artwork: updatedArtwork },
    };
  }

  async deleteArtwork(artworkId: string, requestId: string): Promise<any> {
    const success = await this.artworkRepository.delete(artworkId);
    if (!success) {
      throw new NotFoundException(`Artwork with ID ${artworkId} not found`);
    }

    return {
      requestId,
      status: 'success',
      data: { deleted: true },
    };
  }

  // Style Methods
  async createStyle(request: CreateStyleRequestDto): Promise<any> {
    const { 
      requestId, 
      userId, 
      storyId, 
      name, 
      description, 
      previewImageUrl, 
      scope = 'user', 
      parameters, 
      tags 
    } = request;

    // Create the style
    const style = await this.styleRepository.create({
      name,
      description,
      previewImageUrl,
      scope,
      userId,
      storyId: scope === 'story' ? storyId : undefined,
      parameters: parameters || {},
      tags: tags || [],
      isSystem: false,
      isActive: true,
    });

    return {
      requestId,
      status: 'success',
      data: { style },
    };
  }

  async getStyles(request: GetStylesRequestDto): Promise<any> {
    const { requestId, styleId } = request;

    // If styleId is provided, return that specific style
    if (styleId) {
      const style = await this.styleRepository.findById(styleId);
      if (!style) {
        throw new NotFoundException(`Style with ID ${styleId} not found`);
      }
      return {
        requestId,
        status: 'success',
        data: { style },
      };
    }

    // Otherwise, search with filters
    const styles = await this.styleRepository.findAll(request);

    return {
      requestId,
      status: 'success',
      data: { styles },
    };
  }

  async updateStyle(request: UpdateStyleRequestDto): Promise<any> {
    const { 
      requestId, 
      styleId, 
      name, 
      description, 
      previewImageUrl, 
      parameters, 
      tags, 
      isActive 
    } = request;

    // Find the style
    const existingStyle = await this.styleRepository.findById(styleId);
    if (!existingStyle) {
      throw new NotFoundException(`Style with ID ${styleId} not found`);
    }

    // Don't allow updating system styles except for isActive
    if (existingStyle.isSystem && (name !== undefined || description !== undefined || previewImageUrl !== undefined || parameters !== undefined || tags !== undefined)) {
      throw new BadRequestException('System styles cannot be modified');
    }

    // Update the style
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (previewImageUrl !== undefined) updateData.previewImageUrl = previewImageUrl;
    if (parameters !== undefined) updateData.parameters = { ...existingStyle.parameters, ...parameters };
    if (tags !== undefined) updateData.tags = tags;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedStyle = await this.styleRepository.update(styleId, updateData);

    return {
      requestId,
      status: 'success',
      data: { style: updatedStyle },
    };
  }

  async deleteStyle(styleId: string, requestId: string): Promise<any> {
    // Check if it's a system style
    const style = await this.styleRepository.findById(styleId);
    if (!style) {
      throw new NotFoundException(`Style with ID ${styleId} not found`);
    }

    if (style.isSystem) {
      throw new BadRequestException('System styles cannot be deleted');
    }

    const success = await this.styleRepository.delete(styleId);

    return {
      requestId,
      status: 'success',
      data: { deleted: success },
    };
  }
}
