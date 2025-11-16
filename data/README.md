# Assistant Data Persistence - Data Directory

This directory contains the SQLite database and backup files for the assistant data persistence system.

## Directory Structure

```
data/
├── assistants.db          # Main SQLite database file
├── assistants.db-shm      # Shared memory file (auto-generated)
├── assistants.db-wal      # Write-ahead log file (auto-generated)
├── backups/               # Backup files directory
│   └── assistants_backup_YYYYMMDD_HHMMSS.json
└── README.md              # This file
```

## Database Files

### assistants.db
The main SQLite database file containing all assistant data. This file is automatically created on first run.

### assistants.db-shm and assistants.db-wal
These are SQLite's shared memory and write-ahead log files. They are automatically managed by SQLite and should not be manually modified or deleted while the application is running.

## Backups Directory

The `backups/` directory contains JSON backup files of the assistant data. Backups are created:
- Automatically at the scheduled time (default: 02:00 daily)
- Manually through the admin interface
- Before major operations (optional)

### Backup File Format
```
assistants_backup_YYYYMMDD_HHMMSS.json
```

Example: `assistants_backup_20250103_020000.json`

## Important Notes

1. **Do not manually edit database files** - Use the API or admin interface instead
2. **Backup files are retained** for the configured retention period (default: 30 days)
3. **Database files are excluded from git** - See .gitignore
4. **Ensure proper file permissions** - The application needs read/write access to this directory

## Backup and Recovery

### Manual Backup
Use the admin interface or API endpoint:
```
GET /api/assistants/backup/export
```

### Restore from Backup
Use the admin interface or API endpoint:
```
POST /api/assistants/backup/import
```

## Troubleshooting

### Database Locked Error
If you encounter "database is locked" errors:
1. Ensure no other processes are accessing the database
2. Check if there are stale lock files
3. Restart the application

### Corrupted Database
If the database becomes corrupted:
1. Stop the application
2. Restore from the most recent backup
3. Check logs for the cause of corruption

### Disk Space
Monitor disk space regularly. The database and backups can grow over time. Configure backup retention appropriately.

## Configuration

Database configuration is managed through environment variables in `.env.local`:

```env
DATABASE_PATH=./data/assistants.db
DATABASE_BACKUP_DIR=./data/backups
BACKUP_RETENTION_DAYS=30
AUTO_BACKUP_ENABLED=true
AUTO_BACKUP_TIME=02:00
```

See `.env.local.example` for all available configuration options.
