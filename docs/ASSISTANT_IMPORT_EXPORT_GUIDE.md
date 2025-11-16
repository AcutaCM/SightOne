# Assistant Import/Export Guide

## Overview

The Assistant Import/Export feature allows administrators to backup, share, and restore assistant configurations using JSON files. This is useful for:

- **Backup**: Create backups of assistant configurations
- **Migration**: Move assistants between environments
- **Sharing**: Share custom assistants with other users or teams
- **Version Control**: Track changes to assistant configurations

## Features

### Export Capabilities

1. **Single Assistant Export**
   - Export individual assistant configurations
   - Automatic filename generation
   - JSON format with metadata

2. **Batch Export**
   - Export multiple assistants at once
   - Select specific assistants or export all
   - Single JSON file containing all selected assistants

### Import Capabilities

1. **Single Assistant Import**
   - Import individual assistant configurations
   - Validation of required fields
   - Conflict detection and resolution

2. **Batch Import**
   - Import multiple assistants from a single file
   - Error handling with skip option
   - Progress tracking and detailed results

### Import Options

- **Overwrite Existing**: Update assistants with matching IDs
- **Generate New ID**: Create new assistants with unique IDs
- **Skip Errors**: Continue importing even if some assistants fail

## Usage

### Exporting Assistants

#### Single Export

1. Navigate to the Import/Export panel in the admin area
2. Select the "Export" tab
3. Find the assistant you want to export
4. Click the "Export" button next to the assistant
5. The configuration file will be downloaded automatically

#### Batch Export

1. Navigate to the Import/Export panel
2. Select the "Export" tab
3. Check the boxes next to assistants you want to export
4. Or click "Select All" to export all assistants
5. Click "Batch Export" button
6. A single JSON file containing all selected assistants will be downloaded

### Importing Assistants

#### Basic Import

1. Navigate to the Import/Export panel
2. Select the "Import" tab
3. Configure import options:
   - Check "Overwrite existing" to update existing assistants
   - Check "Generate new ID" to avoid ID conflicts
   - Check "Skip errors" to continue on failures
4. Click the file upload area or drag and drop a JSON file
5. Click "Start Import" button
6. Review the import results

#### Handling ID Conflicts

When importing an assistant with an ID that already exists:

**Option 1: Overwrite**
- Enable "Overwrite existing" option
- The existing assistant will be updated with new data
- Original creation date is preserved

**Option 2: Generate New ID**
- Enable "Generate new ID" option
- A new assistant will be created with a unique ID
- Format: `original-id-timestamp`

**Option 3: Manual Resolution**
- Edit the JSON file before importing
- Change the `id` field to a unique value
- Import the modified file

## File Format

### Single Assistant Export

```json
{
  "version": "1.0.0",
  "exportedAt": "2024-01-15T10:30:00.000Z",
  "assistant": {
    "id": "my-assistant",
    "title": "My Custom Assistant",
    "desc": "A helpful assistant for specific tasks",
    "emoji": "🤖",
    "prompt": "You are a helpful assistant...",
    "tags": ["productivity", "automation"],
    "isPublic": true,
    "status": "published",
    "author": "admin"
  }
}
```

### Batch Export

```json
{
  "version": "1.0.0",
  "exportedAt": "2024-01-15T10:30:00.000Z",
  "count": 2,
  "assistants": [
    {
      "id": "assistant-1",
      "title": "First Assistant",
      ...
    },
    {
      "id": "assistant-2",
      "title": "Second Assistant",
      ...
    }
  ]
}
```

## Field Reference

### Required Fields

- `id` (string): Unique identifier for the assistant
- `title` (string): Display name of the assistant
- `desc` (string): Description of the assistant's purpose
- `emoji` (string): Emoji icon for the assistant
- `prompt` (string): System prompt that defines the assistant's behavior

### Optional Fields

- `tags` (array): Array of tag strings for categorization
- `isPublic` (boolean): Whether the assistant is publicly visible (default: true)
- `status` (string): Publication status - "published" or "draft" (default: "published")
- `author` (string): Creator of the assistant (default: "imported")

## Validation Rules

The import process validates the following:

1. **File Format**: Must be valid JSON
2. **Version**: Must include version field
3. **Required Fields**: All required fields must be present
4. **Field Types**: Fields must be of correct type
   - Strings: id, title, desc, emoji, prompt, status, author
   - Array: tags
   - Boolean: isPublic
5. **Status Values**: Must be "published" or "draft"
6. **ID Format**: Must be a non-empty string

## Error Handling

### Common Errors

#### Invalid JSON Format
```
Error: Invalid JSON format
Solution: Ensure the file is valid JSON (use a JSON validator)
```

#### Missing Required Field
```
Error: Missing required field: prompt
Solution: Add the missing field to the JSON file
```

#### ID Conflict
```
Error: Assistant with ID "my-assistant" already exists
Solution: Enable "Overwrite" or "Generate new ID" option
```

#### Invalid Field Type
```
Error: Field "tags" must be an array
Solution: Correct the field type in the JSON file
```

### Batch Import Error Handling

When importing multiple assistants:

- **Skip Errors Enabled**: Failed imports are logged, successful imports continue
- **Skip Errors Disabled**: Import stops at first error
- **Results Summary**: Shows count of successful and failed imports

## Best Practices

### Exporting

1. **Regular Backups**: Export assistants regularly for backup
2. **Version Control**: Include export date in filename
3. **Documentation**: Add comments in JSON (if supported by your editor)
4. **Testing**: Test exports in a development environment first

### Importing

1. **Validate First**: Check JSON format before importing
2. **Test Environment**: Import to test environment first
3. **Backup Before Overwrite**: Export existing assistants before overwriting
4. **Review Results**: Always check import results for errors
5. **Incremental Import**: Import in small batches for easier troubleshooting

### File Management

1. **Naming Convention**: Use descriptive filenames
   - Single: `assistant-name-YYYY-MM-DD.json`
   - Batch: `assistants-batch-YYYY-MM-DD.json`
2. **Organization**: Store exports in organized folders
3. **Version Control**: Consider using Git for assistant configurations
4. **Security**: Protect exported files (may contain sensitive prompts)

## API Reference

### ImportExportService

#### exportAssistant(assistantId: string): Promise<string>

Exports a single assistant configuration to JSON string.

**Parameters:**
- `assistantId`: ID of the assistant to export

**Returns:** JSON string of the assistant configuration

**Throws:** Error if assistant not found

#### exportMultipleAssistants(assistantIds: string[]): Promise<string>

Exports multiple assistants to a single JSON string.

**Parameters:**
- `assistantIds`: Array of assistant IDs to export

**Returns:** JSON string containing all assistants

**Throws:** Error if no valid assistants found

#### importAssistant(jsonData: string, options): Promise<ImportResult>

Imports a single assistant from JSON string.

**Parameters:**
- `jsonData`: JSON string containing assistant configuration
- `options`: Import options object
  - `overwrite?: boolean`: Update existing assistant
  - `generateNewId?: boolean`: Create new ID if conflict

**Returns:** ImportResult object with status and messages

#### importMultipleAssistants(jsonData: string, options): Promise<ImportResult[]>

Imports multiple assistants from JSON string.

**Parameters:**
- `jsonData`: JSON string containing multiple assistants
- `options`: Import options object
  - `overwrite?: boolean`: Update existing assistants
  - `generateNewId?: boolean`: Create new IDs if conflicts
  - `skipErrors?: boolean`: Continue on errors

**Returns:** Array of ImportResult objects

#### downloadAssistantConfig(assistantId: string, filename?: string): Promise<void>

Downloads assistant configuration as a file.

**Parameters:**
- `assistantId`: ID of the assistant to export
- `filename`: Optional custom filename

#### readUploadedFile(file: File): Promise<string>

Reads and parses an uploaded file.

**Parameters:**
- `file`: File object from input

**Returns:** File content as string

## Troubleshooting

### Import Fails Silently

**Symptoms:** Import completes but no assistants are added

**Possible Causes:**
- Validation errors not displayed
- ID conflicts without proper options
- Database connection issues

**Solutions:**
1. Check browser console for errors
2. Enable "Generate new ID" option
3. Verify database is accessible
4. Check import results panel for details

### Export File is Empty

**Symptoms:** Downloaded file has no content or is invalid

**Possible Causes:**
- Assistant not found in database
- Serialization error
- Browser download blocked

**Solutions:**
1. Verify assistant exists
2. Check browser console for errors
3. Try different browser
4. Check browser download settings

### Batch Import Partially Fails

**Symptoms:** Some assistants import successfully, others fail

**Possible Causes:**
- Mixed valid and invalid configurations
- Some ID conflicts
- Validation errors in specific assistants

**Solutions:**
1. Review import results for specific errors
2. Fix invalid configurations
3. Enable "Skip errors" to import valid ones
4. Import failed ones separately after fixing

## Security Considerations

### Exported Files

- May contain sensitive system prompts
- Should be stored securely
- Access should be restricted to authorized users
- Consider encryption for sensitive assistants

### Imported Files

- Validate source before importing
- Review content before importing to production
- Test in development environment first
- Scan for malicious content if from untrusted sources

### Audit Trail

All import/export operations are logged with:
- Timestamp
- User ID (if available)
- Operation type (import/export)
- Assistant ID
- Success/failure status
- Error details (if any)

## Examples

### Example 1: Backup All Assistants

```typescript
// In admin panel
1. Click "Select All" in Export tab
2. Click "Batch Export"
3. Save file as: assistants-backup-2024-01-15.json
```

### Example 2: Share Custom Assistant

```typescript
// Export
1. Find your custom assistant
2. Click "Export" button
3. Share the downloaded JSON file

// Import (recipient)
1. Upload received JSON file
2. Enable "Generate new ID" (to avoid conflicts)
3. Click "Start Import"
```

### Example 3: Migrate Between Environments

```typescript
// Development
1. Export all assistants
2. Save as: assistants-dev-to-prod.json

// Production
1. Upload the file
2. Enable "Overwrite existing" (if updating)
3. Enable "Skip errors" (to continue on conflicts)
4. Click "Start Import"
5. Review results
```

### Example 4: Version Control

```typescript
// Regular backup workflow
1. Export all assistants weekly
2. Name: assistants-backup-YYYY-MM-DD.json
3. Commit to Git repository
4. Tag with version number
```

## Related Documentation

- [Assistant Management System](./ASSISTANT_MANAGEMENT_IMPLEMENTATION_GUIDE.md)
- [Assistant Data Persistence](./ASSISTANT_PERSISTENCE_QUICK_START.md)
- [Admin Page Guide](./ADMIN_PAGE_TASK1_COMPLETE.md)
- [Security Implementation](./SECURITY_IMPLEMENTATION.md)

## Support

For issues or questions:
1. Check this documentation
2. Review error messages in import results
3. Check browser console for detailed errors
4. Contact system administrator
