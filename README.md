# Karin Admin

```text
karin-admin/
├── frontend/   # Next.js 纯前端 UI
├── backend/    # Spring Boot API + MySQL
└── docs/
```

## 启动

```powershell
# 1) MySQL + 后端
cd H:\karin-admin\backend
docker start karin-mysql
.\mvnw.cmd spring-boot:run

# 2) 前端
cd H:\karin-admin\frontend
npm install
npm run dev
```

- 前端：http://localhost:3000
- 后端：http://localhost:8080
- 账号：`admin` / `admin123`

## 架构

- 浏览器直接请求 Spring Boot（`NEXT_PUBLIC_API_BASE`）
- Token 存在 `localStorage`
- 前端不再有 Prisma / NextAuth / Next API Routes
