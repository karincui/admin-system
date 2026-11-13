# 如何在本项目中写一套 CRUD

> 目标：照着本文，在 `backend-karin` 里新增一个完整业务模块（增删改查 + 分页）。  
> 示例业务：**任务 Todo**（后台管理系统里最常见的练手模块）。  
> 你换成「文章 / 公告 / 部门 / 产品」时，步骤完全一样，只改名字和字段。

---

## 0. 先建立心智模型

CRUD = Create / Read / Update / Delete。

本项目推荐固定分层：

```text
Flyway SQL（建表）
    ↓
Entity（表 ↔ Java 对象）
    ↓
Repository（读写数据库）
    ↓
DTO（Create/Update/Response）
    ↓
Service（业务规则）
    ↓
Controller（HTTP 接口）
```

对应前端理解：

| 后端 | 前端类比 |
|------|----------|
| Controller | API Route / 接口函数 |
| Service | 业务逻辑 / store action |
| Repository | 请求数据库的 DAO |
| Entity | 数据库行的类型 |
| DTO | 表单/列表接口的 TS 类型 |
| Flyway SQL | 建表迁移脚本 |

接口约定（本项目统一）：

| 操作 | 方法 | 路径示例 |
|------|------|----------|
| 分页列表 | GET | `/api/todos?page=0&size=10&keyword=xx` |
| 详情 | GET | `/api/todos/{id}` |
| 新增 | POST | `/api/todos` |
| 修改 | PUT | `/api/todos/{id}` |
| 删除 | DELETE | `/api/todos/{id}` |

返回统一用 `ApiResponse`：

```json
{ "code": 0, "message": "ok", "data": {} }
```

说明：当前 `SecurityConfig` 里除登录/Swagger/health 外都要登录，所以 Todo 接口默认需要 `Authorization: Bearer <token>`。

---

## 1. 操作总览（按这个顺序做）

1. 想清楚字段，写 Flyway 建表 SQL  
2. 建包：`module/todo/`  
3. 写 Entity  
4. 写 Repository  
5. 写 Request / Response DTO  
6. 写 Service（真正 CRUD）  
7. 写 Controller  
8. 重启应用，用 Swagger 测  
9.（可选）加权限、校验增强、软删除  

**不要一上来先写 Controller。** 先有表和 Entity，再往上堆。

---

## 2. 第 1 步：设计表并写 Flyway

### 2.1 先定字段

示例 `todo`：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| title | VARCHAR(100) | 标题 |
| content | VARCHAR(500) | 内容，可空 |
| done | TINYINT(1) | 是否完成 |
| created_by | BIGINT | 创建人用户 ID |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### 2.2 新增迁移文件

路径：

```text
src/main/resources/db/migration/V2__create_todo.sql
```

内容示例：

```sql
CREATE TABLE IF NOT EXISTS todo (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    title       VARCHAR(100) NOT NULL,
    content     VARCHAR(500) NULL,
    done        TINYINT(1)   NOT NULL DEFAULT 0,
    created_by  BIGINT       NOT NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_todo_created_by (created_by),
    KEY idx_todo_title (title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

注意：

- 版本号必须比现有最大版本大（已有 `V1__init.sql`，所以用 `V2__...`）
- **已经执行过的 V1/V2 不要改内容**；要改结构就再写 `V3__...`
- 重启应用后 Flyway 会自动执行新脚本

---

## 3. 第 2 步：创建模块包

在：

```text
src/main/java/com/karin/backend/module/todo/
```

建议文件：

```text
todo/
  Todo.java                 # Entity
  TodoRepository.java
  TodoCreateRequest.java
  TodoUpdateRequest.java
  TodoResponse.java
  TodoService.java
  TodoController.java
```

一个业务一个包，后面好找。

---

## 4. 第 3 步：写 Entity

`Todo.java`：

```java
package com.karin.backend.module.todo;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "todo")
public class Todo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(length = 500)
    private String content;

    @Column(nullable = false)
    private Boolean done = false;

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (done == null) {
            done = false;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

要点：

- `@Entity` + `@Table` 对应数据库表
- 字段名默认驼峰转下划线；不一致时用 `@Column(name = "...")`
- 不要把 Entity 直接返回给前端

---

## 5. 第 4 步：写 Repository

`TodoRepository.java`：

```java
package com.karin.backend.module.todo;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TodoRepository extends JpaRepository<Todo, Long> {

    @Query("""
            select t from Todo t
            where (:keyword is null or :keyword = ''
                   or t.title like concat('%', :keyword, '%'))
            """)
    Page<Todo> search(@Param("keyword") String keyword, Pageable pageable);
}
```

说明：

- `JpaRepository` 已自带：`save`、`findById`、`findAll`、`deleteById`…
- 列表搜索自己加 `search` 方法即可
- `Pageable` 用于分页排序

---

## 6. 第 5 步：写 DTO

### 6.1 新增入参 `TodoCreateRequest.java`

```java
package com.karin.backend.module.todo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TodoCreateRequest {

    @NotBlank(message = "标题不能为空")
    @Size(max = 100, message = "标题最多100字")
    private String title;

    @Size(max = 500, message = "内容最多500字")
    private String content;
}
```

### 6.2 修改入参 `TodoUpdateRequest.java`

```java
package com.karin.backend.module.todo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TodoUpdateRequest {

    @NotBlank(message = "标题不能为空")
    @Size(max = 100, message = "标题最多100字")
    private String title;

    @Size(max = 500, message = "内容最多500字")
    private String content;

    @NotNull(message = "完成状态不能为空")
    private Boolean done;
}
```

### 6.3 出参 `TodoResponse.java`

```java
package com.karin.backend.module.todo;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TodoResponse {

    private Long id;
    private String title;
    private String content;
    private Boolean done;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TodoResponse from(Todo todo) {
        return TodoResponse.builder()
                .id(todo.getId())
                .title(todo.getTitle())
                .content(todo.getContent())
                .done(todo.getDone())
                .createdBy(todo.getCreatedBy())
                .createdAt(todo.getCreatedAt())
                .updatedAt(todo.getUpdatedAt())
                .build();
    }
}
```

为什么要 DTO：

- 入参可做校验
- 出参可隐藏内部字段
- 接口结构稳定，不随表字段乱变

---

## 7. 第 6 步：写 Service（CRUD 核心）

`TodoService.java`：

```java
package com.karin.backend.module.todo;

import com.karin.backend.common.BusinessException;
import com.karin.backend.security.LoginUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TodoService {

    private final TodoRepository todoRepository;

    @Transactional(readOnly = true)
    public Page<TodoResponse> page(String keyword, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        return todoRepository.search(keyword, pageable).map(TodoResponse::from);
    }

    @Transactional(readOnly = true)
    public TodoResponse detail(Long id) {
        return TodoResponse.from(getEntity(id));
    }

    @Transactional
    public TodoResponse create(TodoCreateRequest request, LoginUser loginUser) {
        Todo todo = new Todo();
        todo.setTitle(request.getTitle());
        todo.setContent(request.getContent());
        todo.setDone(false);
        todo.setCreatedBy(loginUser.getId());
        return TodoResponse.from(todoRepository.save(todo));
    }

    @Transactional
    public TodoResponse update(Long id, TodoUpdateRequest request) {
        Todo todo = getEntity(id);
        todo.setTitle(request.getTitle());
        todo.setContent(request.getContent());
        todo.setDone(request.getDone());
        return TodoResponse.from(todoRepository.save(todo));
    }

    @Transactional
    public void delete(Long id) {
        if (!todoRepository.existsById(id)) {
            throw new BusinessException(404, "任务不存在");
        }
        todoRepository.deleteById(id);
    }

    private Todo getEntity(Long id) {
        return todoRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "任务不存在"));
    }
}
```

要点：

- 业务判断放 Service，不放 Controller
- 写操作加 `@Transactional`
- 找不到数据抛 `BusinessException`，交给全局异常处理

---

## 8. 第 7 步：写 Controller

`TodoController.java`：

```java
package com.karin.backend.module.todo;

import com.karin.backend.common.ApiResponse;
import com.karin.backend.security.LoginUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/todos")
@RequiredArgsConstructor
public class TodoController {

    private final TodoService todoService;

    @GetMapping
    public ApiResponse<Page<TodoResponse>> page(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.ok(todoService.page(keyword, page, size));
    }

    @GetMapping("/{id}")
    public ApiResponse<TodoResponse> detail(@PathVariable Long id) {
        return ApiResponse.ok(todoService.detail(id));
    }

    @PostMapping
    public ApiResponse<TodoResponse> create(
            @Valid @RequestBody TodoCreateRequest request,
            @AuthenticationPrincipal LoginUser loginUser
    ) {
        return ApiResponse.ok(todoService.create(request, loginUser));
    }

    @PutMapping("/{id}")
    public ApiResponse<TodoResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody TodoUpdateRequest request
    ) {
        return ApiResponse.ok(todoService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        todoService.delete(id);
        return ApiResponse.ok();
    }
}
```

注解速记：

| 注解 | 作用 |
|------|------|
| `@RestController` | 这个类是 REST 接口 |
| `@RequestMapping` | 路径前缀 |
| `@GetMapping` / `@PostMapping` / `@PutMapping` / `@DeleteMapping` | HTTP 方法 |
| `@RequestBody` | 读 JSON 请求体 |
| `@PathVariable` | 读路径里的 `{id}` |
| `@RequestParam` | 读 `?keyword=` 查询参数 |
| `@Valid` | 触发 DTO 校验 |
| `@AuthenticationPrincipal` | 拿当前登录用户 |

---

## 9. 第 8 步：启动并测试

### 9.1 启动前确认

```bash
cd H:\backend-karin
docker compose up -d
.\mvnw.cmd spring-boot:run
```

看启动日志里是否有 Flyway 执行 `V2__create_todo.sql`。

### 9.2 用 Swagger 测

1. 打开 http://localhost:8080/swagger-ui.html  
2. 先调 `POST /api/auth/login`，拿到 token  
3. 点右上角 **Authorize**，填：`Bearer <token>`（或只填 token，看 UI 提示）  
4. 依次测：

```text
POST   /api/todos          新增
GET    /api/todos          列表
GET    /api/todos/{id}     详情
PUT    /api/todos/{id}     修改
DELETE /api/todos/{id}     删除
```

### 9.3 用 curl 测（可选）

```bash
# 登录
curl -X POST http://localhost:8080/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"

# 新增（替换 TOKEN）
curl -X POST http://localhost:8080/api/todos ^
  -H "Authorization: Bearer TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"学习CRUD\",\"content\":\"按文档做一遍\"}"

# 列表
curl http://localhost:8080/api/todos?page=0&size=10 ^
  -H "Authorization: Bearer TOKEN"
```

---

## 10. 分页返回长什么样

`Page<TodoResponse>` 大致结构：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "content": [ { "id": 1, "title": "学习CRUD", "...": "..." } ],
    "totalElements": 1,
    "totalPages": 1,
    "size": 10,
    "number": 0
  }
}
```

前端常用：

- `content`：当前页数据
- `totalElements`：总条数
- `number`：当前页（从 0 开始）
- `size`：每页条数

若前端希望页码从 1 开始，可在 Controller 里把 `page` 减 1，或和前端约定「后端从 0 开始」。

---

## 11. 常见增强（CRUD 做完后再加）

### 11.1 只能改自己的数据

在 `update/delete` 里加：

```java
if (!todo.getCreatedBy().equals(loginUser.getId())) {
    throw new BusinessException(403, "不能操作他人的任务");
}
```

### 11.2 仅管理员可删

```java
@PreAuthorize("hasRole('ADMIN')")
@DeleteMapping("/{id}")
public ApiResponse<Void> delete(@PathVariable Long id) { ... }
```

### 11.3 软删除

表加 `deleted` 字段，删除时改标记，不物理删。查询时过滤 `deleted = 0`。

### 11.4 更复杂筛选

状态、时间范围、排序字段等，继续往 `search` 方法和 `@RequestParam` 加条件即可。

---

## 12. 换业务时怎么改（模板）

假设要做「公告 Notice」：

1. `V3__create_notice.sql` 建表  
2. 包名改成 `module/notice/`  
3. 类名：`Notice` / `NoticeRepository` / `NoticeService` / `NoticeController`  
4. 路径改成 `/api/notices`  
5. 字段按公告改（title、content、published…）  

**流程不变，只换名词和字段。**

---

## 13. 检查清单（写完打勾）

- [ ] 有 Flyway 脚本，重启后表已创建  
- [ ] Entity 字段和表一致  
- [ ] Repository 能分页查询  
- [ ] Create/Update 有校验注解  
- [ ] Response 不含敏感字段  
- [ ] Service 有「不存在」处理  
- [ ] Controller 五类接口齐全  
- [ ] Swagger 登录后增删改查都通  
- [ ] 列表分页参数正常  

---

## 14. 容易踩的坑

1. **改了已执行的 Flyway 文件** → 会校验失败；应新增 `V3__...`  
2. **Entity 直接返回前端** → 可能暴露不该暴露的字段  
3. **业务写在 Controller** → 难测、难复用；放到 Service  
4. **忘记 `@Valid`** → 校验注解不生效  
5. **忘记带 Token** → 一直 401  
6. **页码和前端不一致** → 先约定从 0 还是从 1  
7. **本机 3306 冲突** → 本项目开发库在 **3307**  

---

## 15. 一句话流程

> **建表 → Entity → Repository → DTO → Service → Controller → Swagger 验证。**  
> 先跑通 Todo，再复制一套改成你的真实业务。

---

## 16. 和现有代码的关系

你可以参考现有模块对照学习：

| 你要写的 CRUD 部分 | 现有可参考 |
|--------------------|------------|
| 登录后拿当前用户 | `UserController` + `LoginUser` |
| 统一返回 | `ApiResponse` |
| 业务异常 | `BusinessException` |
| 入参校验 | `LoginRequest` |
| 表结构迁移 | `V1__init.sql` |
| 必须登录 | `SecurityConfig`（已默认保护 `/api/**`） |

如果你希望，我可以在下一步 **直接把 Todo 这套 CRUD 代码生成进项目**，你只需启动验证。
