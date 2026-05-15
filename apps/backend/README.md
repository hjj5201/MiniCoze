# MiniCoze Backend

MiniCoze Backend 是 MiniCoze 可视化 AI Agent 平台的后端服务，基于 NestJS + TypeScript 构建，当前阶段主要提供后端基础能力和 Auth/User 基础接口。

## 技术栈

- NestJS 
- TypeScript
- pnpm
- Prisma
- PostgreSQL
- JWT / Passport
- Swagger
- class-validator / class-transformer
- Jest / Supertest

## 项目结构

目录职责：

- `common`：通用能力，例如统一响应、异常过滤、错误码、守卫、装饰器、公共类型。
- `config`：环境变量读取和校验。
- `database`：Prisma 数据库连接模块。
- `modules`：按业务领域拆分的 NestJS 模块。
- `shared`：跨模块共享的类型。
- `prisma`：数据库模型和迁移文件。

## 核心能力

### 全局接口前缀

所有业务接口统一使用 `/api` 前缀，例如：

```txt
GET /api/health
POST /api/auth/register
POST /api/auth/login
GET /api/users/me
```

Swagger 文档地址：

```txt
/api-docs
```

### 统一成功响应

普通接口成功响应会被 `ResponseInterceptor` 包装为：

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

文件下载、SSE、AI 流式接口等特殊响应可以使用 `@SkipResponseWrap()` 跳过统一包装。

### 统一异常响应

异常响应由 `HttpExceptionFilter` 统一处理：

```json
{
  "code": 40000,
  "message": "错误信息",
  "data": null
}
```

业务异常统一使用 `BusinessException` 抛出，错误码定义在 `src/common/constants/error-code.ts`。

### 参数校验

项目已全局启用 `ValidationPipe`：

```ts
whitelist: true
transform: true
forbidNonWhitelisted: true
```

含义：

- `whitelist`：自动移除 DTO 中未声明的字段。
- `transform`：将请求参数转换为 DTO 中声明的类型。
- `forbidNonWhitelisted`：如果传入 DTO 未声明字段，直接返回校验错误。

### 分页响应格式

分页数据统一使用 `PaginatedData<T>`：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

在 Service 或 Controller 中可以使用：

```ts
import { createPaginatedData } from '../../common/types/pagination-response.type';

return createPaginatedData({
  list,
  total,
  page,
  pageSize,
});
```

## 环境变量

复制 `.env.example` 为 `.env`，并按本地环境修改：

```bash
cp .env.example .env
```

Windows PowerShell：

```powershell
Copy-Item .env.example .env
```

环境变量说明：

| 变量 | 说明 | 示例 |
|---|---|---|
| `NODE_ENV` | 运行环境 | `development` |
| `PORT` | 后端服务端口 | `3000` |
| `DATABASE_URL` | PostgreSQL 连接地址 | `postgresql://user:password@localhost:5432/database?schema=public` |
| `JWT_SECRET` | JWT 签名密钥 | `replace-me` |
| `JWT_EXPIRES_IN` | JWT 过期时间 | `2h` |
| `REDIS_HOST` | Redis 地址，当前预留 | `localhost` |
| `REDIS_PORT` | Redis 端口，当前预留 | `6379` |
| `CORS_ORIGIN` | 允许跨域访问的前端地址，多个地址用逗号分隔 | `http://localhost:5173` |

注意：

- `DATABASE_URL` 和 `JWT_SECRET` 必填。
- 生产环境下 `JWT_SECRET` 不能使用 `replace-me`，长度也不能小于 32。
- `.env` 已在 `.gitignore` 中忽略，不要提交真实密钥和数据库密码。

## 数据库

当前使用 Prisma 连接 PostgreSQL。

数据库模型文件：

```txt
prisma/schema.prisma
```

当前已有核心模型：

- `User`：用户账号，用于支撑注册、登录和当前用户信息接口。
- `Workspace`：工作空间，是 Agent、Conversation、Knowledge 等资源的归属边界。
- `WorkspaceMember`：用户与工作空间之间的成员关系，记录用户在空间中的角色。
- `WorkspaceRole`：工作空间角色枚举，当前包含 `OWNER`、`ADMIN`、`MEMBER`。

常用命令：

```bash
# 生成 Prisma Client
pnpm exec prisma generate

# 执行迁移
pnpm exec prisma migrate dev
```

如果在 Monorepo 根目录执行，可以使用：

```bash
pnpm --filter backend exec prisma generate
pnpm --filter backend exec prisma migrate dev
```

后端启动时会主动连接数据库。如果 PostgreSQL 未启动或 `DATABASE_URL` 错误，服务会启动失败。

## Workspace 接口

Workspace 接口用于管理当前登录用户可访问的工作空间，所有接口都需要 Bearer Token。

```txt
POST   /api/workspaces
GET    /api/workspaces
GET    /api/workspaces/:workspaceId
PATCH  /api/workspaces/:workspaceId
DELETE /api/workspaces/:workspaceId
```

权限规则：

- 创建工作空间时，当前用户会自动成为该空间的 `OWNER`。
- 当前用户只能查看自己所属的工作空间。
- `OWNER` 和 `ADMIN` 可以更新工作空间。
- 只有 `OWNER` 可以删除工作空间。
- 工作空间列表使用统一分页响应格式。


## 启动项目

推荐在 Monorepo 根目录执行：

```bash
pnpm --filter backend start:dev
```

或进入后端目录执行：

```bash
pnpm start:dev
```
启动失败则在pnpm添加.cmd：
```bash
pnpm.cmd start:dev
```

默认端口为 `3000`。

启动后可访问：

```txt
http://localhost:3000/api/health
http://localhost:3000/api-docs
```

## 注意事项

- 不要把业务逻辑写进 `main.ts` 或 `app.module.ts`。
- 新业务优先放到 `src/modules/<module-name>`。
- DTO 统一使用 `class-validator` 做参数校验。
- 数据库访问统一通过 `PrismaService`。
- 成功响应默认由拦截器统一包装，不要在 Controller 中手动返回 `code/message/data` 外层结构。
- 文件下载、SSE、AI 流式接口需要使用 `@SkipResponseWrap()`。
