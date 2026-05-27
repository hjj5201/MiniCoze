import { Injectable } from '@nestjs/common';
import { ToolDefinition } from '../../../shared/types/agent';
import { BuiltinPlugin } from '../interfaces/builtin-plugin.interface';

const ECHO_TOOL_NAME = 'echo_text';

@Injectable()
export class EchoPlugin implements BuiltinPlugin {
  readonly id = 'builtin-echo';
  readonly name = '回声插件';
  readonly description = '为 AI 提供参数回显能力，便于调试工具调用链路。';

  getTools(): ToolDefinition[] {
    return [
      {
        type: 'function',
        function: {
          name: ECHO_TOOL_NAME,
          description:
            '回显输入文本和附加元数据。适用于调试参数传递、结构化输出和工具调用链路。',
          parameters: {
            type: 'object',
            properties: {
              text: {
                type: 'string',
                description: '需要回显的文本内容。',
              },
              tag: {
                type: 'string',
                description: '可选标签，用于标记这次调用。',
              },
            },
            required: ['text'],
            additionalProperties: false,
          },
        },
      },
    ];
  }

  execute(_toolName: string, args: Record<string, unknown>): string {
    const text = typeof args.text === 'string' ? args.text : '';
    const tag = typeof args.tag === 'string' ? args.tag : null;

    return JSON.stringify({
      text,
      tag,
      length: text.length,
    });
  }
}
