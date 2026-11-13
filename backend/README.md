# backend-karin

Karin 后台管理系统后端（Spring Boot 3.4 + MySQL 8 + JWT）。

## 技术栈

- Java 17
- Spring Boot 3.4
- Spring Web / Validation / Data JPA / Security / Actuator
- MySQL 8 + Flyway
- JWT（jjwt）
- springdoc-openapi（Swagger UI）

## 快速启动

### 1. 启动 MySQL

```bash
docker compose up -d
```

会创建数据库 `karin`，账号 `karin / karin123`，宿主机端口 **3307**（避免和本机已有 MySQL 的 3306 冲突）。

### 2. 启动应用

```bash
# Windows
.\mvnw.cmd spring-boot:run

# macOS / Linux
./mvnw spring-boot:run
```

### 3. 验证

- 健康检查：http://localhost:8080/actuator/health
- Swagger：http://localhost:8080/swagger-ui.html
- 默认管理员：`admin` / `admin123`

### 登录示例

```bash
curl -X POST http://localhost:8080/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

拿到 token 后：

```bash
curl http://localhost:8080/api/users/me ^
  -H "Authorization: Bearer <token>"
```

## 主要接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 登录 |
| GET | `/api/users/me` | 当前用户信息 |

统一响应：

```json
{ "code": 0, "message": "ok", "data": {} }
```

## 配置

- 开发：`src/main/resources/application-dev.yml`
- 生产：`application-prod.yml` + 环境变量 `DB_URL` / `DB_USER` / `DB_PASSWORD` / `JWT_SECRET`

## 目录结构

```text
com.karin.backend
  common/       # 统一响应、异常
  config/       # CORS、OpenAPI、初始管理员
  module/
    auth/       # 登录
    user/       # 用户
  security/     # JWT、SecurityFilterChain
```

## 下一步可加

- 用户分页 CRUD
- RBAC 角色权限表
- Redis 缓存
- 文件上传
- 按学习文档部署到服务器
