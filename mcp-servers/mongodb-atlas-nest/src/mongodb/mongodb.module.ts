import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongodbController } from './mongodb.controller';
import { MongodbService } from './mongodb.service';
import { DatabaseOperation, DatabaseOperationSchema } from './schemas/database-operation.schema';
import { SchemaDefinition, SchemaDefinitionSchema } from './schemas/schema-definition.schema';
import { DatabaseOperationRepository } from './repositories/database-operation.repository';
import { SchemaDefinitionRepository } from './repositories/schema-definition.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DatabaseOperation.name, schema: DatabaseOperationSchema },
      { name: SchemaDefinition.name, schema: SchemaDefinitionSchema },
    ]),
  ],
  controllers: [MongodbController],
  providers: [
    MongodbService,
    DatabaseOperationRepository,
    SchemaDefinitionRepository
  ],
  exports: [
    MongodbService
  ],
})
export class MongodbModule {}
