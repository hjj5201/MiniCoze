import { HttpStatus, Injectable } from '@nestjs/common';
import { Agent, Plugin } from '@prisma/client';
import { ErrorCode } from '../../common/constants/error-code';
import { BusinessException } from '../../common/exceptions/business.exception';
import { formatShanghaiDateTime } from '../../common/utils/date-time';
import { PrismaService } from '../../database/prisma.service';
import { ToolDefinition } from '../../shared/types/agent';
import { WorkspaceAccessService } from '../workspace/workspace-access.service';
import { PluginRegistryService } from './plugin.registry';
import { PluginResponse } from './types/plugin-response.type';

@Injectable()
export class PluginService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspaceAccessService: WorkspaceAccessService,
    private readonly pluginRegistry: PluginRegistryService,
  ) {}

  async listAvailablePlugins(): Promise<PluginResponse[]> {
    const plugins = await this.prisma.plugin.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });

    return plugins.map((plugin) => this.toPluginResponse(plugin));
  }

  async listAgentPlugins(
    userId: string,
    agentId: string,
  ): Promise<PluginResponse[]> {
    const agent = await this.findAgentOrThrow(agentId);
    await this.workspaceAccessService.ensureMember(userId, agent.workspaceId);

    const bindings = await this.prisma.agentPluginBinding.findMany({
      where: {
        agentId,
      },
      include: {
        plugin: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return bindings.map((binding) => this.toPluginResponse(binding.plugin));
  }

  async bindPluginToAgent(
    userId: string,
    agentId: string,
    pluginId: string,
  ): Promise<PluginResponse[]> {
    const agent = await this.findAgentOrThrow(agentId);
    await this.workspaceAccessService.ensureCanManage(
      userId,
      agent.workspaceId,
    );
    await this.ensurePluginExists(pluginId);

    await this.prisma.agentPluginBinding.upsert({
      where: {
        agentId_pluginId: {
          agentId,
          pluginId,
        },
      },
      update: {},
      create: {
        agentId,
        pluginId,
      },
    });

    return this.listAgentPlugins(userId, agentId);
  }

  async unbindPluginFromAgent(
    userId: string,
    agentId: string,
    pluginId: string,
  ): Promise<PluginResponse[]> {
    const agent = await this.findAgentOrThrow(agentId);
    await this.workspaceAccessService.ensureCanManage(
      userId,
      agent.workspaceId,
    );

    await this.prisma.agentPluginBinding.deleteMany({
      where: {
        agentId,
        pluginId,
      },
    });

    return this.listAgentPlugins(userId, agentId);
  }

  async getToolDefinitionsForAgent(agentId: string): Promise<ToolDefinition[]> {
    const bindings = await this.prisma.agentPluginBinding.findMany({
      where: {
        agentId,
      },
      select: {
        pluginId: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return bindings.flatMap(({ pluginId }) =>
      this.pluginRegistry.getToolDefinitions(pluginId),
    );
  }

  private async ensurePluginExists(pluginId: string): Promise<Plugin> {
    if (!this.pluginRegistry.hasPlugin(pluginId)) {
      throw new BusinessException(
        '插件未注册或当前版本不可用',
        ErrorCode.NotFound,
        HttpStatus.NOT_FOUND,
      );
    }

    const plugin = await this.prisma.plugin.findUnique({
      where: {
        id: pluginId,
      },
    });

    if (!plugin) {
      throw new BusinessException(
        '插件不存在',
        ErrorCode.NotFound,
        HttpStatus.NOT_FOUND,
      );
    }

    return plugin;
  }

  private async findAgentOrThrow(agentId: string): Promise<Agent> {
    const agent = await this.prisma.agent.findUnique({
      where: {
        id: agentId,
      },
    });

    if (!agent) {
      throw new BusinessException(
        'Agent 不存在',
        ErrorCode.NotFound,
        HttpStatus.NOT_FOUND,
      );
    }

    return agent;
  }

  private toPluginResponse(plugin: Plugin): PluginResponse {
    const tools = this.pluginRegistry
      .getToolDefinitions(plugin.id)
      .map((tool) => ({
        name: tool.function.name,
        description: tool.function.description,
      }));

    return {
      id: plugin.id,
      type: plugin.type,
      name: plugin.name,
      description: plugin.description,
      tools,
      createdAt: formatShanghaiDateTime(plugin.createdAt),
      updatedAt: formatShanghaiDateTime(plugin.updatedAt),
    };
  }
}
