# Security Quick Reference Guide

## Quick Start

### 1. Validate User Input

```typescript
import { validateCreateAssistantRequest, ValidationError } from '@/lib/security/validation';

try {
  const validated = validateCreateAssistantRequest(req.body);
  // Use validated data
} catch (error) {
  if (error instanceof ValidationError) {
    return res.status(400).json({ error: error.message });
  }
}
```

### 2. Check Permissions

```typescript
import { getUserContext, requirePermission, Permission } from '@/lib/security/accessControl';

const user = getUserContext(req);
requirePermission(user, Permission.CREATE_ASSISTANT);
```

### 3. Encrypt Data

```typescript
import { encrypt, decrypt } from '@/lib/security/encryption';

const encrypted = encrypt('sensitive data');
const decrypted = decrypt(encrypted);
```

### 4. Apply Middleware

```typescript
import { compose, withRateLimit, withSecurityHeaders } from '@/lib/security/middleware';

export const POST = compose(
  withSecurityHeaders,
  withRateLimit()
)(handler);
```

## Common Patterns

### API Route with Full Security

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { compose, withRateLimit, withSecurityHeaders, errorResponse } from '@/lib/security/middleware';
import { validateCreateAssistantRequest, ValidationError } from '@/lib/security/validation';
import { getUserContext, requirePermission, Permission, AuthorizationError } from '@/lib/security/accessControl';
import { logAccess } from '@/lib/security/accessControl';

async function handler(req: NextRequest) {
  try {
    // 1. Get user context
    const user = getUserContext(req);
    
    // 2. Check permission
    requirePermission(user, Permission.CREATE_ASSISTANT);
    
    // 3. Validate input
    const body = await req.json();
    const validated = validateCreateAssistantRequest(body);
    
    // 4. Process request
    const result = await createAssistant(validated, user);
    
    // 5. Log success
    logAccess(user, 'CREATE', 'assistant', result.id, true);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof ValidationError) {
      return errorResponse(error, 400);
    }
    if (error instanceof AuthorizationError) {
      return errorResponse(error, 403);
    }
    return errorResponse(error as Error, 500);
  }
}

export const POST = compose(
  withSecurityHeaders,
  withRateLimit({ limit: 100, windowMs: 60000 })
)(handler);
```

### Validate Individual Fields

```typescript
import { validateTitle, validateDescription, ValidationError } from '@/lib/security/validation';

try {
  const title = validateTitle(userInput.title);
  const desc = validateDescription(userInput.desc);
} catch (error) {
  console.error(error.message);
}
```

### Check Multiple Permissions

```typescript
import { hasAnyPermission, hasAllPermissions, Permission } from '@/lib/security/accessControl';

// User needs at least one permission
if (hasAnyPermission(user, [Permission.UPDATE_ASSISTANT, Permission.DELETE_ASSISTANT])) {
  // Allow action
}

// User needs all permissions
if (hasAllPermissions(user, [Permission.REVIEW_ASSISTANT, Permission.PUBLISH_ASSISTANT])) {
  // Allow action
}
```

### Encrypt Objects

```typescript
import { encryptObject, decryptObject } from '@/lib/security/encryption';

const data = { secret: 'value', nested: { key: 'data' } };
const encrypted = encryptObject(data);
const decrypted = decryptObject<typeof data>(encrypted);
```

### Backup Encryption with Password

```typescript
import { encryptBackupFile, decryptBackupFile } from '@/lib/security/encryption';

// Encrypt
const { encrypted, salt } = await encryptBackupFile(backupData, 'password123');

// Decrypt
const decrypted = await decryptBackupFile(encrypted, 'password123', salt);
```

### Key Management

```typescript
import { keyManager } from '@/lib/security/encryption';

// Generate and store
const key = keyManager.generateKey();
keyManager.storeKey('my-key', key);

// Rotate
const { oldKey, newKey } = keyManager.rotateKey('my-key');

// Export/Import
const exported = keyManager.exportKey('my-key');
keyManager.importKey('new-key', exported);
```

### CSRF Protection

```typescript
import { generateCSRFToken, verifyCSRFToken } from '@/lib/security/encryption';

// Generate token
const token = generateCSRFToken();

// Set cookie and return to client
res.cookie('csrf-token', token);

// Verify on subsequent requests
const clientToken = req.headers.get('x-csrf-token');
const cookieToken = req.cookies.get('csrf-token');

if (!verifyCSRFToken(clientToken, cookieToken)) {
  return res.status(403).json({ error: 'Invalid CSRF token' });
}
```

### Audit Logging

```typescript
import { logAccess, auditLogger } from '@/lib/security/accessControl';

// Log access
logAccess(user, 'UPDATE', 'assistant', assistantId, true, { changes: ['title'] });

// Query logs
const logs = auditLogger.getLogs({
  userId: 'user-123',
  action: 'DELETE',
  startDate: new Date('2024-01-01'),
});
```

## Validation Rules

| Field | Min | Max | Pattern | Required |
|-------|-----|-----|---------|----------|
| title | 1 | 100 | No HTML | Yes |
| desc | 1 | 200 | No HTML | Yes |
| prompt | 1 | 2000 | - | Yes |
| emoji | - | - | Valid emoji | Yes |
| author | 1 | 100 | [a-zA-Z0-9_-] | Yes |
| tags | - | 10 items | 30 chars each | No |

## Permissions Matrix

| Role | Permissions |
|------|-------------|
| Admin | All permissions |
| User | create, read, update, delete |
| Guest | read only |

## Security Headers

Automatically applied by `withSecurityHeaders`:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; ...
```

## Rate Limiting

Default configuration:
- Limit: 100 requests
- Window: 60 seconds (60000ms)
- Key: IP address

Custom configuration:
```typescript
withRateLimit(handler, {
  limit: 50,
  windowMs: 30000,
  keyGenerator: (req) => req.headers.get('x-api-key') || 'default'
})
```

## Error Codes

| Code | Description |
|------|-------------|
| INVALID_TYPE | Wrong data type |
| TOO_SHORT | Below minimum length |
| TOO_LONG | Exceeds maximum length |
| INVALID_CHARACTERS | Contains forbidden characters |
| INVALID_FORMAT | Wrong format |
| RATE_LIMIT_EXCEEDED | Too many requests |
| CSRF_TOKEN_INVALID | Invalid CSRF token |
| UNAUTHORIZED | Not authenticated |
| PERMISSION_DENIED | Insufficient permissions |

## Environment Variables

```env
# Required
ENCRYPTION_KEY=64_character_hex_string

# Optional
LOG_LEVEL=INFO
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

## Testing

```bash
# All security tests
npm test -- __tests__/security

# Specific test suite
npm test -- __tests__/security/validation.test.ts
npm test -- __tests__/security/accessControl.test.ts
npm test -- __tests__/security/encryption.test.ts
```

## Common Mistakes to Avoid

❌ **Don't:**
- Trust client-side validation only
- Store encryption keys in code
- Skip input sanitization
- Ignore permission checks
- Use weak encryption
- Expose detailed errors to users

✅ **Do:**
- Validate on server side
- Use environment variables for keys
- Sanitize all user input
- Check permissions on every request
- Use strong encryption (AES-256-GCM)
- Log detailed errors, show generic messages

## Quick Checklist

- [ ] All user input validated
- [ ] XSS protection enabled
- [ ] SQL injection prevention in place
- [ ] CSRF tokens used
- [ ] Rate limiting configured
- [ ] Security headers set
- [ ] Permissions checked
- [ ] Audit logging enabled
- [ ] Encryption keys in environment
- [ ] HTTPS enabled (production)

## Support

For security issues or questions:
1. Check `docs/SECURITY_IMPLEMENTATION.md`
2. Review test files in `__tests__/security/`
3. Contact security team

## Resources

- [Full Documentation](./SECURITY_IMPLEMENTATION.md)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security](https://nodejs.org/en/docs/guides/security/)
