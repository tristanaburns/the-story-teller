import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MemoryController } from './memory.controller';
import { MemoryService } from './memory.service';
import { Memory, MemorySchema } from './schemas/memory.schema';
import { MemoryRepository } from './repositories/memory.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Memory.name, schema: MemorySchema }
    ])
  ],
  controllers: [MemoryController],
  providers: [MemoryService, MemoryRepository],
  exports: [MemoryService, MemoryRepository]
})
export class MemoryModule {}
