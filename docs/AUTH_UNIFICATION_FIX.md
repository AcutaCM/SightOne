# 认证系统统一修复

## 问题描述

系统存在两套认证机制导致部分功能鉴权失败：

1. **Cookie 认证**：登录系统使用 Cookie (`user_email`) 存储用户身份
2. **Bearer Token 认证**：部分 API（个人资料、密码修改、头像上传）要求 Bearer Token

这导致用户登录后无法使用设置页面的功能，因为前端没有 Bearer Token。

## 修复方案

将所有用户相关的 API 统一为 Cookie 认证，同时保留 Bearer Token 作为向后兼容选项。

## 修复的文件

### 1. `/app/api/user/profile/route.ts`

**GET 方法**：
- ✅ 优先使用 Cookie (`user_email`) 认证
- ✅ 回退到 Bearer Token 认证（向后兼容）
- ✅ 通过 `userDatabase.getUserByEmail()` 查找用户

**PUT 方法**：
- ✅ 优先使用 Cookie 认证
- ✅ 回退到 Bearer Token 认证（向后兼容）
- ✅ 支持更新用户名称和头像

### 2. `/app/api/user/change-password/route.ts`

**POST 方法**：
- ✅ 优先使用 Cookie 认证
- ✅ 回退到 Bearer Token 认证（向后兼容）
- ✅ 验证旧密码并更新新密码

### 3. `/app/api/upload/avatar/route.ts`

**POST 方法**：
- ✅ 优先使用 Cookie 认证
- ✅ 回退到 Bearer Token 认证（向后兼容）
- ✅ 支持文件上传和头像更新
- ✅ 文件类型验证（JPG、PNG、GIF、WebP）
- ✅ 文件大小限制（最大 2MB）

### 4. `/app/settings/page.tsx`

**前端更新**：
- ✅ 移除 `localStorage.getItem('authToken')` 调用
- ✅ 移除 `Authorization: Bearer ${token}` 请求头
- ✅ 添加 `credentials: 'include'` 以发送 Cookie
- ✅ 更新三个功能：
  - 个人信息更新 (`handleProfileUpdate`)
  - 密码修改 (`handlePasswordChange`)
  - 头像上传 (`handleFileUpload`)

## 认证流程

### 登录流程
1. 用户通过 `/api/auth/login` 登录
2. 服务器设置 `user_email` Cookie
3. 前端通过 `/api/auth/me` 获取用户信息和角色

### API 调用流程
1. 前端发送请求时包含 `credentials: 'include'`
2. 服务器从 Cookie 中读取 `user_email`
3. 通过 `userDatabase.getUserByEmail(email)` 查找用户
4. 如果 Cookie 不存在，回退到 Bearer Token 认证

### 退出登录流程
1. 用户通过 `/api/auth/logout` 退出
2. 服务器清除 `user_email` Cookie
3. 前端清除本地状态

## 测试验证

### 1. 登录测试
```bash
# 登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@drone.com"}' \
  -c cookies.txt

# 验证登录状态
curl http://localhost:3000/api/auth/me \
  -b cookies.txt
```

### 2. 个人资料更新测试
```bash
# 更新个人信息
curl -X PUT http://localhost:3000/api/user/profile \
  -H "Content-Type: application/json" \
  -d '{"name":"测试用户"}' \
  -b cookies.txt
```

### 3. 密码修改测试
```bash
# 修改密码
curl -X POST http://localhost:3000/api/user/change-password \
  -H "Content-Type: application/json" \
  -d '{"oldPassword":"old123","newPassword":"new123"}' \
  -b cookies.txt
```

### 4. 头像上传测试
```bash
# 上传头像
curl -X POST http://localhost:3000/api/upload/avatar \
  -F "file=@avatar.jpg" \
  -b cookies.txt
```

## 向后兼容性

所有修改的 API 都保留了 Bearer Token 认证作为回退选项，确保：
- ✅ 现有使用 Bearer Token 的客户端仍然可以工作
- ✅ 新客户端可以使用更简单的 Cookie 认证
- ✅ 不会破坏现有的集成

## 安全考虑

### Cookie 设置
- `httpOnly: false` - 允许 JavaScript 访问（用于前端状态管理）
- `sameSite: 'lax'` - 防止 CSRF 攻击
- `path: '/'` - 全站可用

### 生产环境建议
1. 启用 `httpOnly: true` 以防止 XSS 攻击
2. 启用 `secure: true` 以仅通过 HTTPS 传输
3. 设置合理的 `maxAge` 以限制会话时间
4. 考虑使用 JWT 或其他更安全的会话管理方案

## 修复总结

✅ **统一认证机制**：所有用户 API 现在都支持 Cookie 认证  
✅ **修复设置页面**：个人资料、密码修改、头像上传功能现在可以正常工作  
✅ **向后兼容**：保留 Bearer Token 支持，不破坏现有集成  
✅ **代码简化**：前端不再需要管理 authToken  
✅ **安全性**：使用 Cookie 认证更符合 Web 标准

## 后续优化建议

1. **会话管理**：实现真正的会话系统，而不是仅存储 email
2. **Token 刷新**：添加 refresh token 机制
3. **多设备登录**：支持用户在多个设备上登录
4. **登录历史**：记录用户登录历史和设备信息
5. **安全审计**：添加安全日志和异常检测
