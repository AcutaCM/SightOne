# Logging and Monitoring System Guide

## Overview

The Assistant Data Persistence System includes a comprehensive logging and monitoring infrastructure that provides:

- **Structured Logging**: Multi-level logging with file rotation
- **Performance Monitoring**: Track API response times, database queries, and cache efficiency
- **Real-time Dashboard**: Visual monitoring interface for system health
- **Automatic Metrics**: Built-in tracking for all critical operations

## Table of Contents

1. [Logger System](#logger-system)
2. [Performance Monitor](#performance-monitor)
3. [Monitoring Dashboard](#monitoring-dashboard)
4. [Integration Guide](#integration-guide)
5. [Configuration](#configuration)
6. [Best Practices](#best-practices)

---

## Logger System

### Features

- **Log Levels**: DEBUG, INFO, WARN, ERROR
- **Console Output**: Formatted console logging
- **File Logging**: Automatic file writing in production
- **Log Rotation**: Automatic rotation when files exceed 10MB
- **Module Tagging**: Track logs by module name

### Usage

#### Basic Logging

```typescript
import { logger } from '@/lib/logger/logger';

// Different log levels
logger.debug('Debug message', { data: 'value' });
logger.info('Info message', { userId: 123 });
logger.warn('Warning message', { issue: 'something' });
logger.error('Error message', { error: err });
```

#### Module-Specific Logger

```typescript
import { logger } from '@/lib/logger/logger';

// Create a child logger for a specific module
const moduleLogger = logger.child('MyModule');

moduleLogger.info('Module started');
moduleLogger.error('Module error', { details: 'error info' });
```

### Log Format

```
2024-01-15T10:30:45.123Z [INFO] [AssistantRepository] Assistants fetched {"count":10,"total":50,"page":1,"pageSize":20}
```

### Configuration

```typescript
// Environment variables
LOG_LEVEL=INFO              // Minimum log level (DEBUG, INFO, WARN, ERROR)
LOG_FILE_PATH=./logs/app.log  // Log file location
NODE_ENV=production         // Enable file logging in production
```

### Log Rotation

- **Max File Size**: 10MB
- **Max Files**: 5 rotated files
- **Naming**: `app.log`, `app.1.log`, `app.2.log`, etc.
- **Automatic**: Rotation happens automatically when size limit is reached

---

## Performance Monitor

### Features

- **API Tracking**: Monitor all API endpoint response times
- **Database Tracking**: Track database query execution times
- **Cache Metrics**: Monitor cache hit/miss rates
- **Performance Reports**: Generate comprehensive performance reports

### Usage

#### Track API Requests

```typescript
import { performanceMonitor } from '@/lib/monitoring/performanceMonitor';

// Manual tracking
performanceMonitor.trackApiRequest('/api/assistants', 245.5);

// Using measureAsync helper
import { measureAsync } from '@/lib/monitoring/performanceMonitor';

const result = await measureAsync(
  'GET /api/assistants',
  async () => {
    return await fetch('/api/assistants');
  },
  'api'
);
```

#### Track Database Queries

```typescript
import { measureSync } from '@/lib/monitoring/performanceMonitor';

const rows = measureSync(
  'assistants.findAll',
  () => db.prepare(query).all(...params),
  'database'
);
```

#### Track Cache Operations

```typescript
import { performanceMonitor } from '@/lib/monitoring/performanceMonitor';

// Track cache hit
if (cachedData) {
  performanceMonitor.trackCacheHit();
  return cachedData;
}

// Track cache miss
performanceMonitor.trackCacheMiss();
```

#### Generate Performance Report

```typescript
import { performanceMonitor } from '@/lib/monitoring/performanceMonitor';

const report = performanceMonitor.generateReport();

console.log('API Metrics:', report.apiMetrics);
console.log('Database Metrics:', report.databaseMetrics);
console.log('Cache Metrics:', report.cacheMetrics);
```

### Performance Thresholds

The system automatically logs warnings for:

- **Slow API Requests**: > 1000ms
- **Slow Database Queries**: > 200ms
- **Low Cache Hit Rate**: < 70%

---

## Monitoring Dashboard

### Access

Navigate to `/monitoring` to view the real-time monitoring dashboard.

### Features

#### System Health Status

- **API Health**: Green if avg response time < 500ms
- **Database Health**: Green if avg query time < 100ms
- **Cache Health**: Green if hit rate > 70%

#### Performance Metrics

- **API Performance**
  - Total requests
  - Average response time
  - Slowest endpoint
  - Fastest endpoint

- **Database Performance**
  - Total queries
  - Average query time
  - Slowest query

#### Cache Statistics

- Cache hits count
- Cache misses count
- Hit rate percentage
- Visual efficiency bar

#### Auto-Refresh

- Toggle auto-refresh on/off
- Refreshes every 5 seconds when enabled
- Manual refresh button available

#### Reset Metrics

- Clear all collected metrics
- Start fresh monitoring session

### API Endpoints

#### Get Performance Report

```http
GET /api/monitoring/report
```

Response:
```json
{
  "success": true,
  "data": {
    "apiMetrics": {
      "totalRequests": 150,
      "averageResponseTime": 245.5,
      "slowestEndpoint": {
        "endpoint": "GET /api/assistants",
        "duration": 1250.3
      },
      "fastestEndpoint": {
        "endpoint": "GET /api/assistants/123",
        "duration": 45.2
      }
    },
    "databaseMetrics": {
      "totalQueries": 200,
      "averageQueryTime": 85.3,
      "slowestQuery": {
        "query": "assistants.findAll",
        "duration": 350.5
      }
    },
    "cacheMetrics": {
      "hits": 120,
      "misses": 30,
      "hitRate": 80.0
    },
    "timeRange": {
      "start": "2024-01-15T10:00:00.000Z",
      "end": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

#### Reset Metrics

```http
DELETE /api/monitoring/report
```

Response:
```json
{
  "success": true,
  "message": "Performance metrics reset successfully"
}
```

---

## Integration Guide

### Adding Logging to New Modules

```typescript
import { logger } from '@/lib/logger/logger';

export class MyService {
  private logger = logger.child('MyService');

  async doSomething() {
    this.logger.info('Starting operation');
    
    try {
      // Your code here
      this.logger.debug('Operation details', { data: 'value' });
      this.logger.info('Operation completed successfully');
    } catch (error) {
      this.logger.error('Operation failed', { error });
      throw error;
    }
  }
}
```

### Adding Performance Tracking to API Routes

```typescript
import { NextResponse } from 'next/server';
import { measureAsync } from '@/lib/monitoring/performanceMonitor';
import { logger } from '@/lib/logger/logger';

export async function GET(request: Request) {
  return measureAsync(
    'GET /api/my-endpoint',
    async () => {
      try {
        // Your API logic here
        const data = await fetchData();
        
        logger.info('API request successful', { count: data.length });
        
        return NextResponse.json({
          success: true,
          data,
        });
      } catch (error) {
        logger.error('API request failed', { error });
        
        return NextResponse.json(
          {
            success: false,
            error: { message: 'Internal server error' },
          },
          { status: 500 }
        );
      }
    },
    'api'
  );
}
```

### Adding Performance Tracking to Database Operations

```typescript
import { measureSync } from '@/lib/monitoring/performanceMonitor';
import { logger } from '@/lib/logger/logger';

export class MyRepository {
  private logger = logger.child('MyRepository');

  findAll() {
    try {
      const rows = measureSync(
        'my_table.findAll',
        () => this.db.prepare('SELECT * FROM my_table').all(),
        'database'
      );
      
      this.logger.debug('Records fetched', { count: rows.length });
      return rows;
    } catch (error) {
      this.logger.error('Failed to fetch records', { error });
      throw error;
    }
  }
}
```

---

## Configuration

### Environment Variables

```env
# Logging Configuration
LOG_LEVEL=INFO                    # Minimum log level (DEBUG, INFO, WARN, ERROR)
LOG_FILE_PATH=./logs/app.log      # Log file location
NODE_ENV=production               # Enable file logging in production

# Performance Monitoring
ENABLE_PERFORMANCE_MONITORING=true  # Enable/disable performance tracking
```

### Logger Configuration

```typescript
import { Logger, LogLevel } from '@/lib/logger/logger';

const customLogger = new Logger({
  logLevel: LogLevel.DEBUG,
  logFilePath: './logs/custom.log',
  maxFileSize: 5 * 1024 * 1024,  // 5MB
  maxFiles: 3,
  enableConsole: true,
  enableFile: true,
});
```

---

## Best Practices

### Logging

1. **Use Appropriate Log Levels**
   - DEBUG: Detailed diagnostic information
   - INFO: General informational messages
   - WARN: Warning messages for potentially harmful situations
   - ERROR: Error events that might still allow the application to continue

2. **Include Context**
   ```typescript
   // Good
   logger.error('Failed to save assistant', { 
     assistantId: id, 
     error: err.message 
   });
   
   // Bad
   logger.error('Failed to save');
   ```

3. **Use Module Loggers**
   ```typescript
   // Create once per module
   const moduleLogger = logger.child('MyModule');
   
   // Use throughout the module
   moduleLogger.info('Operation started');
   ```

4. **Don't Log Sensitive Data**
   ```typescript
   // Bad
   logger.info('User logged in', { password: user.password });
   
   // Good
   logger.info('User logged in', { userId: user.id });
   ```

### Performance Monitoring

1. **Track Critical Operations**
   - All API endpoints
   - Database queries
   - Cache operations
   - External service calls

2. **Use Helpers for Consistency**
   ```typescript
   // Use measureAsync/measureSync instead of manual tracking
   const result = await measureAsync('operation', fn, 'api');
   ```

3. **Monitor Thresholds**
   - Set up alerts for slow operations
   - Review performance reports regularly
   - Optimize based on metrics

4. **Reset Metrics Periodically**
   - Reset daily or weekly
   - Keep historical reports
   - Track trends over time

### Dashboard Usage

1. **Regular Monitoring**
   - Check dashboard daily
   - Look for anomalies
   - Track performance trends

2. **Performance Optimization**
   - Identify slow endpoints
   - Optimize slow queries
   - Improve cache hit rates

3. **Capacity Planning**
   - Monitor request volumes
   - Track resource usage
   - Plan for scaling

---

## Troubleshooting

### Logs Not Appearing

1. Check `NODE_ENV` is set to `production` for file logging
2. Verify log directory exists and has write permissions
3. Check `LOG_LEVEL` environment variable

### Performance Metrics Not Tracking

1. Ensure `measureAsync`/`measureSync` are used correctly
2. Check that performance monitor is imported
3. Verify API endpoints are instrumented

### Dashboard Not Loading

1. Check `/api/monitoring/report` endpoint is accessible
2. Verify performance monitor is initialized
3. Check browser console for errors

---

## Examples

### Complete API Route with Logging and Monitoring

```typescript
import { NextResponse } from 'next/server';
import { measureAsync } from '@/lib/monitoring/performanceMonitor';
import { logger } from '@/lib/logger/logger';
import { assistantRepository } from '@/lib/db/assistantRepository';

const routeLogger = logger.child('AssistantAPI');

export async function GET(request: Request) {
  return measureAsync(
    'GET /api/assistants',
    async () => {
      try {
        routeLogger.info('Fetching assistants');
        
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '20');
        
        const result = assistantRepository.findAll({ page, pageSize });
        
        routeLogger.info('Assistants fetched successfully', {
          count: result.data.length,
          total: result.total,
        });
        
        return NextResponse.json({
          success: true,
          data: result,
        });
      } catch (error) {
        routeLogger.error('Failed to fetch assistants', { error });
        
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FETCH_ERROR',
              message: 'Failed to fetch assistants',
            },
          },
          { status: 500 }
        );
      }
    },
    'api'
  );
}
```

---

## Summary

The logging and monitoring system provides comprehensive observability for the Assistant Data Persistence System:

- **Structured logging** with automatic file rotation
- **Performance tracking** for APIs, databases, and cache
- **Real-time dashboard** for system health monitoring
- **Easy integration** with existing code
- **Production-ready** configuration

For questions or issues, refer to the troubleshooting section or check the logs at `./logs/app.log`.
