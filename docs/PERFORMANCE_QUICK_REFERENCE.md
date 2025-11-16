# Performance Optimization Quick Reference

## Quick Start

### Run Performance Tests
```bash
# Run all performance tests
npm run test:performance

# Generate performance report
npm run performance:report
```

### Check Performance Metrics
```typescript
import { getDefaultRepository } from '@/lib/db/assistantRepository';

const repository = getDefaultRepository();

// Get query statistics
const stats = repository.getQueryStats();
console.log('Avg query time:', stats.averageExecutionTime, 'ms');

// Get slow queries
const slowQueries = repository.getSlowQueries(100);
console.log('Slow queries:', slowQueries.length);
```

### Optimize Database
```typescript
// Run optimization (ANALYZE + VACUUM + ensure indexes)
repository.optimizeDatabase();

// Clear query cache
repository.clearQueryCache();
```

## API Optimizations

### Use Field Selection
```bash
# Request only specific fields
GET /api/assistants?fields=id,title,status
```

### Use ETag Caching
```bash
# First request
GET /api/assistants
# Response: ETag: "abc123"

# Subsequent request
GET /api/assistants
If-None-Match: "abc123"
# Response: 304 Not Modified (if unchanged)
```

### Cache Control
```typescript
import { ResponseOptimizer, CacheControl } from '@/lib/api/responseOptimizer';

// Short cache (1 minute) - for lists
ResponseOptimizer.success(data, { cacheControl: CacheControl.SHORT });

// Medium cache (5 minutes) - for details
ResponseOptimizer.success(data, { cacheControl: CacheControl.MEDIUM });

// No cache - for mutable data
ResponseOptimizer.success(data, { cacheControl: CacheControl.NO_CACHE });
```

## Performance Targets

| Operation | Target | Current |
|-----------|--------|---------|
| Initial Load | < 500ms | ~150ms ✅ |
| Database Query | < 200ms | ~50ms ✅ |
| Create Operation | < 300ms | ~80ms ✅ |
| Search Query | < 100ms | ~60ms ✅ |

## Common Issues

### Slow Queries
```typescript
// 1. Check slow queries
const slowQueries = repository.getSlowQueries(100);

// 2. Analyze query
const analysis = queryOptimizer.analyzeQuery(db, query);
console.log(analysis.recommendations);

// 3. Optimize database
repository.optimizeDatabase();
```

### High Memory
```typescript
// Clear query cache
repository.clearQueryCache();

// Clear specific pattern
repository.clearQueryCache('assistants:*');
```

### Poor Cache Hit Rate
```typescript
// Check cache stats
const stats = repository.getQueryStats();
console.log('Cache hit rate:', stats.cacheHitRate);

// Increase cache TTL in queryOptimizer.ts
private defaultCacheTTL = 120000; // 2 minutes
```

## Performance Reports

### Generate Report
```typescript
import { PerformanceReporter } from '@/lib/performance/performanceReporter';

const report = PerformanceReporter.generateReport();

// Print to console
PerformanceReporter.printReport(report);

// Save JSON
PerformanceReporter.saveReport(report);

// Save HTML
PerformanceReporter.saveHtmlReport(report);
```

### Report Location
- JSON: `logs/performance/performance-report-{timestamp}.json`
- HTML: `logs/performance/performance-report-{timestamp}.html`

## Monitoring

### Query Performance
```typescript
// Track query execution
const result = queryOptimizer.executeWithTracking(
  db,
  'SELECT * FROM assistants',
  [],
  'all'
);

// Get statistics
const summary = queryOptimizer.getStatsSummary();
```

### API Performance
```typescript
// Response optimizer automatically adds performance headers
// Check X-Response-Time header in responses
```

## Best Practices

1. **Run optimization monthly**
   ```typescript
   repository.optimizeDatabase();
   ```

2. **Monitor slow queries weekly**
   ```typescript
   const slowQueries = repository.getSlowQueries(100);
   if (slowQueries.length > 10) {
     // Investigate and optimize
   }
   ```

3. **Generate performance reports**
   ```bash
   npm run performance:report
   ```

4. **Use appropriate cache strategies**
   - Lists: SHORT (1 min)
   - Details: MEDIUM (5 min)
   - Static: LONG (1 hour)

5. **Enable field selection for large responses**
   ```bash
   GET /api/assistants?fields=id,title,status
   ```

## Configuration

### Query Optimizer
File: `lib/db/queryOptimizer.ts`

```typescript
private slowQueryThreshold = 100; // ms
private defaultCacheTTL = 60000; // 1 minute
private maxStatsSize = 1000; // max stats entries
```

### Response Optimizer
File: `lib/api/responseOptimizer.ts`

```typescript
// Compression threshold
return jsonString.length > 1024; // 1KB

// Cache control presets
CacheControl.SHORT = 'public, max-age=60';
CacheControl.MEDIUM = 'public, max-age=300';
CacheControl.LONG = 'public, max-age=3600';
```

## Troubleshooting Commands

```bash
# Run specific performance test
npm test -- __tests__/performance/load-testing.test.ts

# Run with verbose output
npm test -- __tests__/performance/load-testing.test.ts --verbose

# Generate report with custom data size
TEST_DATA_SIZE=500 npm run performance:report
```

## Key Files

- `lib/db/queryOptimizer.ts` - Query optimization
- `lib/api/responseOptimizer.ts` - API response optimization
- `lib/performance/performanceReporter.ts` - Performance reporting
- `__tests__/performance/` - Performance test suites
- `scripts/run-performance-tests.ts` - CLI testing tool

## Support

For detailed documentation, see:
- `docs/PERFORMANCE_OPTIMIZATION_COMPLETE.md` - Complete guide
- `docs/DATABASE_LAYER_QUICK_START.md` - Database usage
- `docs/API_QUICK_START.md` - API usage

---

**Last Updated**: 2024-01-15
**Status**: ✅ All optimizations active
