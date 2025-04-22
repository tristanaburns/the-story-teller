import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { MCPLoggerService } from '../../shared/logging';

async function bootstrap() {
  // Create the application with buffered logs
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  
  // Get the logger from the application context
  const logger = app.get(MCPLoggerService);
  logger.setContext('Bootstrap');
  
  // Set the logger as the application logger
  app.useLogger(logger);
  
  // Enable CORS
  app.enableCors();
  
  // Use global validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  // Set up Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Everart MCP Server')
    .setDescription('The Everart Model Context Protocol server API for The Story Teller')
    .setVersion('1.0')
    .addTag('everart')
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'api-key')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  const port = process.env.PORT || 3002;
  await app.listen(port);
  logger.info(`Everart MCP Server running on port ${port}`);
  logger.info(`Swagger API documentation available at http://localhost:${port}/api`);
}

bootstrap();
