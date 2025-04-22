import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EverartModule } from './everart/everart.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { MCPLoggerModule } from '../../shared/logging';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/everart-mcp',
      }),
      inject: [ConfigService],
    }),
    MCPLoggerModule.forRoot({
      useGlobalInterceptor: true,
      consoleLogLevel: process.env.LOG_LEVEL || 'debug',
      mongoLogLevel: process.env.MONGODB_LOG_LEVEL || 'info',
      disableMongoTransport: process.env.DISABLE_MONGO_LOGGING === 'true',
    }),
    EverartModule,
    AuthModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
