# MiniCoze Knowledge Base API

## 1. 模块说明

知识库模块负责为 Agent 提供 RAG 数据生产、管理、检索测试和流水线执行能力。前端当前使用 `src/api/knowledge-base` 与 `src/api/knowledge-pipeline` mock 替代后端接口。

核心页面：

- 知识库列表：搜索、筛选、统计、创建和操作入口。
- 知识库详情：文档、分段、检索测试、元数据、处理流水线、设置。
- 生产流水线：未转换引导页、节点式流程配置、发布和运行测试。
- 处理流水线 Tab：展示当前知识库最新运行实例、步骤状态、日志和重试。

## 2. 数据模型

### ApiResponse

```ts
type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};
```

### PageResult

```ts
type PageResult<T> = {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
};
```

### KnowledgeBase

```ts
type KnowledgeBase = {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'indexing' | 'disabled' | 'failed';
  sourceType: 'local_file' | 'text' | 'url' | 'notion' | 'api_source';
  documentCount: number;
  chunkCount: number;
  vectorCount?: number;
  indexStatus?: 'not_started' | 'indexing' | 'ready' | 'failed';
  tags?: string[];
  owner?: string;
  chunkConfig: ChunkConfig;
  embeddingConfig: EmbeddingConfig;
  retrievalConfig: RetrievalConfig;
  createdAt: string;
  updatedAt: string;
};
```

### KnowledgePipeline

```ts
type KnowledgePipeline = {
  id: string;
  name: string;
  description: string;
  knowledgeBaseId: string;
  knowledgeBaseName: string;
  status: 'draft' | 'published' | 'disabled';
  version: number;
  convertedAt?: string;
  updatedAt: string;
  steps: PipelineStep[];
};
```

### PipelineRun

```ts
type PipelineRun = {
  id: string;
  pipelineId: string;
  knowledgeBaseId: string;
  pipelineName: string;
  pipelineVersion: number;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  progress: number;
  steps: PipelineRunStep[];
  logs: PipelineLog[];
  startedAt: string;
  updatedAt: string;
};
```

## 3. 接口清单

| 能力 | 方法 | 路径 | 使用页面 | 触发时机 | 必须 | Mock | 优先级 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 获取知识库列表 | GET | `/api/knowledge-bases` | 列表、生产流水线 | 页面加载、筛选 | 是 | `knowledgeApi.getKnowledgeBases` | P0 |
| 创建知识库 | POST | `/api/knowledge-bases` | 创建页 | 提交创建 | 是 | `createKnowledgeBase` | P0 |
| 获取知识库详情 | GET | `/api/knowledge-bases/:id` | 详情页 | 详情加载 | 是 | `getKnowledgeBaseById` | P0 |
| 更新知识库 | PUT | `/api/knowledge-bases/:id` | 列表编辑、设置 | 保存配置 | 是 | `updateKnowledgeBase` | P0 |
| 删除知识库 | DELETE | `/api/knowledge-bases/:id` | 列表、设置 | 删除确认 | 是 | `deleteKnowledgeBase` | P0 |
| 修改知识库状态 | PUT | `/api/knowledge-bases/:id/status` | 列表、设置 | 启用/停用 | 是 | `updateKnowledgeBase` | P1 |
| 上传文档 | POST | `/api/knowledge-bases/:id/documents` | 文档管理 | 上传文件 | 是 | `uploadDocument` | P0 |
| 获取文档列表 | GET | `/api/knowledge-bases/:id/documents` | 文档管理 | Tab 加载 | 是 | `getDocuments` | P0 |
| 获取文档详情 | GET | `/api/documents/:documentId` | 文档管理 | 查看解析结果 | 否 | 未实现 | P1 |
| 删除文档 | DELETE | `/api/documents/:documentId` | 文档管理 | 删除确认 | 是 | `deleteDocument` | P0 |
| 重新解析文档 | POST | `/api/documents/:documentId/reparse` | 文档管理 | 重新解析/失败重试 | 是 | `reparseDocument` | P0 |
| 批量删除文档 | POST | `/api/documents/batch-delete` | 文档管理 | 批量删除 | 否 | 前端循环 mock | P1 |
| 批量重试失败文档 | POST | `/api/documents/batch-retry` | 文档管理 | 批量重试 | 否 | 前端循环 mock | P1 |
| 获取分段列表 | GET | `/api/knowledge-bases/:id/chunks` | 分段管理 | Tab 加载/搜索 | 是 | `getChunks` | P0 |
| 获取分段详情 | GET | `/api/chunks/:chunkId` | 分段管理 | 查看详情 | 否 | 未实现 | P1 |
| 编辑分段 | PUT | `/api/chunks/:chunkId` | 分段管理 | 保存编辑 | 是 | `updateChunk` | P0 |
| 删除分段 | DELETE | `/api/chunks/:chunkId` | 分段管理 | 删除确认 | 是 | `deleteChunk` | P0 |
| 启用/禁用分段 | PUT | `/api/chunks/:chunkId/status` | 分段管理 | Switch 切换 | 是 | `updateChunkStatus` | P0 |
| 搜索分段 | GET | `/api/knowledge-bases/:id/chunks/search` | 分段管理 | 搜索输入 | 否 | 前端过滤 | P1 |
| 执行检索测试 | POST | `/api/knowledge-bases/:id/retrieval-tests` | 检索测试 | 点击开始测试 | 是 | `testRetrieval` | P0 |
| 获取检索历史 | GET | `/api/knowledge-bases/:id/retrieval-tests` | 检索测试 | 查看历史 | 否 | 未实现 | P1 |
| 获取检索详情 | GET | `/api/retrieval-tests/:testId` | 检索测试 | 查看调试详情 | 否 | 未实现 | P1 |
| 获取元数据字段 | GET | `/api/knowledge-bases/:id/metadata-fields` | 元数据 | Tab 加载 | 是 | `getMetadataFields` | P0 |
| 新增元数据字段 | POST | `/api/knowledge-bases/:id/metadata-fields` | 元数据 | 新增字段 | 是 | `createMetadataField` | P0 |
| 更新元数据字段 | PUT | `/api/metadata-fields/:fieldId` | 元数据 | 保存/启停 | 是 | `updateMetadataField` | P0 |
| 删除元数据字段 | DELETE | `/api/metadata-fields/:fieldId` | 元数据 | 删除确认 | 是 | `deleteMetadataField` | P1 |
| 获取标签列表 | GET | `/api/knowledge-bases/:id/tags` | 列表、元数据 | 页面加载 | 否 | 字段内 mock | P2 |
| 更新标签 | PUT | `/api/knowledge-bases/:id/tags` | 列表、元数据 | 编辑标签 | 否 | 未实现 | P2 |
| 获取流水线配置 | GET | `/api/knowledge-bases/:id/pipeline` | 生产流水线 | 页面加载 | 是 | `knowledgePipelineApi.getPipeline` | P0 |
| 转换流水线 | POST | `/api/knowledge-bases/:id/pipeline/convert` | 生产流水线 | 点击转换 | 是 | `convertPipeline` | P0 |
| 保存流水线草稿 | PUT | `/api/pipelines/:pipelineId/draft` | 生产流水线 | 保存草稿 | 是 | `savePipeline` | P0 |
| 发布流水线 | POST | `/api/pipelines/:pipelineId/publish` | 生产流水线 | 点击发布 | 是 | `publishPipeline` | P0 |
| 删除流水线 | DELETE | `/api/pipelines/:pipelineId` | 生产流水线 | 删除配置 | 否 | 未实现 | P2 |
| 运行流水线测试 | POST | `/api/pipelines/:pipelineId/test-runs` | 生产流水线 | 运行测试 | 是 | `runPipeline` | P0 |
| 获取节点配置 | GET | `/api/pipelines/:pipelineId/steps/:stepId` | 生产流水线 | 点击节点 | 否 | 随 pipeline 返回 | P1 |
| 更新节点配置 | PUT | `/api/pipelines/:pipelineId/steps/:stepId` | 生产流水线 | 编辑节点参数 | 是 | `savePipeline` | P0 |
| 创建运行记录 | POST | `/api/pipelines/:pipelineId/runs` | 生产流水线 | 发布/运行 | 是 | `runPipeline` | P0 |
| 获取运行记录 | GET | `/api/knowledge-bases/:id/pipeline-runs` | 处理流水线 Tab | 查看历史 | 否 | 最新 run mock | P1 |
| 获取运行详情 | GET | `/api/pipeline-runs/:runId` | 处理流水线 Tab | Tab 加载 | 是 | `getLatestRun` | P0 |
| 获取步骤状态 | GET | `/api/pipeline-runs/:runId/steps` | 处理流水线 Tab | 刷新状态 | 是 | `refreshLatestRun` | P0 |
| 获取运行日志 | GET | `/api/pipeline-runs/:runId/logs` | 处理流水线 Tab | 查看日志 | 是 | run.logs mock | P0 |
| 重试失败步骤 | POST | `/api/pipeline-runs/:runId/steps/:stepId/retry` | 处理流水线 Tab | 点击重试 | 是 | `retryRunStep` | P0 |
| 取消运行 | POST | `/api/pipeline-runs/:runId/cancel` | 处理流水线 Tab | 取消运行 | 否 | 未实现 | P1 |
| 刷新运行状态 | POST | `/api/pipeline-runs/:runId/refresh` | 处理流水线 Tab | 点击刷新 | 是 | `refreshLatestRun` | P0 |
| 提交 Embedding 任务 | POST | `/api/knowledge-bases/:id/embedding-jobs` | 文档/流水线 | 入库前 | 是 | pipeline run mock | P0 |
| 获取 Embedding 状态 | GET | `/api/embedding-jobs/:jobId` | 分段/流水线 | 状态刷新 | 是 | chunk.embeddingStatus mock | P0 |
| 重新向量化 | POST | `/api/knowledge-bases/:id/re-embed` | 设置/流水线 | 手动重建索引 | 否 | 未实现 | P1 |
| 删除向量索引 | DELETE | `/api/knowledge-bases/:id/vector-index` | 设置 | 清理索引 | 否 | 未实现 | P2 |

## 4. 请求与响应示例

### 获取知识库列表

```http
GET /api/knowledge-bases?keyword=product&status=active&page=1&pageSize=20
```

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "list": [
      {
        "id": "kb-product",
        "name": "产品知识库",
        "status": "active",
        "documentCount": 12,
        "chunkCount": 920,
        "vectorCount": 920,
        "indexStatus": "ready",
        "updatedAt": "2026-05-29T08:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

### 发布流水线

```http
POST /api/pipelines/kpipe-001/publish
```

```json
{
  "name": "产品知识库生产流水线",
  "description": "标准 RAG 文档处理流程",
  "steps": []
}
```

```json
{
  "code": 0,
  "message": "published",
  "data": {
    "pipeline": { "id": "kpipe-001", "status": "published", "version": 2 },
    "run": { "id": "prun-001", "status": "running", "progress": 0 }
  }
}
```

### 重试失败步骤

```http
POST /api/pipeline-runs/prun-001/steps/step-embedding/retry
```

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "id": "prun-001",
    "status": "running",
    "steps": [
      { "stepId": "step-embedding", "status": "running", "retryCount": 1 }
    ]
  }
}
```

## 5. Mock 对应关系

- `src/api/knowledge-base/mock.ts`：知识库、文档、分段、检索测试、元数据。
- `src/api/knowledge-pipeline/mock.ts`：流水线配置、转换、发布、运行、刷新、重试。
- 当前 mock 使用 `localStorage`，刷新页面后仍会保留前端本地数据。

## 6. 联调建议

1. P0 先打通知识库、文档、分段、检索测试、流水线运行闭环。
2. 后端需要把文档解析、Embedding、向量入库设计为异步任务，前端通过运行记录轮询或 WebSocket/SSE 获取状态。
3. `PipelineRunStep.status` 必须稳定返回 `pending/running/success/failed/skipped`。
4. 检索测试建议返回向量距离、rerank 分、命中方式、元数据，便于前端调试展示。
5. 批量操作建议后端提供批量接口，避免前端循环请求造成状态不一致。
