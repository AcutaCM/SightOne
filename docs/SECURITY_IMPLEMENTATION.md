# Security Implementation Guide

## Overview

This document describes the comprehensive security implementation for the Assistant Data Persistence System, covering input validation, access control, data encryption, and security testing.

## Table of Contents

1. [Input Validation and Sanitization](#input-validation-and-sanitization)
2. [Access Control](#access-control)
3. [Data Encryption](#data-encryption)
4. [Security Middleware](#security-middleware)
5. [Security Testing](#security-testing)
6. [Best Practices](#best-practices)

## Input Validation and Sanitization

### Overview

All user input is validated and sanitized to prevent XSS, SQL injection, and other injection attacks.

### Implementation

Location: `lib/security/validation.ts`

### Key Features

- **XSS Protection**: Escapes HTML special characters
- **SQL Injection Prevention**: Sanitizes SQL keywords and dangerous patterns
- **Type Validation**: Ensures correct data types
- **Length Validation**: Enforces min/max length constraints
- **Pattern Validation**: Uses regex to validate format

### Usage Example

```typescript
import { validateCreateAssistantRequest } from '@/lib/security/validation';

try {
  const validated = validateCreateAssistantRequest(requestBody);
  // Use validated data
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation error
    console.error(error.field, error.code, error.message);
  }
}
```

### Validation Rules

| Field | Min Length | Max Length | Pattern | Required |
|-------|-----------|-----------|---------|----------|
| title | 1 | 100 | No HTML tags | Yes |
| desc | 1 | 200 | No HTML tags | Yes |
| prompt | 1 | 2000 | - | Yes |
| emoji | - | - | Valid emoji | Yes |
| author | 1 | 100 | Alphanumeric + _ - | Yes |
| tags | - | 10 items | Max 30 chars each | No |

## Access Control

### Overview

Role-based access control (RBAC) system with fine-grained permissions.

### Implementation

Location: `lib/security/accessControl.ts`

### Roles and Permissions

#### Roles

- **Admin**: Full system access
- **User**: Can create and manage own assistants
- **Guest**: Read-only access

#### Permissions

- `create:assistant` - Create new assistants
- `read:assistant` - View assistants
- `update:assistant` - Update assistants
- `delete:assistant` - Delete assistants
- `publish:assistant` - Publish assistants
- `review:assistant` - Review pending assistants
- `manage:backup` - Manage backups
- `view:logs` - View system logs

### Usage Example

```typescript
import { getUserContext, requirePermission, Permission } from '@/lib/security/accessControl';

// In API route
const user = getUserContext(req);

// Require authentication
requireAuth(user);

// Require specific permission
requirePermission(user, Permission.CREATE_ASSISTANT);

// Require ownership or admin
requireOwnershipOrAdmin(user, assistant.author);
```

### Audit Logging

All access attempts are logged for security auditing:

```typescript
import { logAccess } from '@/lib/security/accessControl';

logAccess(
  user,
  'CREATE',
  'assistant',
  assistantId,
  true, // success
  { title: 'New Assistant' }
);
```

## Data Encryption

### Overview

AES-256-GCM encryption for sensitive data with key management utilities.

### Implementation

Location: `lib/security/encryption.ts`

### Features

- **AES-256-GCM**: Authenticated encryption
- **Key Derivation**: PBKDF2 for password-based encryption
- **Key Management**: Secure key storage and rotation
- **CSRF Tokens**: Cryptographically secure token generation

### Usage Example

#### Basic Encryption

```typescript
import { encrypt, decrypt } from '@/lib/security/encryption';

const plaintext = 'Sensitive data';
const encrypted = encrypt(plaintext);
const decrypted = decrypt(encrypted);
```

#### Object Encryption

```typescript
import { encryptObject, decryptObject } from '@/lib/security/encryption';

const data = { secret: 'value' };
const encrypted = encryptObject(data);
const decrypted = decryptObject(encrypted);
```

#### Backup Encryption

```typescript
import { encryptBackupFile, decryptBackupFile } from '@/lib/security/encryption';

// Encrypt with password
const { encrypted, salt } = await encryptBackupFile(data, 'password');

// Decrypt with password
const decrypted = await decryptBackupFile(encrypted, 'password', salt);
```

#### Key Management

```typescript
import { keyManager } from '@/lib/security/encryption';

// Generate and store key
const key = keyManager.generateKey();
keyManager.storeKey('my-key', key);

// Rotate key
const { oldKey, newKey } = keyManager.rotateKey('my-key');

// Export key
const keyHex = keyManager.exportKey('my-key');
```

### Environment Setup

Generate an encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add to `.env.local`:

```env
ENCRYPTION_KEY=your_generated_key_here
```

## Security Middleware

### Overview

Composable middleware for API route protection.

### Implementation

Location: `lib/security/middleware.ts`

### Available Middleware

#### Rate Limiting

```typescript
import { withRateLimit } from '@/lib/security/middleware';

export const POST = withRateLimit(
  async (req) => {
    // Handler logic
  },
  {
    limit: 100, // requests
    windowMs: 60000, // 1 minute
  }
);
```

#### CORS

```typescript
import { withCORS } from '@/lib/security/middleware';

export const GET = withCORS(
  async (req) => {
    // Handler logic
  },
  {
    origin: 'https://example.com',
    methods: ['GET', 'POST'],
    credentials: true,
  }
);
```

#### CSRF Protection

```typescript
import { withCSRF } from '@/lib/security/middleware';

export const POST = withCSRF(async (req) => {
  // Handler logic
});
```

#### Security Headers

```typescript
import { withSecurityHeaders } from '@/lib/security/middleware';

export const GET = withSecurityHeaders(async (req) => {
  // Handler logic
});
```

#### Composing Middleware

```typescript
import { compose, withRateLimit, withCORS, withSecurityHeaders } from '@/lib/security/middleware';

const handler = async (req) => {
  // Handler logic
};

export const POST = compose(
  withSecurityHeaders,
  withRateLimit(),
  withCORS()
)(handler);
```

## Security Testing

### Overview

Comprehensive test suite covering all security features.

### Test Files

- `__tests__/security/validation.test.ts` - Input validation tests
- `__tests__/security/accessControl.test.ts` - Authorization tests
- `__tests__/security/encryption.test.ts` - Encryption tests
- `__tests__/security/integration.test.ts` - Integration tests

### Running Tests

```bash
npm test -- __tests__/security
```

### Test Coverage

- ✅ XSS attack prevention
- ✅ SQL injection prevention
- ✅ Path traversal prevention
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ Access control
- ✅ Encryption/decryption
- ✅ Key management
- ✅ Audit logging

## Best Practices

### 1. Input Validation

- **Always validate on the server side** - Never trust client input
- **Use whitelist validation** - Define what is allowed, not what is forbidden
- **Sanitize before storage** - Clean data before saving to database
- **Validate data types** - Ensure correct types before processing

### 2. Access Control

- **Principle of least privilege** - Grant minimum necessary permissions
- **Check permissions on every request** - Don't rely on client-side checks
- **Log all access attempts** - Maintain audit trail
- **Implement ownership checks** - Users should only modify their own resources

### 3. Data Encryption

- **Encrypt sensitive data at rest** - Use strong encryption algorithms
- **Use environment variables for keys** - Never hardcode encryption keys
- **Rotate keys regularly** - Implement key rotation strategy
- **Secure key storage** - Protect encryption keys with proper permissions

### 4. API Security

- **Use HTTPS in production** - Encrypt data in transit
- **Implement rate limiting** - Prevent abuse and DoS attacks
- **Add security headers** - Protect against common attacks
- **Validate CSRF tokens** - Prevent cross-site request forgery

### 5. Error Handling

- **Don't expose sensitive information** - Generic error messages in production
- **Log detailed errors** - Keep detailed logs for debugging
- **Use error codes** - Consistent error code system
- **Handle all error cases** - Graceful error handling

### 6. Database Security

- **Use parameterized queries** - Prevent SQL injection
- **Limit database permissions** - Application should have minimal DB permissions
- **Regular backups** - Automated backup strategy
- **Secure backup files** - Encrypt and protect backup files

### 7. Monitoring and Auditing

- **Log security events** - Track authentication, authorization, and errors
- **Monitor for suspicious activity** - Detect unusual patterns
- **Regular security audits** - Review logs and access patterns
- **Incident response plan** - Prepare for security incidents

## Security Checklist

### Development

- [ ] All user input is validated
- [ ] XSS protection is implemented
- [ ] SQL injection protection is in place
- [ ] CSRF tokens are used for state-changing operations
- [ ] Rate limiting is configured
- [ ] Security headers are set
- [ ] Encryption keys are in environment variables
- [ ] Sensitive data is encrypted
- [ ] Access control is enforced
- [ ] Audit logging is implemented

### Testing

- [ ] Security tests pass
- [ ] XSS attacks are blocked
- [ ] SQL injection attempts fail
- [ ] Unauthorized access is denied
- [ ] Rate limiting works correctly
- [ ] Encryption/decryption works
- [ ] CSRF protection is effective

### Deployment

- [ ] HTTPS is enabled
- [ ] Environment variables are set
- [ ] File permissions are secure (600 for sensitive files)
- [ ] Database is secured
- [ ] Backups are encrypted
- [ ] Monitoring is configured
- [ ] Logs are being collected
- [ ] Security headers are active

## Common Vulnerabilities and Mitigations

### XSS (Cross-Site Scripting)

**Risk**: Attackers inject malicious scripts

**Mitigation**:
- Sanitize all user input
- Escape HTML special characters
- Use Content Security Policy headers
- Validate input on server side

### SQL Injection

**Risk**: Attackers manipulate database queries

**Mitigation**:
- Use parameterized queries
- Sanitize SQL input
- Use ORM/query builder
- Limit database permissions

### CSRF (Cross-Site Request Forgery)

**Risk**: Unauthorized actions on behalf of authenticated users

**Mitigation**:
- Use CSRF tokens
- Validate token on state-changing operations
- Use SameSite cookies
- Check request origin

### Path Traversal

**Risk**: Access to unauthorized files

**Mitigation**:
- Validate file paths
- Reject paths with `..` or `/`
- Use whitelist of allowed paths
- Sanitize file names

### Rate Limiting

**Risk**: DoS attacks and abuse

**Mitigation**:
- Implement rate limiting
- Use exponential backoff
- Monitor request patterns
- Block suspicious IPs

## Support and Resources

### Documentation

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)

### Tools

- `npm audit` - Check for vulnerable dependencies
- `eslint-plugin-security` - Security linting
- `helmet` - Security headers middleware

### Contact

For security issues, please contact the security team immediately.

## Changelog

### Version 1.0.0 (2024-01-XX)

- Initial security implementation
- Input validation and sanitization
- Access control system
- Data encryption
- Security middleware
- Comprehensive test suite
