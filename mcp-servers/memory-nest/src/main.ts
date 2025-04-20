import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  
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
    logger.warn(`Could not read package.json version: ${error.message}`);
  }

  // Configure Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Memory MCP API')
    .setDescription('The Memory MCP API for The Story Teller')
    .setVersion(version)
    .addTag('memory', 'Memory operations')
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
    logger.log('Swagger JSON file has been written');
  }
  
  SwaggerModule.setup('api', app, document);

  // Get port from environment or use default
  const port = process.env.PORT || 3001;
  
  await app.listen(port);
  logger.log(`Memory MCP server running on port ${port}`);
  logger.log(`Swagger API documentation available at http://localhost:${port}/api`);
}

bootstrap();
