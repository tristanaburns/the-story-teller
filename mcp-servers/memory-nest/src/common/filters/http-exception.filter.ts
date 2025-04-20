import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();

    const requestId = request.body?.requestId || 'unknown';
    const action = request.body?.action || 'unknown';

    // Extract error message
    let errorMessage = 'Internal server error';
    if (typeof errorResponse === 'object' && 'message' in errorResponse) {
      errorMessage = Array.isArray(errorResponse.message)
        ? errorResponse.message.join(', ')
        : errorResponse.message as string;
    } else if (typeof errorResponse === 'string') {
      errorMessage = errorResponse;
    }

    // If the exception is already in MCP format (from AuthGuard for example), use it directly
    if (
      typeof errorResponse === 'object' &&
      'serverId' in errorResponse &&
      'action' in errorResponse &&
      'status' in errorResponse
    ) {
      this.logger.error(`MCP Error: ${errorMessage}`);
      return response.status(status).json(errorResponse);
    }

    // Log the error
    this.logger.error(
      `Request ${request.method} ${request.url} failed with status ${status}: ${errorMessage}`,
    );

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

    response.status(status).json(mcpErrorResponse);
  }
}
