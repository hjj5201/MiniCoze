import { ToolDefinition } from '../../../shared/types/agent';

export interface BuiltinPlugin {
  readonly id: string;
  readonly name: string;
  readonly description: string;

  getTools(): ToolDefinition[];
  execute(
    toolName: string,
    args: Record<string, unknown>,
  ): Promise<string> | string;
}
