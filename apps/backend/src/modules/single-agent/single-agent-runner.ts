import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { RuntimeEvent, ToolCall } from '../../shared/types/agent';
import type {
  AgentExecutionInput,
  AgentExecutionStrategy,
} from '../../shared/types/runtime';
import { AiGatewayService } from '../ai-gateway/services/ai-gateway.service';

@Injectable()
export class SingleAgentRunner implements AgentExecutionStrategy {
  readonly mode = 'single_agent' as const;

  constructor(private readonly aiGateway: AiGatewayService) {}

  async *stream({
    context,
    messages,
    toolExecutor,
  }: AgentExecutionInput): AsyncGenerator<RuntimeEvent, string, void> {
    // 单 Agent 的 ReAct/tool-call 循环在这里执行。
    const tools = context.agentConfig.tools ?? [];
    const assistantMessageId = randomUUID();

    for (;;) {
      const stream = this.aiGateway.chatStream({
        messages,
        model: context.agentConfig.model,
        temperature: context.agentConfig.temperature,
        maxTokens: context.agentConfig.maxTokens,
        tools,
      });

      let toolCalls: ToolCall[] = [];
      let content = '';
      const collected: string[] = [];

      for await (const chunk of stream) {
        if (chunk.content) {
          content += chunk.content;
          collected.push(chunk.content);
          yield {
            type: 'message.delta',
            runId: context.runId,
            messageId: assistantMessageId,
            content: chunk.content,
          };
        }
        if (chunk.toolCalls?.length) {
          toolCalls = chunk.toolCalls;
        }
      }

      if (!toolCalls.length) {
        const finalContent = collected.join('');
        yield {
          type: 'message.completed',
          runId: context.runId,
          messageId: assistantMessageId,
          content: finalContent,
        };
        return finalContent;
      }

      // 先把 assistant 的 tool-call 消息放入上下文，再执行工具。
      messages.push({
        role: 'assistant',
        content: content || null,
        tool_calls: toolCalls,
      });

      for (const toolCall of toolCalls) {
        // 工具调用事件从这里透出，外层 runtime 只负责继续转发。
        const parsedArgs = this.safeParse(toolCall.function.arguments);
        yield {
          type: 'tool.call.created',
          runId: context.runId,
          toolCallId: toolCall.id,
          name: toolCall.function.name,
          args: parsedArgs,
        };

        const result = await toolExecutor.execute(toolCall);
        yield {
          type: 'tool.call.completed',
          runId: context.runId,
          toolCallId: toolCall.id,
          name: toolCall.function.name,
          result: result.output,
        };

        messages.push({
          role: 'tool',
          content: result.output,
          tool_call_id: toolCall.id,
          name: toolCall.function.name,
        });
      }
    }
  }

  private safeParse(value: string): unknown {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
}
