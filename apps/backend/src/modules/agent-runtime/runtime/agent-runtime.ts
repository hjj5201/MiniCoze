import { randomUUID } from 'node:crypto';
import {
  AgentConfig,
  ChatMessage,
  RunAgentCommand,
  RuntimeEvent,
  RuntimeRunStatus,
  TokenUsage,
  ToolCall,
  ToolResult,
} from '../../../shared/types/agent';
import { AiGatewayService } from '../../ai-gateway/ai-gateway.service';

// 一次 AI 运行的完整上下文
export interface RuntimeContext {
  runId: string;
  conversationId: string;
  agentId: string;
  userId: string;
  status: RuntimeRunStatus;
  input: ChatMessage;
  history: ChatMessage[];
  agentConfig: AgentConfig;
  usage?: TokenUsage;
}

// 存储接口
export interface RuntimeRepository {
  saveRun(context: RuntimeContext): Promise<void>;
  updateRunStatus(
    runId: string,
    status: RuntimeRunStatus,
    usage?: TokenUsage,
    error?: string,
  ): Promise<void>;
  appendMessage(runId: string, message: ChatMessage): Promise<void>;
  getConversationHistory(conversationId: string): Promise<ChatMessage[]>;
}

// 工具执行器
export interface ToolExecutor {
  execute(toolCall: ToolCall): Promise<ToolResult>;
}

// 核心循环
export class AgentRuntime {
  constructor(
    private readonly aiGateway: AiGatewayService,
    private readonly repository: RuntimeRepository,
    private readonly toolExecutor: ToolExecutor,
  ) {}

  async *run(command: RunAgentCommand): AsyncIterable<RuntimeEvent> {
    const runId = randomUUID();

    const conversationId = command.conversationId ?? randomUUID();

    const input: ChatMessage = {
      role: 'user',
      content: command.message,
    };

    const history =
      await this.repository.getConversationHistory(conversationId);

    const agentConfig = this.buildAgentConfig(command);

    const context: RuntimeContext = {
      runId,
      conversationId,
      agentId: command.agentId,
      userId: command.userId,
      status: 'created',
      input,
      history,
      agentConfig,
    };

    await this.repository.saveRun(context);
    yield { type: 'run.created', runId, conversationId };

    try {
      context.status = 'in_progress';
      await this.repository.updateRunStatus(runId, 'in_progress');
      yield { type: 'run.in_progress', runId };
      await this.repository.appendMessage(runId, input);

      const messages: ChatMessage[] = [
        { role: 'system', content: agentConfig.systemPrompt },
        ...history,
        input,
      ];

      let answer = '';
      const events = this.executeLoop(context, messages);
      for (;;) {
        const next = await events.next();
        if (next.done) {
          answer = next.value;
          break;
        }
        yield next.value;
      }
      await this.repository.appendMessage(runId, {
        role: 'assistant',
        content: answer,
      });
      context.status = 'completed';
      await this.repository.updateRunStatus(runId, 'completed', context.usage);
      yield { type: 'run.completed', runId, usage: context.usage };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      context.status = 'failed';
      await this.repository.updateRunStatus(
        runId,
        'failed',
        undefined,
        message,
      );
      yield { type: 'run.failed', runId, error: message };
    } finally {
      yield { type: 'stream.done', runId };
    }
  }

  // 工具执行器
  private async *executeLoop(
    context: RuntimeContext,
    messages: ChatMessage[],
  ): AsyncGenerator<RuntimeEvent, string, void> {
    const tools = context.agentConfig.tools ?? [];
    const assistantMessageId = randomUUID();

    for (;;) {
      const collected: string[] = [];
      const stream = this.aiGateway.chatStream({
        messages,
        model: context.agentConfig.model,
        temperature: context.agentConfig.temperature,
        maxTokens: context.agentConfig.maxTokens,
        tools,
      });

      let toolCalls: ToolCall[] = [];
      let content = '';

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
        if (chunk.finishReason) {
          context.usage = context.usage ?? {
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
          };
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

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: content || null,
        tool_calls: toolCalls,
      };
      messages.push(assistantMessage);

      for (const toolCall of toolCalls) {
        const parsedArgs = this.safeParse(toolCall.function.arguments);
        yield {
          type: 'tool.call.created',
          runId: context.runId,
          toolCallId: toolCall.id,
          name: toolCall.function.name,
          args: parsedArgs,
        };
        const result = await this.toolExecutor.execute(toolCall);
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

  private buildAgentConfig(command: RunAgentCommand): AgentConfig {
    return {
      id: command.agentId,
      name: command.agentId,
      systemPrompt: command.systemPrompt ?? 'You are a helpful assistant.',
      model: command.model ?? 'gpt-4.1-mini',
      temperature: command.temperature ?? 0.7,
      maxTokens: command.maxTokens ?? 1024,
      tools: command.tools ?? [],
    };
  }

  private safeParse(value: string): unknown {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
}
