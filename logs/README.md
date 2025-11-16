# Assistant Data Persistence - Logs Directory

This directory contains application logs for the assistant data persistence system.

## Directory Structure

```
logs/
├── app.log                # Main application log
├── app.log.1              # Rotated log file
├── app.log.2              # Rotated log file
├── error.log              # Error-only log
└── README.md              # This file
```

## Log Files

### app.log
The main application log file containing all log levels (debug, info, warn, error) based on the configured log level.

### error.log
A separate log file containing only error-level messages for quick troubleshooting.

### Rotated Logs
When a log file reaches the maximum size (default: 10MB), it is automatically rotated:
- `app.log` → `app.log.1`
- `app.log.1` → `app.log.2`
- etc.

## Log Levels

The system supports the following log levels (configured via `LOG_LEVEL` environment variable):

- **debug**: Detailed information for debugging
- **info**: General informational messages (default)
- **warn**: Warning messages for potentially harmful situations
- **error**: Error messages for serious problems

## Log Format

Each log entry includes:
```
[TIMESTAMP] [LEVEL] [MODULE] MESSAGE
```

Example:
```
[2025-11-03T09:41:23.456Z] [INFO] [AssistantRepository] Created assistant: abc123
[2025-11-03T09:41:24.789Z] [ERROR] [DatabaseConnection] Connection failed: timeout
```

## Configuration

Logging configuration is managed through environment variables in `.env.local`:

```env
LOG_LEVEL=info
LOG_DIR=./logs
LOG_MAX_SIZE=10485760
```

## Important Notes

1. **Log files are excluded from git** - See .gitignore
2. **Logs are rotated automatically** when they reach the maximum size
3. **Monitor disk space** - Logs can accumulate over time
4. **Sensitive data** - Logs should not contain passwords or API keys

## Viewing Logs

### Tail the log file (Linux/Mac)
```bash
tail -f logs/app.log
```

### Tail the log file (Windows PowerShell)
```powershell
Get-Content logs/app.log -Wait -Tail 50
```

### Search for errors
```bash
grep ERROR logs/app.log
```

### View last 100 lines
```bash
tail -n 100 logs/app.log
```

## Troubleshooting

### No logs being written
1. Check file permissions on the logs directory
2. Verify LOG_DIR environment variable is set correctly
3. Check if the application has write access

### Logs growing too large
1. Reduce LOG_LEVEL to 'warn' or 'error' in production
2. Decrease LOG_MAX_SIZE to rotate more frequently
3. Implement log cleanup scripts

### Missing log entries
1. Check if LOG_LEVEL is set too high (e.g., 'error' only)
2. Verify the logger is properly initialized
3. Check for buffering issues

## Log Cleanup

Logs are not automatically deleted. Implement a cleanup strategy:

### Manual cleanup (delete logs older than 30 days)
```bash
find logs/ -name "*.log*" -mtime +30 -delete
```

### Scheduled cleanup (cron job example)
```bash
0 3 * * * find /path/to/logs/ -name "*.log*" -mtime +30 -delete
```

## Security Considerations

1. **Restrict access** - Ensure only authorized users can read logs
2. **Sanitize sensitive data** - Never log passwords, tokens, or personal information
3. **Regular audits** - Review logs periodically for security issues
4. **Secure transmission** - Use secure channels when transmitting logs

## Performance Impact

Logging can impact performance:
- Use appropriate log levels (avoid 'debug' in production)
- Consider asynchronous logging for high-traffic applications
- Monitor I/O performance if logging is intensive
