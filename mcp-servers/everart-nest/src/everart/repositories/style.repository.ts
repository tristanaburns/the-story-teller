import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Style, StyleDocument } from '../schemas/style.schema';
import { GetStylesRequestDto, StyleScope } from '../dto/style.dto';
import { MCPLoggerService } from '../../../../shared/logging';
import { LogClass, LogMethod } from '../../../../shared/logging/method-logger.decorator';

@Injectable()
@LogClass({ level: 'debug', logParameters: true })
export class StyleRepository {
  constructor(
    @InjectModel(Style.name) private styleModel: Model<StyleDocument>,
    private readonly logger: MCPLoggerService,
  ) {
    this.logger.setContext('StyleRepository');
  }

  async create(style: Partial<Style>): Promise<Style> {
    const createdStyle = new this.styleModel(style);
    return createdStyle.save();
  }

  async findById(styleId: string): Promise<Style> {
    return this.styleModel.findById(styleId).exec();
  }

  async findAll(query: GetStylesRequestDto): Promise<Style[]> {
    const { 
      userId, 
      storyId, 
      scope, 
      tags, 
      includeSystem = true, 
      includeInactive = false, 
      searchQuery 
    } = query;

    // Build the filter object
    const filter: any = {};

    // Handle user and story specific styles
    if (scope === StyleScope.PUBLIC) {
      filter.scope = StyleScope.PUBLIC;
    } else if (scope === StyleScope.USER) {
      filter.$or = [
        { scope: StyleScope.PUBLIC },
        { scope: StyleScope.USER, userId }
      ];
    } else if (scope === StyleScope.STORY) {
      filter.$or = [
        { scope: StyleScope.PUBLIC },
        { scope: StyleScope.USER, userId },
        { scope: StyleScope.STORY, storyId }
      ];
    } else {
      // Default: show all accessible styles
      filter.$or = [
        { scope: StyleScope.PUBLIC },
        { scope: StyleScope.USER, userId },
        { scope: StyleScope.STORY, storyId }
      ];
    }

    // Add tag filtering if provided
    if (tags && tags.length > 0) {
      filter.tags = { $in: tags };
    }

    // Handle system styles
    if (!includeSystem) {
      filter.isSystem = false;
    }

    // Handle inactive styles
    if (!includeInactive) {
      filter.isActive = true;
    }

    // Add text search if provided
    if (searchQuery) {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
        ]
      });
    }

    return this.styleModel
      .find(filter)
      .sort({ isSystem: -1, name: 1 })
      .exec();
  }

  async update(styleId: string, updateData: Partial<Style>): Promise<Style> {
    return this.styleModel
      .findByIdAndUpdate(styleId, { $set: updateData }, { new: true })
      .exec();
  }

  async delete(styleId: string): Promise<boolean> {
    const result = await this.styleModel.deleteOne({ _id: styleId }).exec();
    return result.deletedCount > 0;
  }

  async findDefaultStyle(): Promise<Style> {
    return this.styleModel
      .findOne({ isSystem: true, name: 'Default' })
      .exec();
  }

  @LogMethod({ level: 'debug' })
  async createSystemStyles(): Promise<void> {
    // Check if we already have system styles
    const count = await this.styleModel.countDocuments({ isSystem: true }).exec();
    if (count > 0) {
      this.logger.debug(`System styles already exist (${count} styles found)`);
      return;
    }

    this.logger.info('Creating default system styles');

    const defaultStyles = [
      {
        name: 'Default',
        description: 'Default style with balanced parameters',
        previewImageUrl: '/styles/default.jpg',
        scope: StyleScope.PUBLIC,
        isSystem: true,
        isActive: true,
        parameters: {
          colorPalette: 'balanced',
          lighting: 'natural',
          contrast: 'medium'
        },
        tags: ['default', 'balanced', 'natural']
      },
      {
        name: 'Cyberpunk',
        description: 'Neon-lit cyberpunk aesthetic with vibrant colors and futuristic technology',
        previewImageUrl: '/styles/cyberpunk.jpg',
        scope: StyleScope.PUBLIC,
        isSystem: true,
        isActive: true,
        parameters: {
          colorPalette: 'neon',
          lighting: 'dramatic',
          contrast: 'high'
        },
        tags: ['cyberpunk', 'neon', 'futuristic']
      },
      {
        name: 'Fantasy',
        description: 'High fantasy style with mystical elements and rich, detailed environments',
        previewImageUrl: '/styles/fantasy.jpg',
        scope: StyleScope.PUBLIC,
        isSystem: true,
        isActive: true,
        parameters: {
          colorPalette: 'rich',
          lighting: 'magical',
          contrast: 'medium-high'
        },
        tags: ['fantasy', 'magical', 'detailed']
      },
      {
        name: 'Noir',
        description: 'Film noir style with high contrast, shadows, and moody atmosphere',
        previewImageUrl: '/styles/noir.jpg',
        scope: StyleScope.PUBLIC,
        isSystem: true,
        isActive: true,
        parameters: {
          colorPalette: 'monochrome',
          lighting: 'dramatic',
          contrast: 'very-high'
        },
        tags: ['noir', 'monochrome', 'dramatic']
      },
      {
        name: 'Anime',
        description: 'Anime-inspired style with vibrant colors and distinctive character designs',
        previewImageUrl: '/styles/anime.jpg',
        scope: StyleScope.PUBLIC,
        isSystem: true,
        isActive: true,
        parameters: {
          colorPalette: 'vibrant',
          lighting: 'flat',
          contrast: 'medium'
        },
        tags: ['anime', 'vibrant', 'stylized']
      }
    ];

    await this.styleModel.insertMany(defaultStyles);
    this.logger.info(`Created ${defaultStyles.length} system styles`);
  }
}
