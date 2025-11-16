# Assistant API - Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will help you quickly test the Assistant Data Persistence API.

## Prerequisites

- Node.js installed
- Project dependencies installed (`npm install`)
- Development server running (`npm run dev`)

## Step 1: Run Tests

Verify everything works:

```bash
cd drone-analyzer-nextjs
npm test -- __tests__/api/assistants.test.ts
```

Expected output:
```
✓ 22 tests passing
```

## Step 2: Start Development Server

```bash
npm run dev
```

Server will start at `http://localhost:3000`

## Step 3: Test API Endpoints

### Using cURL

#### 1. Create an Assistant

```bash
curl -X POST http://localhost:3000/api/assistants \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Code Helper",
    "desc": "Helps with coding tasks",
    "emoji": "🤖",
    "prompt": "You are a helpful coding assistant",
    "tags": ["coding", "helper"],
    "isPublic": true
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "abc123xyz",
    "title": "Code Helper",
    "status": "draft",
    "version": 1,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Save the `id` from the response!**

#### 2. List All Assistants

```bash
curl http://localhost:3000/api/assistants
```

#### 3. Get Specific Assistant

```bash
# Replace {id} with the ID from step 1
curl http://localhost:3000/api/assistants/{id}
```

#### 4. Update Assistant

```bash
curl -X PUT http://localhost:3000/api/assistants/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Advanced Code Helper",
    "version": 1
  }'
```

#### 5. Update Status

```bash
curl -X PATCH http://localhost:3000/api/assistants/{id}/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "published",
    "reviewNote": "Approved!",
    "version": 2
  }'
```

#### 6. Delete Assistant

```bash
curl -X DELETE http://localhost:3000/api/assistants/{id}
```

### Using JavaScript/Fetch

```javascript
// 1. Create
const response = await fetch('http://localhost:3000/api/assistants', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Code Helper',
    desc: 'Helps with coding',
    emoji: '🤖',
    prompt: 'You are helpful',
    isPublic: true
  })
});
const { data } = await response.json();
console.log('Created:', data.id);

// 2. List
const list = await fetch('http://localhost:3000/api/assistants');
const { data: listData } = await list.json();
console.log('Total:', listData.total);

// 3. Get by ID
const single = await fetch(`http://localhost:3000/api/assistants/${data.id}`);
const { data: assistant } = await single.json();
console.log('Assistant:', assistant.title);

// 4. Update
const update = await fetch(`http://localhost:3000/api/assistants/${data.id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Updated Title',
    version: assistant.version
  })
});

// 5. Update Status
const status = await fetch(`http://localhost:3000/api/assistants/${data.id}/status`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'published',
    version: assistant.version + 1
  })
});

// 6. Delete
await fetch(`http://localhost:3000/api/assistants/${data.id}`, {
  method: 'DELETE'
});
```

## Step 4: Test Pagination & Filtering

### Pagination

```bash
# Page 1, 10 items per page
curl "http://localhost:3000/api/assistants?page=1&pageSize=10"

# Page 2
curl "http://localhost:3000/api/assistants?page=2&pageSize=10"
```

### Filtering by Status

```bash
# Only published assistants
curl "http://localhost:3000/api/assistants?status=published"

# Only drafts
curl "http://localhost:3000/api/assistants?status=draft"
```

### Search

```bash
# Search in title and description
curl "http://localhost:3000/api/assistants?search=coding"
```

### Combined

```bash
# Published assistants with "helper" in title/desc, page 1
curl "http://localhost:3000/api/assistants?status=published&search=helper&page=1&pageSize=20"
```

## Step 5: Test Error Handling

### Version Conflict (409)

```bash
# 1. Create assistant
curl -X POST http://localhost:3000/api/assistants \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","desc":"Test","emoji":"🤖","prompt":"Test","isPublic":true}'

# 2. Update with correct version (works)
curl -X PUT http://localhost:3000/api/assistants/{id} \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated","version":1}'

# 3. Try to update with old version (fails with 409)
curl -X PUT http://localhost:3000/api/assistants/{id} \
  -H "Content-Type: application/json" \
  -d '{"title":"Conflict","version":1}'
```

Expected response:
```json
{
  "success": false,
  "error": {
    "code": "VERSION_CONFLICT",
    "message": "This assistant has been modified by another user. Please refresh and try again."
  }
}
```

### Not Found (404)

```bash
curl http://localhost:3000/api/assistants/non-existent-id
```

Expected response:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Assistant with id non-existent-id not found"
  }
}
```

### Validation Error (400)

```bash
# Title too long (>100 chars)
curl -X POST http://localhost:3000/api/assistants \
  -H "Content-Type: application/json" \
  -d '{
    "title": "This is a very long title that exceeds the maximum allowed length of 100 characters and should trigger a validation error",
    "desc": "Test",
    "emoji": "🤖",
    "prompt": "Test",
    "isPublic": true
  }'
```

Expected response:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title must not exceed 100 characters"
  }
}
```

## Common Issues

### Issue: "Cannot find module 'better-sqlite3'"

**Solution:**
```bash
npm install better-sqlite3 @types/better-sqlite3
```

### Issue: "Database file not found"

**Solution:**
The database is created automatically. Ensure the `data/` directory exists:
```bash
mkdir -p data
```

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Kill the process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:3000 | xargs kill -9
```

## Next Steps

1. ✅ **You've tested the API!**
2. 📖 Read the [Complete API Reference](./API_ENDPOINTS_REFERENCE.md)
3. 🔧 Implement the [IndexedDB Cache Layer](../.kiro/specs/assistant-data-persistence/tasks.md) (Task 4)
4. 🚀 Build the [API Client Service](../.kiro/specs/assistant-data-persistence/tasks.md) (Task 5)

## Useful Commands

```bash
# Run all tests
npm test

# Run API tests only
npm test -- __tests__/api/assistants.test.ts

# Run database tests
npm test -- __tests__/db/

# Check TypeScript errors
npm run type-check

# Start development server
npm run dev

# Build for production
npm run build
```

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/assistants` | List assistants (paginated) |
| GET | `/api/assistants/[id]` | Get assistant by ID |
| POST | `/api/assistants` | Create new assistant |
| PUT | `/api/assistants/[id]` | Update assistant |
| DELETE | `/api/assistants/[id]` | Delete assistant |
| PATCH | `/api/assistants/[id]/status` | Update status |

## Support

- 📖 [API Reference](./API_ENDPOINTS_REFERENCE.md)
- 📋 [Task Completion Report](./TASK_3_API_ENDPOINTS_COMPLETE.md)
- 🎯 [Design Document](../.kiro/specs/assistant-data-persistence/design.md)
- 🧪 [Test File](../__tests__/api/assistants.test.ts)

---

**Happy Coding! 🚀**
