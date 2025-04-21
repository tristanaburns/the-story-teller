import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Get ConfigService
  const configService = app.get(ConfigService);
  
  // Enable validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Enable CORS
  app.enableCors();

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Sequential Thinking MCP API')
    .setDescription('API for Sequential Thinking MCP Server for The Story Teller')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Get port from environment or use default
  const port = configService.get<number>('PORT', 3003);
  
  await app.listen(port);
  console.log(`Sequential Thinking MCP Server is running on: ${await app.getUrl()}`);
}

bootstrap();
