# frontend（纯前端）

Next.js 管理后台 UI，**不再包含** Prisma / NextAuth / Next API Routes。

数据与登录全部请求 Spring Boot：`H:\karin-admin\backend`。

## 启动

```powershell
# 先启动后端 8080
cd H:\karin-admin\backend
.\mvnw.cmd spring-boot:run

# 再启动前端 3000
cd H:\karin-admin\frontend
npm install
npm run dev
```

打开 http://localhost:3000/login  
账号：`admin` / `admin123`

## 环境变量

```env
NEXT_PUBLIC_API_BASE=http://localhost:8080
```

## 已删除的后端相关

- `prisma/`、`lib/prisma.ts`
- `next-auth`、`lib/auth.ts`、`app/api/**`
- `bcryptjs`、SQLite `dev.db`

## 核心前端文件

| 文件 | 作用 |
|------|------|
| `lib/api.ts` | 调后端、存 token |
| `lib/auth-context.tsx` | 登录态 Context |
| `components/AuthGuard.tsx` | 未登录跳转 |
| `app/login/page.tsx` | 登录页 |
