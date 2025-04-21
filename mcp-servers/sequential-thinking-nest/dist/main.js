"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const fs = require("fs");
const path = require("path");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    app.enableCors();
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Sequential Thinking MCP API')
        .setDescription('API for Sequential Thinking MCP Server for The Story Teller')
        .setVersion('1.0')
        .addTag('sequential-thinking')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    if (process.env.NODE_ENV === 'development') {
        try {
            const outputPath = path.resolve(process.cwd(), 'swagger.json');
            fs.writeFileSync(outputPath, JSON.stringify(document, null, 2), { encoding: 'utf8' });
            console.log(`Swagger JSON file written to: ${outputPath}`);
        }
        catch (error) {
            console.error('Failed to write Swagger JSON file', error);
        }
    }
    swagger_1.SwaggerModule.setup('api', app, document);
    const port = configService.get('PORT', 3004);
    await app.listen(port);
    console.log(`Sequential Thinking MCP Server is running on: ${await app.getUrl()}`);
}
bootstrap();
//# sourceMappingURL=main.js.map