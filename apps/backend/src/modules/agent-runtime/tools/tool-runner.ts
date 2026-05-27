import { Injectable } from '@nestjs/common';
import { ToolCall, ToolResult } from '../../../shared/types/agent';
import { ToolExecutor } from '../../../shared/types/runtime';
import { PluginRegistryService } from '../../plugin/plugin.registry';

@Injectable()
export class ToolRunner implements ToolExecutor {
  constructor(private readonly pluginRegistry: PluginRegistryService) {}

  async execute(toolCall: ToolCall): Promise<ToolResult> {
    const args = this.parseArguments(toolCall.function.arguments);

    try {
      const result = await this.pluginRegistry.executeTool(
        toolCall.function.name,
        args,
      );
      return {
        toolCallId: toolCall.id,
        output: result,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      return {
        toolCallId: toolCall.id,
        output: JSON.stringify({
          error: message,
        }),
      };
    }
  }

  private parseArguments(raw: string): Record<string, unknown> {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : { value: parsed };
    } catch {
      return { value: raw };
    }
  }
}
