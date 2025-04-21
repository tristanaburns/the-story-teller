import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // If this is an HTTP exception, let the HTTP exception filter handle it
    if (exception instanceof HttpException) {
      return;
    }

    const status = HttpStatus.INTERNAL_SERVER_ERROR;

    // Get request ID and action from body if available
    const requestId = request.body?.requestId || 'unknown';
    const action = request.body?.action || 'unknown';

    // Determine the error message
    let errorMessage = 'Internal server error';
    if (exception instanceof Error) {
      errorMessage = exception.message;
      
      // Log complete error details including stack trace
      this.logger.error(
        `Unhandled exception: ${errorMessage}`,
        {
          stack: exception.stack,
          requestId,
          action,
          path: request.url,
          method: request.method,
          body: request.body,
          timestamp: new Date().toISOString(),
          correlationId: request.headers['x-correlation-id'] || 'none',
          userAgent: request.headers['user-agent'],
        }
      );
    } else {
      // Log unknown error type
      this.logger.error(
        `Unhandled exception of unknown type: ${exception}`,
        {
          requestId,
          action,
          path: request.url,
          method: request.method,
          timestamp: new Date().toISOString(),
        }
      );
    }

    // Create a standardized MCP error response
    const mcpErrorResponse = {
      serverId: 'mongodb-atlas-mcp',
      action,
      status: 'error',
      error: errorMessage,
      requestId,
      responseId: 'res_' + Math.random().toString(36).substring(2, 15),
      timestamp: Date.now(),
      payload: null,
    };

    response.status(status).json(mcpErrorResponse);
  }
}
