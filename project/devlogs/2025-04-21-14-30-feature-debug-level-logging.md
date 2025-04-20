# Debug-Level Logging Implementation

**Date:** 2025-04-21
**Author:** Development Team
**Category:** feature
**Status:** implemented ✅

## Overview

This devlog documents the implementation of comprehensive debug-level logging throughout The Story Teller application. The logging system is designed to provide detailed diagnostic information across all application components, making it easier to troubleshoot issues and understand application behavior.

## Implementation Details

### Core Logging Functionality

A centralized logging system has been implemented in the `lib/logging` directory:

1. **Base Logger (`logger.ts`)**: 
   - Configurable log levels (DEBUG, INFO, WARN, ERROR, NONE)
   - Context-aware logging with timestamps
   - Colorized output in development
   - Environment-based configuration

2. **Initialization (`init.ts`)**:
   - Environment-based configuration
   - Enhanced console methods in development
   - Application-wide logging initialization

3. **Component Integrations**:
   - API Route Logging (`apiLogger.ts`)
   - Database Operation Logging (`dbLogger.ts`)
   - AI Integration Logging (`aiLogger.ts`)
   - React Component Logging (via hooks and HOCs)

### Key Features

1. **Performance Measurement**:
   - Automatic timing of operations
   - Duration reporting for critical paths

2. **Data Sanitization**:
   - Automatic redaction of sensitive information
   - Protection of passwords, tokens, and credentials

3. **Context Tracking**:
   - Component-level context in React
   - Request path tracking in API routes
   - Collection-specific logging in database operations
   - Model-specific logging in AI operations

4. **Granular Control**:
   - Environment variable configuration (`LOG_LEVEL`)
   - Runtime log level adjustment

## Usage Examples

### Basic Logger Usage

```typescript
import { createLogger } from '@/lib/logging';

// Create a logger with context
const logger = createLogger('MyComponent');

// Log at different levels
logger.debug('Detailed debug information');
logger.info('General operational information');
logger.warn('Warning about potential issues');
logger.error('Critical error information', error);

// Measure performance
const endTimer = logger.time('Operation');
// ... perform operation
endTimer(); // Logs the duration
```

### React Component Logging

```typescript
// Using the hook
import { useLogger } from '@/lib/hooks';

function MyComponent() {
  const logger = useLogger('MyComponent');
  logger.debug('Component rendering');
  // ...
}

// Using the HOC
import { withLogging } from '@/lib/hoc';

function MyComponent(props) {
  // logger is injected as a prop
  props.logger.debug('Component rendering');
  // ...
}

export default withLogging(MyComponent);
```

### API Route Logging

```typescript
import { withApiLogging } from '@/lib/logging';

async function handler(req, res) {
  // ...
}

export default withApiLogging(handler, 'ApiRouteName');
```

### Database Operation Logging

```typescript
import { getCollection } from '@/lib/mongodb';

async function fetchData() {
  const collection = await getCollection('users');
  
  // All operations are automatically logged
  const users = await collection.find({ active: true });
  // ...
}
```

### AI Operation Logging

```typescript
import { logAiOperation, AiOperation } from '@/lib/logging';

async function generateContent(prompt) {
  return logAiOperation(
    AiOperation.COMPLETION,
    'gpt-4',
    { prompt },
    async () => {
      // AI operation code here
      const result = await ai.createCompletion(...);
      return result;
    }
  );
}
```

## Configuration

The logging system can be configured through environment variables:

- `LOG_LEVEL`: Sets the minimum log level (DEBUG, INFO, WARN, ERROR, NONE)
- `NODE_ENV`: Development mode enables additional debugging features

Default configuration:
- Development: DEBUG level with enhanced console output
- Production: INFO level with basic formatting

## Next Steps

1. **Log Aggregation**: Implement a centralized log collection system
2. **Alerting Integration**: Connect critical error logs to alerting systems
3. **Visual Log Explorer**: Create a developer dashboard for log visualization
4. **User Activity Logging**: Add structured logging for user actions and workflows

## References

- [Winston Logger Documentation](https://github.com/winstonjs/winston)
- [Next.js Logging Best Practices](https://nextjs.org/docs)
- [MongoDB Performance Monitoring](https://www.mongodb.com/docs/manual/administration/monitoring/)
