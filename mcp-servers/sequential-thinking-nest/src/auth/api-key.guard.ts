/**
 * API Key authentication guard for Sequential Thinking MCP Server.
 * This guard protects routes using the bearer token authentication strategy.
 */

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class ApiKeyGuard extends AuthGuard('bearer') {} 