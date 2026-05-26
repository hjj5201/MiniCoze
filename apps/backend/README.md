# MiniCoze Backend

MiniCoze Backend 是 MiniCoze 可视化 AI Agent 搭建平台的后端服务，基于 NestJS、TypeScript、Prisma 和 PostgreSQL 构建。
当前后端已经包含用户认证、工作空间、Agent 配置管理、普通对话、AI Gateway 和 Agent Runtime 流式运行能力。知识库、工作流、文件和发布模块目前仍是占位接口或待完善模块。

## 技术栈

- NestJS 
- TypeScript
- Prisma
- PostgreSQL
- JWT / Passport
- Swagger
- class-validator / class-transformer
- Jest / Supertest

## 应用基础能力

后端统一使用 `/api` 作为业务接口前缀，Swagger 文档地址为：

```txt
http://localhost:3000/api-docs
```

`setup-app.ts` 中启用了：

- CORS
- 全局 `ValidationPipe`
- 全局 `ResponseInterceptor`
- 全局 `HttpExceptionFilter`
- Swagger

普通接口成功响应会被包装为：

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

异常响应会被包装为：

```json
{
  "code": 40000,
  "message": "错误信息",
  "data": null
}
```

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

SSE、文件流等特殊响应可以使用 `@SkipResponseWrap()` 跳过统一响应包装。当前 `/api/agent-runs/stream` 就是 SSE 接口。

## 环境变量

在仓库根目录或后端运行环境中准备 `.env`。核心变量如下：

| 变量 | 说明 | 示例 |
| --- | --- | --- |
| `NODE_ENV` | 运行环境 | `development` |
| `PORT` | 后端端口 | `3000` |
| `DATABASE_URL` | PostgreSQL 连接地址 | `postgresql://user:password@localhost:5432/minicoze?schema=public` |
| `JWT_SECRET` | JWT 签名密钥 | `replace-me` |
| `JWT_EXPIRES_IN` | JWT 过期时间 | `2h` |
| `CORS_ORIGIN` | 允许跨域的前端地址，多个地址用英文逗号分隔 | `http://localhost:5173` |
| `AI_PROVIDER` | AI 供应商 | `openai` 或 `deepseek` |
| `OPENAI_API_KEY` | OpenAI API Key | `sk-xxxx` |
| `OPENAI_BASE_URL` | OpenAI 兼容接口地址 | `https://api.openai.com/v1` |
| `OPENAI_MODEL` | OpenAI 默认模型 | `gpt-4o-mini` |
| `DEEPSEEK_API_KEY` | DeepSeek API Key | `sk-xxxx` |
| `DEEPSEEK_BASE_URL` | DeepSeek 兼容接口地址 | `https://api.deepseek.com` |
| `DEEPSEEK_MODEL` | DeepSeek 默认模型 | `deepseek-chat` |

注意：

- `DATABASE_URL` 和 `JWT_SECRET` 是必填项。
- 生产环境中 `JWT_SECRET` 不能使用 `replace-me`，长度也不能太短。
- `.env` 不要提交到 Git。
- 当前 `env.validation.ts` 主要校验基础运行变量；AI 相关变量会在 AI Gateway 初始化或调用时暴露配置缺失问题。

## 数据库

Prisma schema 位于：

```txt
apps/backend/prisma/schema.prisma
```

当前核心模型：

- `User`：用户账号，支持注册、登录和当前用户信息。
- `Workspace`：工作空间，是 Agent 等资源的归属边界。
- `WorkspaceMember`：用户与工作空间的成员关系，包含 `OWNER`、`ADMIN`、`MEMBER` 角色。
- `Agent`：单 Agent 配置，包含名称、提示词、模型、温度、状态等字段。
- `Conversation`：对话，关联 Agent 和用户。
- `Message`：对话消息，保存用户输入、助手回复、模型信息、token 使用量和错误信息。

常用 Prisma 命令：

```bash
pnpm --filter backend prisma:generate
pnpm --filter backend prisma:migrate
pnpm --filter backend prisma:studio
```

## 核心接口

### Health

```txt
GET /api/health
```

返回服务状态和当前时间。

### Auth

```txt
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile
```

注册时使用 bcrypt 保存密码哈希。登录成功后返回 Bearer Token。受保护接口通过 `JwtAuthGuard` 校验请求头：

```txt
Authorization: Bearer <token>
```

### User

```txt
GET   /api/users/me
PATCH /api/users/me
```

用于查询和更新当前登录用户信息。

### Workspace

```txt
POST   /api/workspaces
GET    /api/workspaces
GET    /api/workspaces/:workspaceId
PATCH  /api/workspaces/:workspaceId
DELETE /api/workspaces/:workspaceId
```

权限规则：

- 创建工作空间后，当前用户自动成为 `OWNER`。
- 工作空间成员可以查看工作空间。
- `OWNER` 和 `ADMIN` 可以更新工作空间。
- 只有 `OWNER` 可以删除工作空间。

权限判断集中在 `WorkspaceAccessService`：

- `ensureMember`
- `ensureCanManage`
- `ensureOwner`

### Agent 配置

```txt
POST   /api/agents
GET    /api/agents?workspaceId=...
GET    /api/agents/:agentId
PATCH  /api/agents/:agentId
DELETE /api/agents/:agentId
```

创建 Agent 的主要字段：

```json
{
  "workspaceId": "workspace-id",
  "name": "客服助手",
  "description": "用于回答产品和售后问题",
  "avatarUrl": "https://example.com/avatar.png",
  "systemPrompt": "你是一个专业、耐心的客服助手。",
  "model": "gpt-4o-mini",
  "temperature": 0.7,
  "status": "DRAFT"
}
```

字段说明：

- `workspaceId`、`name`、`systemPrompt` 是创建时必填。
- `status` 可选值来自 Prisma 的 `AgentStatus`：`DRAFT`、`ACTIVE`、`ARCHIVED`。
- 查询列表支持 `workspaceId`、`status`、`keyword`、`page`、`pageSize`。
- 创建、更新、删除 Agent 需要当前用户具备工作空间管理权限。
- 查询 Agent 详情和列表需要当前用户是工作空间成员。

### Conversation 普通对话

```txt
POST /api/workspaces/:workspaceId/conversations
GET  /api/workspaces/:workspaceId/conversations/:conversationId
POST /api/workspaces/:workspaceId/conversations/:conversationId/messages
GET  /api/workspaces/:workspaceId/conversations/agents/:agentId
```

创建对话并发送首条消息：

```json
{
  "agentId": "agent-id",
  "content": "你好"
}
```

继续发送消息：

```json
{
  "content": "继续说明一下"
}
```

普通对话链路：

```txt
校验工作空间权限
创建或读取 Conversation
保存用户 Message
读取 Agent systemPrompt/model/temperature
调用 AI Gateway
保存 assistant Message
返回完整回复
```

这条链路适合普通请求响应式对话，不是 SSE 流式接口。

### Agent Runtime 流式运行

```txt
POST /api/agent-runs/stream
```

该接口需要 Bearer Token，并以 SSE 返回事件。

最低请求体：

```json
{
  "agentId": "agent-id",
  "message": "你好"
}
```

完整请求体可选字段：

```json
{
  "agentId": "agent-id",
  "message": "你好，请介绍一下你自己",
  "conversationId": "optional-conversation-id",
  "model": "deepseek-chat",
  "systemPrompt": "你是一个简洁的助手。",
  "temperature": 0.4,
  "maxTokens": 512,
  "tools": []
}
```

行为说明：

- `agentId` 必须对应当前用户可访问的 Agent。
- `conversationId` 不传时会自动创建新对话。
- `conversationId` 传入时，必须属于当前用户和当前 Agent。
- `model`、`systemPrompt`、`temperature` 可以临时覆盖 Agent 数据库配置。
- `maxTokens` 不传时默认使用 `1024`。

成功时常见事件顺序：

```txt
run.created
run.in_progress
message.delta
message.completed
run.completed
stream.done
```

失败时常见事件顺序：

```txt
run.created
run.in_progress
run.failed
stream.done
```

Runtime 内部职责：

- 生成 `runId`
- 创建或复用 `conversationId`
- 加载历史消息
- 读取并组装 Agent 配置
- 保存用户输入
- 调用执行策略
- 转发执行策略产生的事件
- 保存最终 assistant 消息
- 更新运行状态

当前 Runtime 没有独立 `AgentRun` 数据表。运行中的状态暂存在 `RuntimePrismaRepository` 的内存 `Map` 中，`Conversation` 和 `Message` 会落库。

## AI Gateway

AI Gateway 负责屏蔽不同模型供应商的调用差异，当前支持 OpenAI 兼容接口和 DeepSeek。

核心 service 位于：

```txt
src/modules/ai-gateway/ai-gateway.service.ts
```

它提供：

- `generate()`：普通非流式生成。
- `generateStream()`：provider 原始流式输出。
- `chatStream()`：供 Runtime / SingleAgentRunner 使用的流式适配接口。

支持供应商列表接口：

```txt
GET /api/ai-gateway/providers
```

## SingleAgentRunner

`SingleAgentRunner` 是当前 Agent Runtime 使用的执行策略。

代码层面保留了单 Agent ReAct/tool-call 循环结构：

```txt
调用 aiGateway.chatStream
读取 message.delta
如果没有 toolCalls，输出 message.completed 并结束
如果存在 toolCalls，执行 toolExecutor
将工具结果追加回 messages
进入下一轮模型调用
```

当前 `ToolRunner` 仍是工具执行边界，具体工具能力可以继续扩展。

## 占位模块

以下模块当前主要是模块占位或基础 Controller，业务能力还需要继续补齐：

- `workflow`
- `knowledge`
- `file`
- `publish`

## 启动和验证

在仓库根目录执行：

```bash
pnpm --filter backend start:dev
```

Windows PowerShell 如果 `pnpm` 被执行策略拦截，可以使用：

```powershell
pnpm.cmd --filter backend start:dev
```

默认地址：

```txt
http://localhost:3000/api/health
http://localhost:3000/api-docs
```

## 开发约定

- 不要把业务逻辑写进 `main.ts` 或 `app.module.ts`。
- 新业务优先放到 `src/modules/<module-name>`。
- 成功响应默认由全局拦截器包装。
- 业务异常优先使用 `BusinessException`。
- 数据库访问统一通过 `PrismaService`。
- 涉及用户资源时优先复用工作空间权限服务。
- SSE、文件下载等特殊响应需要使用 `@SkipResponseWrap()`。
- 不要提交 `.env`、日志、构建产物或本地临时文件。
