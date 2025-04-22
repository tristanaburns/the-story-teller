import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { MCPLoggerService } from '../../shared/logging';
import * as fs from 'fs';
import * as path from 'path';

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
  
  // Apply global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Apply global exception filters
  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new HttpExceptionFilter(),
  );

  // Get the package version
  let version = '1.0.0';
  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'),
    );
    version = packageJson.version;
  } catch (error) {
    logger.warn(`Could not read package.json version: ${error.message}`, {
      error: error.message,
      stack: error.stack,
    });
  }

  // Configure Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('MongoDB Atlas MCP API')
    .setDescription('The MongoDB Atlas MCP API for The Story Teller')
    .setVersion(version)
    .addTag('mongodb', 'MongoDB Atlas operations')
    .addTag('schema', 'MongoDB Schema operations')
    .addTag('query', 'Query operations')
    .addTag('health', 'Health check endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter API key',
        in: 'header',
      },
      'API Key',
    )
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  
  // Write the Swagger JSON to file if in development mode
  if (process.env.NODE_ENV === 'development') {
    fs.writeFileSync(
      path.join(process.cwd(), 'swagger.json'),
      JSON.stringify(document, null, 2),
    );
    logger.debug('Swagger JSON file has been written');
  }
  
  SwaggerModule.setup('api', app, document);

  // Get port from environment or use default
  const port = process.env.PORT || 3004;
  
  await app.listen(port);
  logger.info(`MongoDB Atlas MCP server running on port ${port}`);
  logger.info(`Swagger API documentation available at http://localhost:${port}/api`);
}

bootstrap();
