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
    
    const requestId = request.body?.requestId || 'unknown';
    const errorResponse = exception.getResponse() as any;
    
    const errorMessage = 
      typeof errorResponse === 'string' 
        ? errorResponse 
        : errorResponse.message || exception.message;
    
    // Log the error
    this.logger.error(
      `Request ${requestId} failed: ${JSON.stringify(errorMessage)}`,
      exception.stack,
    );
    
    // Format as MCP-compatible response
    const mcpResponse = {
      requestId,
      status: 'error',
      error: Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage,
    };
    
    response.status(status).json(mcpResponse);
  }
}
