# Logging and Monitoring Quick Start

## 🚀 Quick Access

- **Monitoring Dashboard**: Navigate to `/monitoring`
- **Log Files**: Check `./logs/app.log`
- **API Endpoint**: `GET /api/monitoring/report`

## 📊 View System Metrics

### Option 1: Web Dashboard

1. Open your browser
2. Navigate to `http://localhost:3000/monitoring`
3. View real-time metrics:
   - System health status
   - API performance
   - Database performance
   - Cache statistics

### Option 2: API Endpoint

```bash
# Get performance report
curl http://localhost:3000/api/monitoring/report

# Reset metrics
curl -X DELETE http://localhost:3000/api/monitoring/report
```

## 📝 Basic Logging

### In Your Code

```typescript
import { logger } from '@/lib/logger/logger';

// Simple logging
logger.info('Operation completed');
logger.error('Operation failed', { error });

// Module-specific logging
const myLogger = logger.child('MyModule');
myLogger.debug('Debug info', { data: 'value' });
```

### Log Levels

- **DEBUG**: Detailed diagnostic info (dev only)
- **INFO**: General informational messages
- **WARN**: Warning messages
- **ERROR**: Error events

## 📈 Track Performance

### API Endpoints

```typescript
import { measureAsync } from '@/lib/monitoring/performanceMonitor';

export async function GET() {
  return measureAsync(
    'GET /api/my-endpoint',
    async () => {
      // Your code here
      return NextResponse.json({ data });
    },
    'api'
  );
}
```

### Database Queries

```typescript
import { measureSync } from '@/lib/monitoring/performanceMonitor';

const rows = measureSync(
  'my_query',
  () => db.prepare(query).all(),
  'database'
);
```

### Cache Operations

```typescript
import { performanceMonitor } from '@/lib/monitoring/performanceMonitor';

if (cachedData) {
  performanceMonitor.trackCacheHit();
} else {
  performanceMonitor.trackCacheMiss();
}
```

## 🔍 Check Logs

### Development

Logs appear in console with colors and formatting.

### Production

```bash
# View latest logs
tail -f ./logs/app.log

# View last 100 lines
tail -n 100 ./logs/app.log

# Search for errors
grep "ERROR" ./logs/app.log
```

## ⚙️ Configuration

### Environment Variables

```env
# Set log level
LOG_LEVEL=INFO

# Set log file location
LOG_FILE_PATH=./logs/app.log

# Enable production mode
NODE_ENV=production
```

## 🎯 Common Tasks

### View Current Performance

1. Go to `/monitoring`
2. Check the metrics cards
3. Look for red/yellow warnings

### Find Slow Operations

1. Go to `/monitoring`
2. Check "Slowest Endpoint" and "Slowest Query"
3. Optimize those operations

### Check Cache Efficiency

1. Go to `/monitoring`
2. Look at "Cache Statistics"
3. Aim for >70% hit rate

### Debug an Issue

1. Check logs: `tail -f ./logs/app.log`
2. Look for ERROR level messages
3. Check the metadata for context

### Reset Metrics

1. Go to `/monitoring`
2. Click "Reset Metrics" button
3. Or: `curl -X DELETE http://localhost:3000/api/monitoring/report`

## 📚 Next Steps

- Read the [Full Guide](./LOGGING_AND_MONITORING_GUIDE.md)
- Check [Best Practices](./LOGGING_AND_MONITORING_GUIDE.md#best-practices)
- Review [Integration Guide](./LOGGING_AND_MONITORING_GUIDE.md#integration-guide)

## 🆘 Troubleshooting

### Logs not appearing?

- Check `NODE_ENV=production` for file logging
- Verify `./logs` directory exists
- Check file permissions

### Dashboard not loading?

- Verify server is running
- Check `/api/monitoring/report` endpoint
- Look for console errors

### Metrics not tracking?

- Ensure `measureAsync`/`measureSync` are used
- Check imports are correct
- Verify performance monitor is initialized

---

**That's it!** You're now ready to monitor your application. 🎉
