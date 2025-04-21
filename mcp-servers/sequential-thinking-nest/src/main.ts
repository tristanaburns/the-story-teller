/**
 * Main application bootstrap file for Sequential Thinking MCP Server.
 * This file initializes the NestJS application, sets up global pipes, CORS,
 * Swagger documentation, and starts the HTTP server.
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
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
    .addTag('sequential-thinking')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  
  // Write Swagger JSON to file for development purposes
  if (process.env.NODE_ENV === 'development') {
    try {
      const outputPath = path.resolve(process.cwd(), 'swagger.json');
      fs.writeFileSync(
        outputPath,
        JSON.stringify(document, null, 2),
        { encoding: 'utf8' }
      );
      console.log(`Swagger JSON file written to: ${outputPath}`);
    } catch (error) {
      console.error('Failed to write Swagger JSON file', error);
    }
  }
  
  SwaggerModule.setup('api', app, document);

  // Get port from environment or use default
  const port = configService.get<number>('PORT', 3004);
  
  await app.listen(port);
  console.log(`Sequential Thinking MCP Server is running on: ${await app.getUrl()}`);
}

bootstrap(); 