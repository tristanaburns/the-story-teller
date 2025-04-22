# Comprehensive Centralized Logging System Implementation

**Date:** 2025-04-21
**Author:** Development Team
**Category:** feature
**Status:** implemented ✅

## Overview

This devlog documents the implementation of a comprehensive centralized logging system for The Story Teller application. The logging system is designed to provide detailed diagnostic information, performance metrics, and error tracking across all application components, making it easier to troubleshoot issues, monitor performance, and understand application behavior.

## Implementation Details

### Core Logging Architecture

1. **Centralized Logger Design**:
   - Environment-based log levels
   - Multiple transport mechanisms (Console, File, MongoDB)
   - Correlation ID propagation
   - Structured JSON format
   - Context-aware logging
   - Sanitization of sensitive data

2. **Server-Side Logging**:
   - Enhanced server-side logging with performance metrics
   - API request/response logging
   - Database operation logging
   - AI operation logging with token usage tracking
   - Automatic error tracking with stack traces
   - Middleware for correlation ID propagation

3. **Client-Side Logging**:
   - Browser-based logging with offline storage
   - Performance metrics collection (LCP, FID, CLS)
   - React component performance tracking
   - Automatic error boundary integration
   - Network request monitoring
   - User interaction logging

4. **Log Storage and Retrieval**:
   - MongoDB storage with TTL indexes
   - Log querying API with filtering
   - Statistical summary generation
   - Performance impact optimization
   - Log rotation and retention policies

5. **Integration Points**:
   - Next.js API route logging middleware
   - React component HOC and hooks
   - MongoDB operation tracking
   - AI operation monitoring
   - Global error tracking

## Key Features

### Correlation ID Propagation

The system implements end-to-end correlation ID tracking to trace requests across the entire application stack:

```typescript
// Middleware adds correlation ID to all requests
function middleware(request: NextRequest) {
  const correlationId = request.headers.get('x-correlation-id') || generateCorrelationId();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-correlation-id', correlationId);
  // ...
}
```

### Structured Logging Format

All logs are stored in a structured JSON format for machine parsing:

```typescript
// Example log entry format
{
  timestamp: "2025-04-21T15:30:00Z",
  level: "INFO",
  message: "User login successful",
  context: "AuthService",
  correlationId: "req-1619012345678-abcdef",
  userId: "user-123",
  duration: 237.45,
  clientInfo: {
    ip: "203.0.113.1",
    userAgent: "Mozilla/5.0 ..."
  }
}
```

### Centralized Transport System

The logging system supports multiple transports:

1. **Console Transport**: For development and debugging
2. **File Transport**: For log storage with rotation
3. **MongoDB Transport**: For searchable log storage and analysis

### React Integration

Custom hooks and HOCs for React component logging:

```typescript
// Using the hooks
function ProfileComponent() {
  const logger = useClientLogger('ProfileComponent');
  const { trackOperation } = usePerformanceMonitoring('ProfileComponent');
  
  const handleSave = () => {
    const endTimer = trackOperation('saveProfile');
    // Save profile...
    endTimer(); // Log the operation duration
  };
}

// Using the HOC
export default withLogging(ProfileComponent);
```

### Log Query API

RESTful API for querying and analyzing logs:

```typescript
// Example query parameters
{
  startDate: "2025-04-20T00:00:00Z",
  endDate: "2025-04-21T23:59:59Z",
  level: ["ERROR", "WARN"],
  context: "API",
  search: "database connection"
}
```

## Usage Examples

### Server-Side Logging

```typescript
import { createLogger } from '@/lib/logging';

// Create a logger with context
const logger = createLogger('UserService');

// Log at different levels
logger.debug('Processing user request', { userId, requestData });
logger.info('User updated profile', { userId });
logger.warn('Multiple failed login attempts', { userId, attempts: 5, ip });
logger.error('Failed to update database', error);

// Track performance
const endTimer = logger.time('getUserProfile');
// ...
endTimer(); // Logs the duration
```

### API Route Logging

```typescript
import { withApiLogging } from '@/lib/logging';

async function handler(req, res) {
  // Route handler logic
}

export default withApiLogging(handler, 'UserAPI');
```

### Database Operation Logging

```typescript
import { logDbOperation, DbOperation } from '@/lib/logging';

async function getUserById(id) {
  return logDbOperation(
    DbOperation.FIND_ONE,
    'users',
    { _id: id },
    async () => {
      return collection.findOne({ _id: id });
    }
  );
}
```

### Client-Side Logging

```typescript
import { useClientLogger, usePerformanceMonitoring } from '@/lib/logging/client';

function Dashboard() {
  const logger = useClientLogger('Dashboard');
  const { trackAsyncOperation } = usePerformanceMonitoring('Dashboard');
  
  const loadData = async () => {
    try {
      const data = await trackAsyncOperation(
        'loadDashboardData',
        fetch('/api/dashboard-data')
      );
      logger.info('Dashboard data loaded', { itemCount: data.length });
    } catch (error) {
      logger.error('Failed to load dashboard data', error);
    }
  };
}
```

## Technical Design

### Logger Class

The core `Logger` class provides the primary logging interface:

```typescript
class Logger {
  constructor(context: string, correlationId?: string) {
    this.context = context;
    this.correlationId = correlationId;
  }
  
  // Log methods: debug, info, warn, error, fatal
  // Utility methods: time, trackMethod, createChildLogger
}
```

### Transport System

Each transport implements a common interface:

```typescript
interface LogTransport {
  log(entry: LogEntry): Promise<void>;
  flush(): Promise<void>;
  close(): Promise<void>;
}
```

### MongoDB Schema

The MongoDB log schema includes:

- Timestamp with TTL index
- Log level, message, and context
- Correlation ID for request tracking
- Performance metrics (duration)
- User ID and session information
- Client information (IP, user agent)
- Error details with stack traces

## Performance Considerations

1. **Batched Logging**: Client logs are batched to reduce network requests
2. **Asynchronous Transport**: Log writing is non-blocking
3. **Log Level Filtering**: Logs below the minimum level are filtered early
4. **Sampling**: High-volume logs can be sampled in production
5. **Caching**: Log queries are cached to improve dashboard performance

## Security Considerations

1. **Sensitive Data Redaction**: Automatic redaction of sensitive fields
2. **Access Control**: Only admin users can access log data
3. **Sanitization**: Request data is sanitized before logging
4. **Minimal PII**: Personally identifiable information is limited
5. **Encryption**: Logs are transmitted over HTTPS

## Monitoring Dashboard

The logging system includes an admin dashboard with:

1. Log search and filtering
2. Real-time log streaming
3. Error tracking and trending
4. Performance metrics visualization
5. Custom alert configuration

## Next Steps

1. **Enhanced Analytics**: Add ML-based log pattern recognition
2. **Alerting System**: Implement automated alerts based on log patterns
3. **User Activity Visualization**: Create user journey visualizations
4. **Custom Dashboard**: Allow customized logging dashboards
5. **Distributed Tracing**: Extend correlation IDs to microservices architecture

## References

- [Winston Logger Documentation](https://github.com/winstonjs/winston)
- [MongoDB TTL Indexes](https://www.mongodb.com/docs/manual/core/index-ttl/)
- [Web Vitals Metrics](https://web.dev/vitals/)
- [OpenTelemetry Standards](https://opentelemetry.io/)
