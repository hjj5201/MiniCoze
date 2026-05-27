import { Injectable } from '@nestjs/common';
import { ToolDefinition } from '../../../shared/types/agent';
import { BuiltinPlugin } from '../interfaces/builtin-plugin.interface';

const TIME_TOOL_NAME = 'time_now';

@Injectable()
export class TimePlugin implements BuiltinPlugin {
  readonly id = 'builtin-time';
  readonly name = '时间插件';
  readonly description = '为 AI 提供当前服务器时间和时区信息。';

  getTools(): ToolDefinition[] {
    return [
      {
        type: 'function',
        function: {
          name: TIME_TOOL_NAME,
          description:
            '获取当前服务器时间。适用于用户询问现在几点、今天日期、当前时区时间等场景。',
          parameters: {
            type: 'object',
            properties: {
              timezone: {
                type: 'string',
                description:
                  '可选时区，默认 Asia/Shanghai，例如 Asia/Shanghai 或 UTC。',
              },
            },
            additionalProperties: false,
          },
        },
      },
    ];
  }

  execute(_toolName: string, args: Record<string, unknown>): string {
    const timezone =
      typeof args.timezone === 'string' && args.timezone.trim()
        ? args.timezone.trim()
        : 'Asia/Shanghai';
    const now = new Date();

    const formatted = new Intl.DateTimeFormat('zh-CN', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(now);

    return JSON.stringify({
      timezone,
      iso: now.toISOString(),
      formatted,
      timestamp: now.getTime(),
    });
  }
}
