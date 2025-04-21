/**
 * Thinking module for the Sequential Thinking MCP Server.
 * This module handles sequential thinking processes and operations.
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ThinkingController } from './thinking.controller';
import { ThinkingService } from './thinking.service';
import { ThinkingRepository } from './repositories/thinking.repository';
import { ThinkingProcess, ThinkingProcessSchema } from './schemas/thinking.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ThinkingProcess.name, schema: ThinkingProcessSchema }
    ])
  ],
  controllers: [ThinkingController],
  providers: [ThinkingService, ThinkingRepository],
  exports: [ThinkingService]
})
export class ThinkingModule {} 