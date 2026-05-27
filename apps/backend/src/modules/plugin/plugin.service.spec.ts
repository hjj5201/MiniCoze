import { Test, TestingModule } from '@nestjs/testing';
import { PluginType } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { WorkspaceAccessService } from '../workspace/workspace-access.service';
import { PluginRegistryService } from './plugin.registry';
import { PluginService } from './plugin.service';

const now = new Date('2026-05-27T00:00:00.000Z');

describe('PluginService', () => {
  let service: PluginService;
  let prisma: {
    plugin: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
    };
    agent: {
      findUnique: jest.Mock;
    };
    agentPluginBinding: {
      findMany: jest.Mock;
      upsert: jest.Mock;
      deleteMany: jest.Mock;
    };
  };
  let workspaceAccessService: {
    ensureMember: jest.Mock;
    ensureCanManage: jest.Mock;
  };
  let pluginRegistry: {
    hasPlugin: jest.Mock;
    getToolDefinitions: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      plugin: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      agent: {
        findUnique: jest.fn(),
      },
      agentPluginBinding: {
        findMany: jest.fn(),
        upsert: jest.fn(),
        deleteMany: jest.fn(),
      },
    };
    workspaceAccessService = {
      ensureMember: jest.fn(),
      ensureCanManage: jest.fn(),
    };
    pluginRegistry = {
      hasPlugin: jest.fn(),
      getToolDefinitions: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PluginService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: WorkspaceAccessService,
          useValue: workspaceAccessService,
        },
        {
          provide: PluginRegistryService,
          useValue: pluginRegistry,
        },
      ],
    }).compile();

    service = module.get(PluginService);
  });

  it('returns plugin list with tool metadata', async () => {
    prisma.plugin.findMany.mockResolvedValue([
      {
        id: 'builtin-time',
        type: PluginType.BUILTIN,
        name: '时间插件',
        description: '时间工具',
        createdAt: now,
        updatedAt: now,
      },
    ]);
    pluginRegistry.getToolDefinitions.mockReturnValue([
      {
        type: 'function',
        function: {
          name: 'time_now',
          description: '获取当前时间',
          parameters: {},
        },
      },
    ]);

    const result = await service.listAvailablePlugins();

    expect(result).toEqual([
      expect.objectContaining({
        id: 'builtin-time',
        tools: [
          {
            name: 'time_now',
            description: '获取当前时间',
          },
        ],
      }),
    ]);
  });

  it('binds plugin to agent and returns current bindings', async () => {
    prisma.agent.findUnique.mockResolvedValue({
      id: 'agent-id',
      workspaceId: 'workspace-id',
    });
    prisma.plugin.findUnique.mockResolvedValue({
      id: 'builtin-time',
      type: PluginType.BUILTIN,
      name: '时间插件',
      description: '时间工具',
      createdAt: now,
      updatedAt: now,
    });
    pluginRegistry.hasPlugin.mockReturnValue(true);
    pluginRegistry.getToolDefinitions.mockReturnValue([
      {
        type: 'function',
        function: {
          name: 'time_now',
          description: '获取当前时间',
          parameters: {},
        },
      },
    ]);
    prisma.agentPluginBinding.findMany.mockResolvedValue([
      {
        plugin: {
          id: 'builtin-time',
          type: PluginType.BUILTIN,
          name: '时间插件',
          description: '时间工具',
          createdAt: now,
          updatedAt: now,
        },
      },
    ]);

    const result = await service.bindPluginToAgent(
      'user-id',
      'agent-id',
      'builtin-time',
    );

    expect(workspaceAccessService.ensureCanManage).toHaveBeenCalledWith(
      'user-id',
      'workspace-id',
    );
    expect(prisma.agentPluginBinding.upsert).toHaveBeenCalledWith({
      where: {
        agentId_pluginId: {
          agentId: 'agent-id',
          pluginId: 'builtin-time',
        },
      },
      update: {},
      create: {
        agentId: 'agent-id',
        pluginId: 'builtin-time',
      },
    });
    expect(result).toHaveLength(1);
  });

  it('loads tool definitions for bound plugins', async () => {
    prisma.agentPluginBinding.findMany.mockResolvedValue([
      { pluginId: 'builtin-time' },
      { pluginId: 'builtin-echo' },
    ]);
    pluginRegistry.getToolDefinitions
      .mockReturnValueOnce([
        {
          type: 'function',
          function: {
            name: 'time_now',
            description: '获取当前时间',
            parameters: {},
          },
        },
      ])
      .mockReturnValueOnce([
        {
          type: 'function',
          function: {
            name: 'echo_text',
            description: '回显文本',
            parameters: {},
          },
        },
      ]);

    const result = await service.getToolDefinitionsForAgent('agent-id');

    expect(result.map((tool) => tool.function.name)).toEqual([
      'time_now',
      'echo_text',
    ]);
  });
});
