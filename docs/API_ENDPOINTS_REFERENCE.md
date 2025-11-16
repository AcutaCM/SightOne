# Assistant Data Persistence API Reference

## Overview

This document provides a complete reference for the RESTful API endpoints that manage assistant data persistence. All endpoints follow REST conventions and return JSON responses.

## Base URL

```
/api/assistants
```

## Authentication

Currently, authentication is handled at the application level. Future versions will include JWT-based authentication.

## Response Format

All API responses follow this structure:

```typescript
{
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
    traceId?: string;
  };
}
```

## Endpoints

### 1. List Assistants

**GET** `/api/assistants`

Retrieves a paginated list of assistants with optional filtering.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number (must be > 0) |
| `pageSize` | number | 20 | Items per page (1-100) |
| `status` | string | - | Filter by status: `draft`, `pending`, `published`, `rejected` |
| `author` | string | - | Filter by author username |
| `search` | string | - | Search in title and description |

#### Response

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "abc123",
        "title": "Code Helper",
        "desc": "Helps with coding tasks",
        "emoji": "🤖",
        "prompt": "You are a helpful coding assistant...",
        "tags": ["coding", "helper"],
        "isPublic": true,
        "status": "published",
        "author": "user123",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-02T00:00:00.000Z",
        "version": 2
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

#### Status Codes

- `200 OK` - Success
- `400 Bad Request` - Invalid parameters
- `500 Internal Server Error` - Server error

#### Example

```bash
# Get first page of published assistants
curl "http://localhost:3000/api/assistants?status=published&page=1&pageSize=10"

# Search for assistants
curl "http://localhost:3000/api/assistants?search=coding"
```

---

### 2. Get Assistant by ID

**GET** `/api/assistants/[id]`

Retrieves a single assistant by its unique ID.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Unique assistant identifier |

#### Response

```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "title": "Code Helper",
    "desc": "Helps with coding tasks",
    "emoji": "🤖",
    "prompt": "You are a helpful coding assistant...",
    "tags": ["coding", "helper"],
    "isPublic": true,
    "status": "published",
    "author": "user123",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "version": 1
  }
}
```

#### Status Codes

- `200 OK` - Success
- `400 Bad Request` - Invalid ID
- `404 Not Found` - Assistant not found
- `500 Internal Server Error` - Server error

#### Example

```bash
curl "http://localhost:3000/api/assistants/abc123"
```

---

### 3. Create Assistant

**POST** `/api/assistants`

Creates a new assistant.

#### Request Body

```json
{
  "title": "Code Helper",
  "desc": "Helps with coding tasks",
  "emoji": "🤖",
  "prompt": "You are a helpful coding assistant...",
  "tags": ["coding", "helper"],
  "isPublic": true
}
```

#### Field Validation

| Field | Type | Required | Max Length | Description |
|-------|------|----------|------------|-------------|
| `title` | string | Yes | 100 | Assistant title |
| `desc` | string | Yes | 200 | Short description |
| `emoji` | string | Yes | - | Emoji icon |
| `prompt` | string | Yes | 2000 | System prompt |
| `tags` | string[] | No | - | Category tags |
| `isPublic` | boolean | No | - | Public visibility (default: false) |

#### Response

```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "title": "Code Helper",
    "desc": "Helps with coding tasks",
    "emoji": "🤖",
    "prompt": "You are a helpful coding assistant...",
    "tags": ["coding", "helper"],
    "isPublic": true,
    "status": "draft",
    "author": "system",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "version": 1
  }
}
```

#### Status Codes

- `201 Created` - Success
- `400 Bad Request` - Validation error
- `500 Internal Server Error` - Server error

#### Example

```bash
curl -X POST "http://localhost:3000/api/assistants" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Code Helper",
    "desc": "Helps with coding",
    "emoji": "🤖",
    "prompt": "You are helpful",
    "isPublic": true
  }'
```

---

### 4. Update Assistant

**PUT** `/api/assistants/[id]`

Updates an existing assistant with optimistic locking.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Unique assistant identifier |

#### Request Body

```json
{
  "title": "Updated Title",
  "desc": "Updated description",
  "version": 1
}
```

**Note:** The `version` field is **required** for optimistic locking. All other fields are optional.

#### Field Validation

Same as Create Assistant, plus:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `version` | number | Yes | Current version for optimistic locking |

#### Response

```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "title": "Updated Title",
    "desc": "Updated description",
    "emoji": "🤖",
    "prompt": "You are a helpful coding assistant...",
    "tags": ["coding", "helper"],
    "isPublic": true,
    "status": "draft",
    "author": "system",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z",
    "version": 2
  }
}
```

#### Status Codes

- `200 OK` - Success
- `400 Bad Request` - Validation error
- `404 Not Found` - Assistant not found
- `409 Conflict` - Version conflict (data modified by another user)
- `500 Internal Server Error` - Server error

#### Example

```bash
curl -X PUT "http://localhost:3000/api/assistants/abc123" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "version": 1
  }'
```

---

### 5. Delete Assistant

**DELETE** `/api/assistants/[id]`

Deletes an assistant permanently.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Unique assistant identifier |

#### Response

```json
{
  "success": true,
  "data": {
    "id": "abc123"
  }
}
```

#### Status Codes

- `200 OK` - Success
- `400 Bad Request` - Invalid ID
- `404 Not Found` - Assistant not found
- `500 Internal Server Error` - Server error

#### Example

```bash
curl -X DELETE "http://localhost:3000/api/assistants/abc123"
```

---

### 6. Update Assistant Status

**PATCH** `/api/assistants/[id]/status`

Updates the status of an assistant (for review workflow).

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Unique assistant identifier |

#### Request Body

```json
{
  "status": "published",
  "reviewNote": "Approved for publication",
  "version": 1
}
```

#### Field Validation

| Field | Type | Required | Max Length | Description |
|-------|------|----------|------------|-------------|
| `status` | string | Yes | - | One of: `draft`, `pending`, `published`, `rejected` |
| `reviewNote` | string | No | 500 | Review comment |
| `version` | number | Yes | - | Current version for optimistic locking |

#### Response

```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "title": "Code Helper",
    "desc": "Helps with coding tasks",
    "emoji": "🤖",
    "prompt": "You are a helpful coding assistant...",
    "tags": ["coding", "helper"],
    "isPublic": true,
    "status": "published",
    "author": "system",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z",
    "reviewedAt": "2024-01-02T00:00:00.000Z",
    "publishedAt": "2024-01-02T00:00:00.000Z",
    "reviewNote": "Approved for publication",
    "version": 2
  }
}
```

#### Status Codes

- `200 OK` - Success
- `400 Bad Request` - Validation error
- `404 Not Found` - Assistant not found
- `409 Conflict` - Version conflict
- `500 Internal Server Error` - Server error

#### Example

```bash
curl -X PATCH "http://localhost:3000/api/assistants/abc123/status" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "published",
    "reviewNote": "Looks good!",
    "version": 1
  }'
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_PARAMETER` | 400 | Invalid query parameter or path parameter |
| `VALIDATION_ERROR` | 400 | Request body validation failed |
| `NOT_FOUND` | 404 | Resource not found |
| `VERSION_CONFLICT` | 409 | Optimistic locking conflict |
| `INTERNAL_ERROR` | 500 | Server error |

### Version Conflict Handling

When you receive a `409 Conflict` response:

1. Fetch the latest version of the assistant
2. Show the user the conflict
3. Allow the user to:
   - Refresh and see the latest data
   - Merge their changes
   - Discard their changes

Example conflict response:

```json
{
  "success": false,
  "error": {
    "code": "VERSION_CONFLICT",
    "message": "This assistant has been modified by another user. Please refresh and try again."
  }
}
```

---

## Rate Limiting

Currently, no rate limiting is enforced. Future versions will implement:

- 100 requests per minute per IP
- 1000 requests per hour per user

---

## Caching

API responses include cache control headers:

```
Cache-Control: no-cache, no-store, must-revalidate
```

Client-side caching is handled by IndexedDB (see IndexedDB Cache documentation).

---

## Testing

Run the integration tests:

```bash
npm test -- __tests__/api/assistants.test.ts
```

All 22 tests should pass:
- ✓ GET /api/assistants (5 tests)
- ✓ GET /api/assistants/[id] (2 tests)
- ✓ POST /api/assistants (2 tests)
- ✓ PUT /api/assistants/[id] (3 tests)
- ✓ DELETE /api/assistants/[id] (2 tests)
- ✓ PATCH /api/assistants/[id]/status (4 tests)
- ✓ Error Handling (1 test)
- ✓ Data Validation (3 tests)

---

## Next Steps

1. **Implement IndexedDB Cache Layer** - Client-side caching for offline support
2. **Add Authentication** - JWT-based user authentication
3. **Implement Rate Limiting** - Protect against abuse
4. **Add Backup/Restore Endpoints** - Data backup and recovery
5. **Add Metrics Endpoint** - Monitor API performance

---

## Related Documentation

- [Database Layer Documentation](./TASK_2_DATABASE_LAYER_COMPLETE.md)
- [Type Definitions](../types/assistant.ts)
- [Repository Implementation](../lib/db/assistantRepository.ts)
- [Design Document](../.kiro/specs/assistant-data-persistence/design.md)
