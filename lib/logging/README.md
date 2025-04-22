# The Story Teller: Comprehensive Logging System

This document outlines the logging system implemented in The Story Teller application. The logging system provides detailed visibility into application behavior, including function inputs and outputs, database operations, API calls, authentication events, and client-side interactions.

## Core Features

- **Multi-level Logging**: Supports TRACE, DEBUG, INFO, WARN, ERROR, and FATAL log levels
- **Server & Client Logging**: Comprehensive logging on both server and client sides
- **Function Input/Output Tracking**: Automatic logging of function parameters and return values
- **Database Operation Logging**: Detailed logging of all MongoDB operations
- **API Request/Response Logging**: Complete logging of API calls including headers and payloads
- **Authentication Tracking**: Session state and authentication event logging
- **Navigation Tracking**: Page navigation and performance metrics
- **User Interaction Logging**: Tracking of user interactions with UI elements
- **Correlation IDs**: Request tracing across components with correlation IDs
- **Error Capture**: Comprehensive error logging with stack traces and context
- **Sanitization**: Automatic redaction of sensitive information

## Server-Side Logging Components

### Core Logger (`logger.ts`)

The central logging utility that provides the core logging functionality:

```typescript
import { createLogger, LogLevel } from '@/lib/logging';

// Create a component-specific logger
const logger = createLogger('ComponentName');

// Log at different levels
logger.trace('Detailed trace information');
logger.debug('Debug information with data', { key: 'value' });
logger.info('Information message');
logger.warn('Warning message');
logger.error('Error occurred', error);
logger.fatal('Fatal error', error);
```

### Method Decorator (`logMethod.ts`)

Decorators for automatic function input/output logging:

```typescript
import { LogMethod, LogDebug } from '@/lib/logging';

class UserService {
  @LogMethod() // Default DEBUG level
  async getUser(userId: string) {
    // Method implementation
    return user;
  }
  
  @LogDebug() // Shorthand for DEBUG level
  async createUser(userData: UserData) {
    // Method implementation
    return newUser;
  }
}
```

### Function Wrapper (`logFunction.ts`)

Wrapper for standalone functions:

```typescript
import { logFunction } from '@/lib/logging';

// Original function
const fetchData = async (id: string) => {
  // Implementation
};

// Wrapped function with logging
const loggedFetchData = logFunction(
  fetchData,
  'fetchData',
  'DataModule',
  LogLevel.DEBUG
);
```

### Database Logging (`mongodb.ts`)

Automatic logging for all database operations:

```typescript
import { getDb } from '@/lib/mongodb';

// Get database with logging
const db = await getDb('databaseName');

// All operations are automatically logged
const collection = db.collection('collectionName');
const result = await collection.find({ key: 'value' }).toArray();
```

### API Route Logging (`middleware.ts` & `apiLogger.ts`)

Comprehensive logging for all API routes:

```typescript
// In an API route
import { withApiLogging } from '@/lib/logging';

async function handler(req: NextRequest) {
  // Handler implementation
}

// Export the wrapped handler
export const GET = withApiLogging(handler, 'routeName');
```

## Client-Side Logging Components

### Client Logger (`clientLogger.ts`)

Browser-side logging with server synchronization:

```typescript
'use client';

import { createClientLogger } from '@/lib/logging/client';

// Create a client-side logger
const logger = createClientLogger('ComponentName');

// Log at different levels
logger.debug('Debug information', { key: 'value' });
logger.error('Error occurred', error);
```

### React Hooks

React hooks for component logging:

```typescript
'use client';

import { 
  useClientLogger,
  useLoggedFunction,
  useNavigationLogging
} from '@/lib/logging';

function MyComponent() {
  // Get a logger for this component
  const logger = useClientLogger('MyComponent');
  
  // Log navigation events
  useNavigationLogging('MyComponent');
  
  // Wrap an event handler with logging
  const handleClick = useLoggedFunction((event) => {
    // Handler implementation
  }, 'handleClick');
  
  return <button onClick={handleClick}>Click Me</button>;
}
```

### LoggingProvider (`LoggingProvider.tsx`)

Provider component for application-wide client logging:

```tsx
'use client';

// In your root layout
import { LoggingProvider } from '@/lib/logging/client';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <LoggingProvider componentName="App">
          {children}
        </LoggingProvider>
      </body>
    </html>
  );
}
```

## Best Practices

1. **Use Component-Specific Loggers**: Create loggers with specific context names

```typescript
const logger = createLogger('UserService');
```

2. **Include Relevant Context**: Add context information to log messages

```typescript
logger.debug('User action completed', { 
  userId, 
  action, 
  result, 
  duration 
});
```

3. **Appropriate Log Levels**:
   - TRACE: Method entry/exit, very detailed debugging
   - DEBUG: Regular debugging information, function inputs/outputs
   - INFO: Significant events, state changes
   - WARN: Potential issues that don't prevent operation
   - ERROR: Errors that affect functionality
   - FATAL: Critical errors that prevent operation

4. **Error Logging**: Include full error details

```typescript
try {
  // Operation
} catch (error) {
  logger.error('Operation failed', error);
  throw error;
}
```

5. **Performance Timing**: Track operation duration

```typescript
const startTime = performance.now();
// Operation
const duration = performance.now() - startTime;
logger.debug('Operation completed', { duration });
```

## Configuration

Logging configuration is managed in the `lib/logging/init.ts` file:

```typescript
// Set minimum log level (overwrites environment variable setting)
setLogLevel(LogLevel.DEBUG);

// Configure specific aspects of logging
configureLogger({
  enableConsoleTransport: true,
  enableFileTransport: true,
  enableMongoTransport: true,
  minLevel: LogLevel.DEBUG
});
```

Environment variables:
- `LOG_LEVEL`: Set minimum log level (TRACE, DEBUG, INFO, WARN, ERROR, FATAL)
- `MONGODB_URI`: MongoDB connection for log storage

## Implementation

The Story Teller logging system ensures that:

1. Every function's inputs and outputs are logged at DEBUG level
2. All database operations are logged with queries, results, and timing
3. All API routes log requests and responses with sanitized data
4. Authentication and session events are tracked
5. Client-side navigation and interactions are monitored
6. All errors are captured with full context

This comprehensive logging approach provides complete visibility into application behavior, facilitating debugging, monitoring, and auditing. 