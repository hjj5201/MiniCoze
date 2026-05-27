import { registerMockHandler } from '../http';

let registered = false;

const mockAgents = [
  {
    id: 'agent-001',
    name: 'AI 助手',
    description: '通用 AI 对话助手',
    avatarUrl: null,
    systemPrompt: '你是一个有用的AI助手。',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    status: 'ACTIVE',
    workspaceId: 'default-workspace',
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
  },
  {
    id: 'agent-002',
    name: '代码审查助手',
    description: '帮助你审查代码质量和风格',
    avatarUrl: null,
    systemPrompt: '你是一个专业的代码审查助手。',
    model: 'gpt-4o-mini',
    temperature: 0.5,
    status: 'ACTIVE',
    workspaceId: 'default-workspace',
    createdAt: '2025-06-02T00:00:00Z',
    updatedAt: '2025-06-02T00:00:00Z',
  },
];

export function setupAgentMocks() {
  if (registered) return;
  registered = true;

  // 获取智能体列表
  registerMockHandler('GET', 'agents', async () => ({
    code: 0,
    message: 'ok',
    data: {
      list: mockAgents,
      total: mockAgents.length,
      page: 1,
      pageSize: 50,
    },
  }));

  // 创建智能体
  registerMockHandler('POST', 'agents', async (body) => {
    const params = body as {
      name: string;
      workspaceId: string;
      description?: string;
      avatarUrl?: string;
      systemPrompt?: string;
      model?: string;
      temperature?: number;
      status?: string;
    };
    const newAgent = {
      id: `agent-${Date.now()}`,
      name: params.name,
      description: params.description ?? '',
      avatarUrl: params.avatarUrl ?? null,
      systemPrompt: params.systemPrompt ?? '',
      model: params.model ?? 'gpt-4o-mini',
      temperature: params.temperature ?? 0.7,
      status: params.status ?? 'ACTIVE',
      workspaceId: params.workspaceId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockAgents.push(newAgent);
    return { code: 0, message: 'ok', data: newAgent };
  });
}
