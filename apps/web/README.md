# MiniCoze 前端项目结构说明

本文档说明 `apps/web` 前端应用的目录职责、模块边界、路由组织和菜单扩展方式，用于指导后续基于当前主框架继续开发 AI Agent 平台。

## 技术栈

- React 19
- TypeScript
- Vite 6
- React Router 7
- Ant Design 6
- CSS Modules
- pnpm workspace

## 顶层结构

```text
apps/web
├── package.json
├── vite.config.ts
├── tsconfig*.json
├── README.md
└── src
    ├── App.tsx
    ├── main.tsx
    ├── styles.css
    ├── api/
    ├── assets/
    ├── modules/
    └── routes/
```

## 入口文件

### `src/main.tsx`

React 应用入口，负责挂载根组件，并配置 Ant Design 全局主题。

### `src/App.tsx`

应用根组件，当前保持轻量，只负责：

- 初始化 mock 接口
- 恢复登录态
- 渲染 `AppRoutes`

路由配置已抽离到 `src/routes/app-routes.tsx`，避免根组件持续膨胀。

## 路由结构

```text
src/routes
├── app-routes.tsx
├── auth-guard.tsx
├── legacy-redirects.tsx
└── ...
```

### `app-routes.tsx`

主路由配置文件，包含：

- 公开路由：欢迎页、登录页、注册页
- 受保护后台路由：工作台、智能体、工作流、知识库、插件、发布、设置
- 后台路由统一包裹 `RequireAuth`、`WorkspaceProvider` 和 `AppLayout`

当前后台主路由：

```text
/workspace
/agents
/workflows
/knowledge-bases
/knowledge-bases/document
/knowledge-bases/productionline
/knowledge-bases/retrieveTest
/knowledge-bases/setting
/plugins
/publish
/settings
/architecture
```

### `auth-guard.tsx`

登录态守卫：

- `RequireAuth`：未登录跳转登录页
- `RedirectIfAuth`：已登录访问登录/注册时跳转工作台
- `RootRedirect`：根路径根据登录态跳转到工作台或欢迎页

### `legacy-redirects.tsx`

旧路径兼容重定向，避免历史链接失效。

例如：

```text
/homepage -> /workspace
/homepage/agent-config -> /agents
/homepage/workflow-canvas -> /workflows
/homepage/knowledge-base -> /knowledge-bases
```

## API 目录

```text
src/api
├── http.ts
├── auth/
├── workspace/
├── homepage/
├── agent-config/
├── agent-runtime/
├── workflow-canvas/
├── knowledge-base/
├── plugins/
├── publish/
└── settings/
```

### `http.ts`

统一 HTTP 客户端，负责：

- API base URL 拼接
- query 参数序列化
- Bearer Token 注入
- mock handler 分发
- 超时和错误包装

业务组件不应直接散落 `fetch` 请求。新增接口优先放到对应业务目录的 `api/<module>/index.ts`。

### `workspace/`

工作区接口与缓存逻辑：

- 获取工作区列表
- 获取指定工作区详情
- 缓存当前工作区 ID

顶部工作区选择器通过 `WorkspaceProvider` 消费这些能力。

### `agent-config/`

智能体配置接口，包括：

- 智能体列表
- 创建智能体
- 智能体详情
- 删除智能体
- 更新智能体配置

当前部分前端扩展字段仍通过 localStorage 暂存，例如 `mode`、`orchestration`。后续后端字段稳定后，应迁移到正式接口。

### `plugins/`、`publish/`、`settings/`

当前是模块 API 入口预留，用于后续集中管理对应业务接口。

## 模块目录

```text
src/modules
├── layout/
├── workspace/
├── welcome/
├── auth/
├── homepage/
├── agent-config/
├── workflow-canvas/
├── knowledge-base/
├── plugins/
├── publish/
├── settings/
└── architecture/
```

## 主框架模块

### `modules/layout/`

后台主框架目录。

```text
layout
├── AppLayout.tsx
├── AppLayout.module.css
└── menu.tsx
```

职责：

- 左侧 Sidebar
- Ant Design 二级菜单
- 顶部 Header
- 工作区选择器
- 用户头像和用户菜单
- 主内容区 `Outlet`

### 菜单配置

菜单配置在 `modules/layout/menu.tsx`。

当前菜单项类型：

```ts
export interface AppMenuItem {
  key: string;
  label: string;
  icon?: ReactNode;
  path?: string;
  children?: AppMenuItem[];
}
```

菜单渲染使用 Ant Design `Menu`，支持：

- 一级菜单
- 二级菜单
- 当前路由高亮
- 展开状态
- Sidebar 折叠
- 图标展示

当前只保留已有真实页面对应的菜单入口，不把尚未实现的功能作为占位菜单暴露。

当前菜单结构：

```text
工作台

智能体
└── 智能体列表

工作流
└── 画布编辑

知识库
├── 文档管理
├── 生产流水线
├── 检索测试
└── 知识库设置

插件
└── 插件市场

发布
└── 发布渠道

设置
└── 工作区设置
```

新增菜单入口时，需要同步：

1. `modules/layout/menu.tsx`
2. `routes/app-routes.tsx`
3. 如需兼容旧路径，同步 `routes/legacy-redirects.tsx`

## 工作区上下文

### `modules/workspace/`

```text
workspace
├── workspace-context.tsx
├── workspace-store.ts
└── use-workspace.ts
```

职责：

- 维护工作区列表
- 维护当前工作区
- 提供刷新工作区方法
- 提供切换工作区方法

业务模块需要当前工作区时，优先使用：

```ts
import { useWorkspace } from '../workspace/use-workspace';
```

不要在业务组件中直接读取 localStorage。

## 业务模块说明

### `modules/homepage/`

工作台页面，路由为 `/workspace`。

注意：后台主 Layout 已迁移到 `modules/layout`，不要再把全局布局代码放回 `homepage`。

### `modules/agent-config/`

智能体模块，路由为 `/agents`。

包含：

- 智能体列表
- 创建智能体
- 智能体详情
- 单智能体配置
- 多智能体配置
- 预览对话
- 开场白编辑

### `modules/workflow-canvas/`

工作流模块，路由为 `/workflows`。

当前包含：

- 工作流画布页面
- 画布 Header
- 画布 Toolbar

后续可继续补：

- 节点配置面板
- 画布保存
- 工作流调试
- 运行记录

### `modules/knowledge-base/`

知识库模块，路由为 `/knowledge-bases`。

当前子页面：

- `/knowledge-bases/document`
- `/knowledge-bases/productionline`
- `/knowledge-bases/retrieveTest`
- `/knowledge-bases/setting`

### `modules/plugins/`

插件模块，路由为 `/plugins`。

当前提供插件模块入口页面。后续可继续补：

- 插件市场
- 已安装插件
- 授权配置
- 调用记录

### `modules/publish/`

发布模块，路由为 `/publish`。

当前提供发布模块入口页面。后续可继续补：

- 发布渠道
- 版本管理
- 发布记录
- 回滚

### `modules/settings/`

设置模块，路由为 `/settings`。

当前提供设置模块入口页面。后续可继续补：

- 工作区设置
- 成员与权限
- 密钥管理
- 模型配置

## 样式约定

- 页面和组件优先使用 CSS Modules。
- 全局基础样式放在 `src/styles.css`。
- 后台主框架样式放在 `modules/layout/AppLayout.module.css`。
- 业务模块内部样式放在各自模块目录内。
- 子页面嵌入 `AppLayout` 后，应避免使用 `100vw` 和 `100vh` 作为主容器尺寸，优先使用：

```css
width: 100%;
height: 100%;
min-height: 0;
```

## 新增后台模块流程

新增一个后台模块时，建议至少补齐：

```text
src/modules/<module>/
  index.tsx
  index.module.css

src/api/<module>/
  index.ts
```

然后注册：

1. 在 `modules/layout/menu.tsx` 增加菜单项。
2. 在 `routes/app-routes.tsx` 增加路由。
3. 如需兼容旧路径，在 `routes/legacy-redirects.tsx` 增加重定向。


## 当前框架注意事项

- 主框架已经具备继续扩展的基础结构。
- 部分历史模块仍存在页面尺寸和内部 Header 与主 Layout 的适配问题，后续需要逐步统一。
- 插件、发布、设置目前是框架级入口页面，还不是完整业务实现。
