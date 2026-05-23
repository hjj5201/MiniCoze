// 智能体配置模块 API

export interface AgentConfig {
  id: string;
  name: string;
  avatar: string;
  description: string;
  mode: 'chat' | 'single' | 'multi';
  persona: string;
  orchestration: string;
  createdAt: string;
}

const STORAGE_KEY = 'miniCoze_agents';

/** 从 localStorage 读取所有智能体 */
function loadAll(): AgentConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** 写入 localStorage */
function saveAll(list: AgentConfig[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/** 创建智能体 */
export async function createAgent(params: {
  name: string;
  avatar: string;
  description: string;
}): Promise<AgentConfig> {
  const list = loadAll();
  const newAgent: AgentConfig = {
    id: Date.now().toString(),
    name: params.name,
    avatar: params.avatar,
    description: params.description,
    mode: 'chat',
    persona: '',
    orchestration: '',
    createdAt: new Date().toISOString(),
  };
  list.unshift(newAgent);
  saveAll(list);
  return newAgent;
}

/** 获取智能体列表 */
export async function getAgentList(): Promise<AgentConfig[]> {
  return loadAll();
}

/** 获取单个智能体详情 */
export async function getAgentDetail(id: string): Promise<AgentConfig | null> {
  const list = loadAll();
  return list.find((a) => a.id === id) ?? null;
}

/** 删除智能体 */
export async function deleteAgent(id: string): Promise<void> {
  const list = loadAll().filter((a) => a.id !== id);
  saveAll(list);
}

/** 更新智能体配置 */
export async function updateAgent(
  id: string,
  patch: Partial<Pick<AgentConfig, 'name' | 'avatar' | 'description' | 'mode' | 'persona' | 'orchestration'>>
): Promise<AgentConfig | null> {
  const list = loadAll();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...patch };
  saveAll(list);
  return list[idx];
}