"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const fs = require("fs");
const path = require("path");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter(), new http_exception_filter_1.HttpExceptionFilter());
    let version = '1.0.0';
    try {
        const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
        version = packageJson.version;
    }
    catch (error) {
        logger.warn(`Could not read package.json version: ${error.message}`);
    }
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Memory MCP API')
        .setDescription('The Memory MCP API for The Story Teller')
        .setVersion(version)
        .addTag('memory', 'Memory operations')
        .addTag('health', 'Health check endpoints')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter API key',
        in: 'header',
    }, 'API Key')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    if (process.env.NODE_ENV === 'development') {
        fs.writeFileSync(path.join(process.cwd(), 'swagger.json'), JSON.stringify(document, null, 2));
        logger.log('Swagger JSON file has been written');
    }
    swagger_1.SwaggerModule.setup('api', app, document);
    const port = process.env.PORT || 3001;
    await app.listen(port);
    logger.log(`Memory MCP server running on port ${port}`);
    logger.log(`Swagger API documentation available at http://localhost:${port}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map