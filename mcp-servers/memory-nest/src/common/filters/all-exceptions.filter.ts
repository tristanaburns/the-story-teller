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

    // Get request information for MCP response
    const requestId = request.body?.requestId || 'unknown';
    const action = request.body?.action || 'unknown';

    // Default status code
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage = 'Internal server error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const errorResponse = exception.getResponse();
      
      if (typeof errorResponse === 'object' && 'message' in errorResponse) {
        errorMessage = Array.isArray(errorResponse.message)
          ? errorResponse.message.join(', ')
          : errorResponse.message as string;
      } else if (typeof errorResponse === 'string') {
        errorMessage = errorResponse;
      }
    } else if (exception instanceof Error) {
      errorMessage = exception.message;
      this.logger.error(`Unhandled exception: ${exception.message}`, exception.stack);
    } else {
      this.logger.error(`Unhandled exception: ${exception}`);
    }

    // Create a standardized MCP error response
    const mcpErrorResponse = {
      serverId: 'memory-mcp',
      action,
      status: 'error',
      error: errorMessage,
      requestId,
      responseId: 'res_' + Math.random().toString(36).substring(2, 15),
      timestamp: Date.now(),
      payload: null,
    };

    response.status(statusCode).json(mcpErrorResponse);
  }
}
