import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EverartController } from './everart.controller';
import { EverartService } from './everart.service';
import { Artwork, ArtworkSchema } from './schemas/artwork.schema';
import { ArtworkRepository } from './repositories/artwork.repository';
import { Style, StyleSchema } from './schemas/style.schema';
import { StyleRepository } from './repositories/style.repository';
import { AuthModule } from '../auth/auth.module';
import { MCPLoggerModule } from '../../../shared/logging';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Artwork.name, schema: ArtworkSchema },
      { name: Style.name, schema: StyleSchema },
    ]),
    AuthModule,
  ],
  controllers: [EverartController],
  providers: [EverartService, ArtworkRepository, StyleRepository],
  exports: [EverartService],
})
export class EverartModule {}
