import { registerMockHandler } from '../http';

let registered = false;

const mockWorkspaces = [
  {
    id: 'default-workspace',
    name: '我的工作区',
    description: '默认工作区',
    ownerId: 'user-001',
    role: 'OWNER',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

export function setupWorkspaceMocks() {
  if (registered) return;
  registered = true;

  registerMockHandler('GET', 'workspaces', async () => {
    return {
      code: 0,
      message: 'ok',
      data: {
        list: mockWorkspaces,
        total: mockWorkspaces.length,
        page: 1,
        pageSize: 20,
      },
    };
  });

  registerMockHandler('GET', 'workspaces/default-workspace', async () => {
    return {
      code: 0,
      message: 'ok',
      data: mockWorkspaces[0],
    };
  });
}
