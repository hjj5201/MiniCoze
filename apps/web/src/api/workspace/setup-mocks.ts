import { registerMockHandler } from '../http';

let registered = false;

export function setupWorkspaceMocks() {
  if (registered) return;
  registered = true;

  registerMockHandler('GET', 'workspaces', async () => {
    return {
      code: 0,
      message: 'ok',
      data: {
        list: [
          {
            id: 'default-workspace',
            name: '我的工作空间',
            description: '默认工作空间',
            ownerId: 'user-001',
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
      },
    };
  });
}
