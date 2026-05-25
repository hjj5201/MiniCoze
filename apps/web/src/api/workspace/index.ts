import { http, type ApiEnvelope } from '../http';
export interface WorkspaceInfo {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}
interface PaginatedWorkspace {
  list: WorkspaceInfo[];
  total: number;
  page: number;
  pageSize: number;
}
const WORKSPACE_CACHE_KEY = 'minicoze_workspace_id';
/** 获取工作空间列表 */
export async function getWorkspaces(): Promise<WorkspaceInfo[]> {
  const res = await http.get<ApiEnvelope<PaginatedWorkspace>>(
    'workspaces',
    { query: { page: 1, pageSize: 20 } },
  );
  return res.data.list;
}
/** 获取当前工作空间 ID（优先缓存，无缓存则请求后端取第一个） */
export async function getCurrentWorkspaceId(): Promise<string> {
  // 先从缓存读
  try {
    const cached = localStorage.getItem(WORKSPACE_CACHE_KEY);
    if (cached) return cached;
  } catch {
    // ignore
  }
  const workspaces = await getWorkspaces();
  if (workspaces.length === 0) {
    throw new Error('暂无可用工作空间，请先创建工作空间');
  }
  const id = workspaces[0].id;
  persistWorkspaceId(id);
  return id;
}
/** 缓存工作空间 ID */
export function persistWorkspaceId(id: string) {
  try {
    localStorage.setItem(WORKSPACE_CACHE_KEY, id);
  } catch {
    // ignore
  }
}
/** 清除工作空间缓存 */
export function clearWorkspaceCache() {
  try {
    localStorage.removeItem(WORKSPACE_CACHE_KEY);
  } catch {
    // ignore
  }
}