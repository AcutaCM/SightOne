# Bootstrap API Security Enhancement

## Overview

The bootstrap API (`/api/admin/bootstrap`) has been enhanced with comprehensive security features to prevent unauthorized admin creation and ensure proper auditing.

## Security Features Implemented

### 1. Admin Existence Check (Requirement 5.1)
- Verifies no admin user exists before allowing bootstrap
- Returns 403 error if admin already exists
- Prevents multiple admin creation attempts

### 2. Email Validation (Requirement 5.2)
- Validates email format using RFC 5322 simplified regex
- Checks for empty or missing email
- Trims whitespace and converts to lowercase
- Returns 400 error for invalid emails

### 3. Security Logging (Requirement 5.5)
- Logs all bootstrap attempts (successful and failed)
- Captures timestamp, email, IP address, and reason
- Logs to console with `[SECURITY AUDIT]` prefix
- Structured JSON format for easy parsing

### 4. Appropriate Error Messages (Requirement 5.2, 5.4)
- Clear, specific error messages for each failure case
- Consistent response format with `success` flag
- HTTP status codes match error types:
  - 400: Bad request (invalid email, missing data)
  - 403: Forbidden (admin already exists)
  - 500: Server error (unexpected failures)

### 5. IP Address Tracking
- Captures client IP from headers
- Supports proxy headers (x-forwarded-for, x-real-ip)
- Includes IP in security logs

## API Usage

### Request
```http
POST /api/admin/bootstrap
Content-Type: application/json

{
  "email": "admin@example.com"
}
```

### Success Response
```json
{
  "success": true,
  "email": "admin@example.com",
  "role": "admin",
  "message": "Admin user created successfully"
}
```

### Error Responses

#### Admin Already Exists
```json
{
  "success": false,
  "error": "Admin already exists"
}
```
Status: 403 Forbidden

#### Invalid Email Format
```json
{
  "success": false,
  "error": "Invalid email format"
}
```
Status: 400 Bad Request

#### Missing Email
```json
{
  "success": false,
  "error": "Email is required"
}
```
Status: 400 Bad Request

## Security Log Format

```json
{
  "timestamp": "2025-11-05T10:30:00.000Z",
  "event": "bootstrap_attempt",
  "email": "admin@example.com",
  "success": true,
  "reason": "Admin created successfully",
  "ip": "192.168.1.100"
}
```

## Testing

### Test Case 1: Successful Bootstrap
```bash
curl -X POST http://localhost:3000/api/admin/bootstrap \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@drone-analyzer.com"}'
```

Expected: 200 OK with success response

### Test Case 2: Duplicate Bootstrap Attempt
```bash
# Run the same request twice
curl -X POST http://localhost:3000/api/admin/bootstrap \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@drone-analyzer.com"}'
```

Expected: 403 Forbidden with "Admin already exists" error

### Test Case 3: Invalid Email
```bash
curl -X POST http://localhost:3000/api/admin/bootstrap \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email"}'
```

Expected: 400 Bad Request with "Invalid email format" error

### Test Case 4: Missing Email
```bash
curl -X POST http://localhost:3000/api/admin/bootstrap \
  -H "Content-Type: application/json" \
  -d '{}'
```

Expected: 400 Bad Request with "Email is required" error

## Security Considerations

1. **Rate Limiting**: Consider adding rate limiting to prevent brute force attempts
2. **HTTPS Only**: Ensure this endpoint is only accessible over HTTPS in production
3. **Log Storage**: In production, security logs should be written to a secure, append-only log file or sent to a centralized logging service
4. **Monitoring**: Set up alerts for multiple failed bootstrap attempts
5. **IP Whitelisting**: Consider restricting bootstrap access to specific IP ranges

## Future Enhancements

- Add rate limiting middleware
- Implement CAPTCHA for additional security
- Store audit logs in database
- Add email verification step
- Implement IP whitelisting configuration
