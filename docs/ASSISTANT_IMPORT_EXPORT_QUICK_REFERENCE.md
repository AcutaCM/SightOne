# Assistant Import/Export - Quick Reference

## Quick Start

### Export Single Assistant
1. Admin Panel → Import/Export
2. Export tab → Find assistant
3. Click "Export" → File downloads

### Export Multiple Assistants
1. Admin Panel → Import/Export
2. Export tab → Select assistants
3. Click "Batch Export" → File downloads

### Import Assistants
1. Admin Panel → Import/Export
2. Import tab → Configure options
3. Upload JSON file → Click "Start Import"

## Import Options

| Option | Description | Use When |
|--------|-------------|----------|
| Overwrite existing | Update existing assistants | Updating configurations |
| Generate new ID | Create new assistants | Avoiding conflicts |
| Skip errors | Continue on failures | Batch importing |

## File Format

### Single Export
```json
{
  "version": "1.0.0",
  "exportedAt": "2024-01-15T10:30:00.000Z",
  "assistant": { /* assistant data */ }
}
```

### Batch Export
```json
{
  "version": "1.0.0",
  "exportedAt": "2024-01-15T10:30:00.000Z",
  "count": 2,
  "assistants": [ /* array of assistants */ ]
}
```

## Required Fields

- ✅ `id` - Unique identifier
- ✅ `title` - Display name
- ✅ `desc` - Description
- ✅ `emoji` - Icon emoji
- ✅ `prompt` - System prompt

## Optional Fields

- `tags` - Array of strings
- `isPublic` - Boolean (default: true)
- `status` - "published" or "draft"
- `author` - String (default: "imported")

## Common Errors

### ID Conflict
```
Error: Assistant with ID "xxx" already exists
Fix: Enable "Overwrite" or "Generate new ID"
```

### Invalid JSON
```
Error: Invalid JSON format
Fix: Validate JSON syntax
```

### Missing Field
```
Error: Missing required field: prompt
Fix: Add missing field to JSON
```

## Best Practices

### Exporting
- ✅ Regular backups
- ✅ Descriptive filenames
- ✅ Version control
- ✅ Secure storage

### Importing
- ✅ Validate JSON first
- ✅ Test in dev environment
- ✅ Backup before overwrite
- ✅ Review import results

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Select All | Ctrl/Cmd + A (in list) |
| Clear Selection | Esc |
| Upload File | Ctrl/Cmd + O |

## API Quick Reference

```typescript
// Export single
await importExportService.exportAssistant(id);

// Export multiple
await importExportService.exportMultipleAssistants([id1, id2]);

// Import single
await importExportService.importAssistant(jsonData, options);

// Import multiple
await importExportService.importMultipleAssistants(jsonData, options);

// Download file
await importExportService.downloadAssistantConfig(id, filename);

// Read uploaded file
await importExportService.readUploadedFile(file);
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Import fails silently | Check console, enable "Generate new ID" |
| Export file empty | Verify assistant exists, check console |
| Partial batch import | Review results, fix errors, re-import |
| File won't upload | Check file type (.json), check size |

## Security Checklist

- [ ] Store exports securely
- [ ] Restrict access to authorized users
- [ ] Validate source before importing
- [ ] Test in dev environment first
- [ ] Review content before production import
- [ ] Check audit logs regularly

## File Naming Convention

```
Single: assistant-{name}-{YYYY-MM-DD}.json
Batch:  assistants-batch-{YYYY-MM-DD}.json
Backup: assistants-backup-{YYYY-MM-DD}.json
```

## Status Indicators

| Icon | Meaning |
|------|---------|
| ✅ | Success |
| ❌ | Failed |
| ⚠️ | Warning |
| 📁 | File upload area |
| 📄 | Selected file |

## Import Result Codes

| Code | Description |
|------|-------------|
| Success | Assistant imported successfully |
| ID Conflict | Assistant ID already exists |
| Validation Failed | Required fields missing or invalid |
| Parse Error | Invalid JSON format |

## Related Commands

```bash
# Validate JSON file
cat assistant.json | jq .

# Pretty print JSON
cat assistant.json | jq . > formatted.json

# Check file size
ls -lh assistant.json

# Count assistants in batch file
cat batch.json | jq '.assistants | length'
```

## Support Resources

- 📖 [Full Documentation](./ASSISTANT_IMPORT_EXPORT_GUIDE.md)
- 🔧 [API Reference](./ASSISTANT_IMPORT_EXPORT_GUIDE.md#api-reference)
- 🐛 [Troubleshooting](./ASSISTANT_IMPORT_EXPORT_GUIDE.md#troubleshooting)
- 🔒 [Security](./ASSISTANT_IMPORT_EXPORT_GUIDE.md#security-considerations)
