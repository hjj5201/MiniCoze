import { Injectable } from '@nestjs/common';
import {
  AgentConfig,
  RunAgentCommand,
  ToolDefinition,
} from '../../../shared/types/agent';
import { PluginService } from '../../plugin/plugin.service';
import { AgentService } from '../../single-agent/agent.service';

const DEFAULT_MAX_TOKENS = 1024;

@Injectable()
export class AgentConfigFactory {
  constructor(
    private readonly agentService: AgentService,
    private readonly pluginService: PluginService,
  ) {}

  async build(command: RunAgentCommand): Promise<AgentConfig> {
    const agent = await this.agentService.findRunnableAgentForUser(
      command.userId,
      command.agentId,
    );
    const pluginTools = await this.pluginService.getToolDefinitionsForAgent(
      agent.id,
    );

    return {
      id: agent.id,
      name: agent.name,
      systemPrompt: command.systemPrompt ?? agent.systemPrompt,
      model: command.model ?? agent.model,
      temperature: command.temperature ?? agent.temperature,
      maxTokens: command.maxTokens ?? DEFAULT_MAX_TOKENS,
      contextLimit: agent.contextLimit,
      tools: this.mergeTools(pluginTools, command.tools ?? []),
    };
  }

  private mergeTools(
    pluginTools: ToolDefinition[],
    runtimeTools: ToolDefinition[],
  ): ToolDefinition[] {
    const merged = new Map<string, ToolDefinition>();

    for (const tool of pluginTools) {
      merged.set(tool.function.name, tool);
    }

    for (const tool of runtimeTools) {
      merged.set(tool.function.name, tool);
    }

    return [...merged.values()];
  }
}
