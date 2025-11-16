# Assistant Data Persistence System - Setup Guide

This guide covers the initial setup and configuration of the assistant data persistence system.

## Overview

The assistant data persistence system provides a robust three-layer architecture:
- **SQLite Database** - Server-side persistent storage
- **IndexedDB Cache** - Client-side caching for performance
- **RESTful API** - Communication layer between frontend and backend

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Basic understanding of Next.js and TypeScript

## Installation

### 1. Dependencies

The required dependencies are already installed:
- `better-sqlite3` - SQLite database driver
- `@types/better-sqlite3` - TypeScript type definitions

To verify installation:
```bash
npm list better-sqlite3
```

### 2. Directory Structure

The following directories have been created:

```
drone-analyzer-nextjs/
├── data/                    # Database and backups
│   ├── backups/            # Backup files
│   └── README.md           # Data directory documentation
├── logs/                    # Application logs
│   └── README.md           # Logs directory documentation
├── lib/
│   ├── config/
│   │   └── assistantConfig.ts    # Configuration loader
│   └── constants/
│       └── assistantConstants.ts  # System constants
└── types/
    └── assistant.ts         # TypeScript type definitions
```

### 3. Environment Configuration

Copy the example environment file:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` to configure your settings:

```env
# Database Configuration
DATABASE_PATH=./data/assistants.db
DATABASE_BACKUP_DIR=./data/backups

# Logging Configuration
LOG_LEVEL=info
LOG_DIR=./logs
LOG_MAX_SIZE=10485760

# Cache Configuration
CACHE_TTL=604800000

# Backup Configuration
AUTO_BACKUP_ENABLED=true
AUTO_BACKUP_TIME=02:00
BACKUP_RETENTION_DAYS=30

# Performance Configuration
DB_CONNECTION_POOL_SIZE=10
DB_TIMEOUT=5000
API_RESPONSE_TIMEOUT=30000

# Security Configuration
ENABLE_CSRF_PROTECTION=true
ENABLE_RATE_LIMITING=true
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
```

## Configuration Options

### Database Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_PATH` | Path to SQLite database file | `./data/assistants.db` |
| `DATABASE_BACKUP_DIR` | Directory for backup files | `./data/backups` |
| `DB_CONNECTION_POOL_SIZE` | Maximum concurrent connections | `10` |
| `DB_TIMEOUT` | Database operation timeout (ms) | `5000` |

### Logging Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `LOG_LEVEL` | Logging level (debug/info/warn/error) | `info` |
| `LOG_DIR` | Directory for log files | `./logs` |
| `LOG_MAX_SIZE` | Maximum log file size (bytes) | `10485760` (10MB) |

### Cache Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `CACHE_TTL` | Cache time-to-live (ms) | `604800000` (7 days) |

### Backup Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `AUTO_BACKUP_ENABLED` | Enable automatic backups | `true` |
| `AUTO_BACKUP_TIME` | Time for automatic backup (HH:MM) | `02:00` |
| `BACKUP_RETENTION_DAYS` | Days to keep backups | `30` |

### Security Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `ENABLE_CSRF_PROTECTION` | Enable CSRF token validation | `true` |
| `ENABLE_RATE_LIMITING` | Enable API rate limiting | `true` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | `60000` (1 minute) |

## File Permissions

Ensure the application has proper permissions:

### Linux/Mac
```bash
chmod 755 data/
chmod 755 data/backups/
chmod 755 logs/
```

### Windows
Right-click on directories → Properties → Security → Edit permissions

## Verification

### 1. Check Configuration

Create a test script to verify configuration:

```typescript
// test-config.ts
import { getConfig } from '@/lib/config/assistantConfig';

const config = getConfig();
console.log('Configuration loaded successfully:', config);
```

Run:
```bash
npx ts-node test-config.ts
```

### 2. Check Directory Structure

Verify directories exist:
```bash
ls -la data/
ls -la logs/
```

### 3. Check Type Definitions

Verify TypeScript types are available:
```typescript
import { Assistant, AssistantStatus } from '@/types/assistant';
```

## Next Steps

After completing the setup:

1. **Implement Database Layer** (Task 2)
   - Create database schema
   - Implement AssistantRepository
   - Write unit tests

2. **Implement API Endpoints** (Task 3)
   - Create RESTful API routes
   - Add request validation
   - Implement error handling

3. **Implement Cache Layer** (Task 4)
   - Create IndexedDB cache
   - Implement cache strategies
   - Add cache invalidation

## Troubleshooting

### Permission Denied Errors

If you encounter permission errors:
```bash
# Linux/Mac
sudo chown -R $USER:$USER data/ logs/

# Windows
# Run as Administrator or adjust folder permissions
```

### Module Not Found Errors

If TypeScript can't find modules:
```bash
# Rebuild TypeScript
npm run build

# Clear Next.js cache
rm -rf .next/
```

### Database Path Issues

If the database path is incorrect:
1. Check `DATABASE_PATH` in `.env.local`
2. Ensure the path is relative to project root
3. Verify the directory exists

### Environment Variables Not Loading

If environment variables aren't loading:
1. Restart the development server
2. Check `.env.local` file location (must be in project root)
3. Verify variable names match exactly

## Development vs Production

### Development
- Use `LOG_LEVEL=debug` for detailed logging
- Enable all security features for testing
- Use shorter backup retention for testing

### Production
- Use `LOG_LEVEL=warn` or `LOG_LEVEL=error`
- Enable all security features
- Use appropriate backup retention (30+ days)
- Monitor disk space regularly
- Set up log rotation
- Configure automated backups

## Security Considerations

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Protect database files** - Set appropriate file permissions
3. **Enable CSRF protection** - Especially in production
4. **Enable rate limiting** - Prevent abuse
5. **Regular backups** - Automate and test restore procedures
6. **Monitor logs** - Watch for suspicious activity

## Performance Optimization

1. **Adjust connection pool size** based on load
2. **Configure cache TTL** based on data freshness requirements
3. **Monitor database size** and optimize queries
4. **Use appropriate log levels** to reduce I/O
5. **Regular database maintenance** (VACUUM, ANALYZE)

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the logs in `logs/app.log`
3. Consult the API documentation
4. Check the requirements and design documents

## References

- [Requirements Document](.kiro/specs/assistant-data-persistence/requirements.md)
- [Design Document](.kiro/specs/assistant-data-persistence/design.md)
- [Tasks Document](.kiro/specs/assistant-data-persistence/tasks.md)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
