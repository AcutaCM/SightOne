# JWT Authentication - Quick Reference Card

## 🚀 Installation (One Command)

```bash
npm install jose && echo "JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")" > .env.local
```

## 🔑 Environment Variables

```env
JWT_SECRET=your-secret-key-here
USER_DB_PATH=./data/users.db
```

## 📡 API Endpoints

### Register
```bash
POST /api/auth/register
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

### Login
```bash
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Current User
```bash
GET /api/auth/me
```

### Refresh Token
```bash
POST /api/auth/refresh
```

### Logout
```bash
POST /api/auth/logout
```

## 💻 Client-Side Usage

### Login
```typescript
import { useAuth } from '@/contexts/AuthContext';

const { login } = useAuth();

await login({
  email: 'user@example.com',
  password: 'password123'
});
```

### Register
```typescript
const { register } = useAuth();

await register({
  username: 'johndoe',
  email: 'john@example.com',
  password: 'password123',
  name: 'John Doe'
});
```

### Logout
```typescript
const { logout } = useAuth();

logout();
```

### Check Auth Status
```typescript
const { user, isAuthenticated, isLoading } = useAuth();

if (isAuthenticated) {
  console.log('User:', user);
}
```

## 🛡️ Server-Side Protection

### Protect Any Route
```typescript
import { authMiddleware } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  const { user, error } = await authMiddleware(request);
  
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // User is authenticated
  return NextResponse.json({ data: 'protected' });
}
```

### Admin-Only Route
```typescript
import { requireAdmin } from '@/lib/auth/middleware';

export async function POST(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  
  if (error || !user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // User is admin
  return NextResponse.json({ data: 'admin data' });
}
```

### Role-Based Route
```typescript
import { requireRole } from '@/lib/auth/middleware';

export async function PUT(request: NextRequest) {
  const { user, error } = await requireRole(request, ['admin', 'user']);
  
  if (error || !user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // User has required role
  return NextResponse.json({ data: 'role-based data' });
}
```

## 🗄️ Database Operations

### Get User by Email
```typescript
import { userDatabase } from '@/lib/auth/userDatabase';

const user = userDatabase.getUserByEmail('john@example.com');
```

### Verify Password
```typescript
const isValid = await userDatabase.verifyPassword(
  'plainPassword',
  user.password_hash
);
```

### Update User Role
```typescript
userDatabase.updateUserRole('john@example.com', 'admin');
```

### Check if Admin Exists
```typescript
const hasAdmin = userDatabase.hasAdmin();
```

## 🔐 JWT Operations

### Generate Token Pair
```typescript
import { generateTokenPair } from '@/lib/auth/jwt';

const { accessToken, refreshToken } = await generateTokenPair({
  userId: '1',
  email: 'john@example.com',
  role: 'user'
});
```

### Verify Token
```typescript
import { verifyToken } from '@/lib/auth/jwt';

const payload = await verifyToken(token);
if (payload) {
  console.log('User ID:', payload.userId);
}
```

### Get User from Request
```typescript
import { getUserFromRequest } from '@/lib/auth/jwt';

const user = await getUserFromRequest(request);
```

## 🍪 Cookie Management

### Set Auth Cookies
```typescript
import { setAuthCookies } from '@/lib/auth/middleware';

const response = NextResponse.json({ success: true });
setAuthCookies(response, accessToken, refreshToken);
```

### Clear Auth Cookies
```typescript
import { clearAuthCookies } from '@/lib/auth/middleware';

const response = NextResponse.json({ success: true });
clearAuthCookies(response);
```

## 🧪 Testing

### cURL Examples

**Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"test123"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' \
  -c cookies.txt
```

**Get User:**
```bash
curl http://localhost:3000/api/auth/me -b cookies.txt
```

**Logout:**
```bash
curl -X POST http://localhost:3000/api/auth/logout -b cookies.txt
```

## ⚠️ Common Errors

| Error | Solution |
|-------|----------|
| `jose module not found` | `npm install jose` |
| `JWT_SECRET not defined` | Add to `.env.local` |
| `Database locked` | Restart server |
| `Token expired` | Use refresh endpoint |
| `Invalid credentials` | Check email/password |

## 📊 Token Lifetimes

| Token Type | Lifetime | Purpose |
|------------|----------|---------|
| Access Token | 7 days | API authentication |
| Refresh Token | 30 days | Get new access token |

## 🎯 Security Checklist

- ✅ Use strong JWT_SECRET (32+ chars)
- ✅ Enable HTTPS in production
- ✅ Set secure cookies in production
- ✅ Validate all user inputs
- ✅ Use prepared SQL statements
- ✅ Never log passwords
- ✅ Return generic error messages
- ✅ Implement rate limiting
- ✅ Regular security audits
- ✅ Keep dependencies updated

## 🔄 Token Refresh Flow

```
1. Access token expires
2. Client calls /api/auth/refresh
3. Server validates refresh token
4. Server issues new token pair
5. Client receives new tokens
6. Client continues with new access token
```

## 👥 User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| `admin` | Administrator | Full access |
| `user` | Regular user | Standard access |
| `normal` | Guest | Limited access |

## 📝 Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message here"
}
```

## 🎓 Best Practices

1. **Always validate input** - Check email format, password length
2. **Use middleware** - Don't duplicate auth logic
3. **Handle errors gracefully** - Return appropriate status codes
4. **Log security events** - Track failed logins, role changes
5. **Test thoroughly** - Unit tests, integration tests
6. **Document changes** - Keep API docs updated
7. **Monitor performance** - Watch database query times
8. **Regular backups** - Backup user database daily
9. **Update dependencies** - Keep security patches current
10. **Review code** - Security code reviews

## 📚 Documentation Links

- **Full Documentation:** `docs/JWT_AUTH_SYSTEM.md`
- **Installation Guide:** `docs/JWT_AUTH_INSTALLATION.md`
- **Migration Summary:** `docs/JWT_AUTH_MIGRATION_COMPLETE.md`
- **System Overview:** `docs/AUTH_SYSTEM_SUMMARY.md`

## 🆘 Quick Troubleshooting

```bash
# Check if database exists
ls -la data/users.db

# View users in database
sqlite3 data/users.db "SELECT * FROM users;"

# Check environment variables
cat .env.local

# Restart development server
npm run dev

# Clear node_modules and reinstall
rm -rf node_modules && npm install
```

## 🎉 Success Indicators

- ✅ Can register new user
- ✅ Can login with credentials
- ✅ `/api/auth/me` returns user data
- ✅ Can access protected routes
- ✅ Can logout successfully
- ✅ Tokens refresh automatically
- ✅ No TypeScript errors
- ✅ No console errors

---

**Need more help?** Check the full documentation in `docs/JWT_AUTH_SYSTEM.md`
