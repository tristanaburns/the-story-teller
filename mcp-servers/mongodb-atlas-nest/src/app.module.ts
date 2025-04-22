import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongodbModule } from './mongodb/mongodb.module';
import { AuthModule } from './auth/auth.module';
import { MCPLoggerModule } from '../../shared/logging';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        dbName: configService.get<string>('MONGODB_DB_NAME', 'mongodb-atlas-mcp'),
      }),
    }),
    MCPLoggerModule.forRoot({
      useGlobalInterceptor: true,
      consoleLogLevel: process.env.LOG_LEVEL || 'debug',
      mongoLogLevel: process.env.MONGODB_LOG_LEVEL || 'info',
      disableMongoTransport: process.env.DISABLE_MONGO_LOGGING === 'true',
    }),
    MongodbModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
