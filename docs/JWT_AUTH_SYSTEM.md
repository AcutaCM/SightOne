# JWT Authentication System Documentation

## Overview

The application now uses a secure JWT (JSON Web Token) based authentication system with the following features:

- **Secure password hashing** using bcrypt
- **Access and refresh tokens** for session management
- **HttpOnly cookies** to prevent XSS attacks
- **Role-based access control** (admin, user, normal)
- **SQLite database** for user storage
- **Backward compatibility** with legacy cookie-based auth

## Architecture

### Components

1. **JWT Library** (`lib/auth/jwt.ts`)
   - Token generation and verification using `jose` library
   - Access tokens (7 days validity)
   - Refresh tokens (30 days validity)

2. **User Database** (`lib/auth/userDatabase.ts`)
   - SQLite-based user storage
   - Bcrypt password hashing (10 salt rounds)
   - User CRUD operations

3. **Auth Middleware** (`lib/auth/middleware.ts`)
   - JWT token validation
   - Role-based access control
   - Cookie management

4. **Auth Context** (`contexts/AuthContext.tsx`)
   - Client-side authentication state
   - Login/logout/register functions
   - Auto-refresh on page load

## API Endpoints

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "string (min 3 chars)",
  "email": "string (valid email)",
  "password": "string (min 6 chars)",
  "name": "string (optional)"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "注册成功",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

**Notes:**
- First registered user automatically becomes admin
- Sets JWT cookies automatically
- Password is hashed with bcrypt before storage

### POST /api/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "登录成功",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

**Cookies Set:**
- `access_token` (httpOnly, 7 days)
- `refresh_token` (httpOnly, 30 days)

### GET /api/auth/me
Get current authenticated user information.

**Response (Authenticated):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "email": "john@example.com",
  "role": "user"
}
```

**Response (Not Authenticated):**
```json
{
  "success": false,
  "email": null,
  "role": "normal"
}
```

### POST /api/auth/refresh
Refresh access token using refresh token.

**Response (Success):**
```json
{
  "success": true,
  "message": "令牌刷新成功",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

**Notes:**
- Automatically reads refresh_token from cookies
- Issues new access and refresh tokens
- Updates cookies with new tokens

### POST /api/auth/logout
Logout and clear all authentication cookies.

**Response:**
```json
{
  "success": true,
  "message": "退出登录成功"
}
```

**Cookies Cleared:**
- `access_token`
- `refresh_token`
- `user_email` (legacy)

## Security Features

### Password Security
- Passwords hashed with bcrypt (10 salt rounds)
- Constant-time comparison to prevent timing attacks
- Minimum 6 character password requirement

### Token Security
- JWT tokens signed with HS256 algorithm
- HttpOnly cookies prevent XSS attacks
- Secure flag in production (HTTPS only)
- SameSite=lax prevents CSRF attacks

### Database Security
- Prepared statements prevent SQL injection
- Unique constraints on username and email
- Password hashes never returned in API responses

## Usage Examples

### Client-Side Login
```typescript
import { useAuth } from '@/contexts/AuthContext';

function LoginComponent() {
  const { login } = useAuth();
  
  const handleLogin = async () => {
    try {
      await login({
        email: 'user@example.com',
        password: 'password123'
      });
      // Login successful
    } catch (error) {
      // Handle error
    }
  };
}
```

### Protected API Route
```typescript
import { authMiddleware } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  const { user, error } = await authMiddleware(request);
  
  if (error || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // User is authenticated
  return NextResponse.json({ data: 'protected data' });
}
```

### Admin-Only Route
```typescript
import { requireAdmin } from '@/lib/auth/middleware';

export async function POST(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  
  if (error || !user) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }
  
  // User is admin
  return NextResponse.json({ data: 'admin data' });
}
```

## Environment Variables

Add to `.env.local`:

```env
# JWT Secret (use a strong random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Optional: Database path (defaults to data/users.db)
USER_DB_PATH=./data/users.db
```

## Migration from Legacy System

The new system maintains backward compatibility:

1. Old `user_email` cookies are still read by `/api/auth/me`
2. Users with legacy cookies can continue using the app
3. On next login, users will be migrated to JWT tokens
4. Legacy cookies are cleared on logout

## Database Schema

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid credentials or token |
| 403 | Forbidden - Insufficient permissions |
| 409 | Conflict - Username or email already exists |
| 500 | Internal Server Error |

## Testing

### Install Dependencies
```bash
npm install
```

### Run Tests
```bash
npm test
```

### Manual Testing
1. Register a new user at `/register`
2. Login at `/login`
3. Check authentication status at `/api/auth/me`
4. Access protected routes
5. Logout at `/api/auth/logout`

## Troubleshooting

### "jose module not found"
```bash
npm install jose
```

### "bcryptjs module not found"
```bash
npm install bcryptjs @types/bcryptjs
```

### Database locked error
- Ensure only one instance of the app is running
- Check file permissions on `data/users.db`

### Token expired
- Use `/api/auth/refresh` to get new tokens
- Or login again

## Future Enhancements

- [ ] Email verification
- [ ] Password reset via email
- [ ] Two-factor authentication (2FA)
- [ ] OAuth integration (Google, GitHub)
- [ ] Session management (revoke tokens)
- [ ] Rate limiting on auth endpoints
- [ ] Audit logging for security events
