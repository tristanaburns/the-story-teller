import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ThinkingController } from './thinking.controller';
import { ThinkingService } from './thinking.service';
import { ThinkingProcess, ThinkingProcessSchema } from './schemas/thinking.schema';
import { ThinkingRepository } from './repositories/thinking.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ThinkingProcess.name, schema: ThinkingProcessSchema }
    ])
  ],
  controllers: [ThinkingController],
  providers: [ThinkingService, ThinkingRepository],
  exports: [ThinkingService, ThinkingRepository]
})
export class ThinkingModule {}
