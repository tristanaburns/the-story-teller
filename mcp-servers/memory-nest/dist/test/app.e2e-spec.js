"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const request = require("supertest");
const app_module_1 = require("../src/app.module");
const http_exception_filter_1 = require("../src/common/filters/http-exception.filter");
const all_exceptions_filter_1 = require("../src/common/filters/all-exceptions.filter");
const mongoose_1 = require("@nestjs/mongoose");
const memory_schema_1 = require("../src/memory/schemas/memory.schema");
describe('MemoryController (e2e)', () => {
    let app;
    const mockMemoryModel = {
        findOne: jest.fn(),
        find: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn(),
        countDocuments: jest.fn().mockReturnThis(),
    };
    beforeEach(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        })
            .overrideProvider((0, mongoose_1.getModelToken)(memory_schema_1.Memory.name))
            .useValue(mockMemoryModel)
            .compile();
        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }));
        app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter(), new http_exception_filter_1.HttpExceptionFilter());
        await app.init();
    });
    afterAll(async () => {
        await app.close();
    });
    it('/health (GET)', () => {
        return request(app.getHttpServer())
            .get('/health')
            .expect(200)
            .expect((res) => {
            expect(res.body).toHaveProperty('status', 'ok');
            expect(res.body).toHaveProperty('serverId', 'memory-mcp');
        });
    });
});
//# sourceMappingURL=app.e2e-spec.js.map