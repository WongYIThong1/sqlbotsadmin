# 环境变量配置说明

## 必需的环境变量

在项目根目录创建 `.env.local` 文件（此文件不会被提交到 Git），并配置以下环境变量：

### Supabase 配置

```env
# Supabase 项目 URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Supabase 匿名 API Key (anon key)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### JWT 认证配置

```env
# JWT 密钥（至少 32 个字符，用于签名和验证 token）
# 生产环境必须使用强随机字符串
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars

# JWT Token 过期时间（可选，默认为 24h）
# 格式：数字 + 单位 (s=秒, m=分钟, h=小时, d=天)
JWT_EXPIRES_IN=24h
```

## 完整的 .env.local 示例

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://kicjyrmadhkozwganhbi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpY2p5cm1hZGhrb3p3Z2FuaGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1Mjk5MDIsImV4cCI6MjA3OTEwNTkwMn0.uVhc7OyncTsFXoxJP3Wuaqto64oZH1g-N9sRAle2Xec

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=24h
```

## 如何获取 Supabase 凭证

1. 登录到 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 进入 **Settings** > **API**
4. 复制以下信息：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 生成 JWT_SECRET

### 方法 1: 使用 Node.js

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 方法 2: 使用 OpenSSL

```bash
openssl rand -hex 32
```

### 方法 3: 在线生成器

使用在线工具生成至少 32 个字符的随机字符串。

## 安全提示

1. **永远不要将 `.env.local` 文件提交到 Git**
   - 该文件已在 `.gitignore` 中排除
   
2. **生产环境配置**
   - 使用强随机字符串作为 `JWT_SECRET`
   - 在生产服务器上设置环境变量，而不是使用 `.env.local`
   - 考虑使用密钥管理服务（如 AWS Secrets Manager, Vercel Environment Variables）

3. **JWT_EXPIRES_IN 推荐值**
   - 开发环境: `24h` (24 小时)
   - 生产环境: `8h` (8 小时) 或更短，取决于安全需求

4. **验证配置**
   - 启动开发服务器后，检查终端是否有配置错误提示
   - 登录功能应该正常工作

## 环境变量优先级

1. `.env.local` (最高优先级，本地开发)
2. `.env.development` (开发环境)
3. `.env.production` (生产环境)
4. `.env` (默认值)

## 故障排除

如果遇到认证问题：

1. 检查 `.env.local` 文件是否存在且配置正确
2. 确认所有环境变量都已设置
3. 重启开发服务器 (`npm run dev`)
4. 检查浏览器控制台和服务器终端的错误信息

## 相关文件

- `lib/auth.ts` - JWT 工具函数使用这些环境变量
- `app/api/auth/login/route.ts` - 登录 API 使用 Supabase 配置
- `middleware.ts` - 中间件使用 JWT 配置

