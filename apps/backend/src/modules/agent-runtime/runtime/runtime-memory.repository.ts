import {
  ChatMessage,
  RuntimeRunStatus,
  TokenUsage,
} from '../../../shared/types/agent';
import type {
  RuntimeContext,
  RuntimeRepository,
} from '../../../shared/types/runtime';

export class RuntimeMemoryRepository implements RuntimeRepository {
  private readonly runs = new Map<string, RuntimeContext>();
  private readonly conversations = new Map<string, ChatMessage[]>();

  saveRun(context: RuntimeContext): Promise<void> {
    this.runs.set(context.runId, context);
    const messages = this.conversations.get(context.conversationId) ?? [];
    this.conversations.set(context.conversationId, messages);
    return Promise.resolve();
  }

  updateRunStatus(
    runId: string,
    status: RuntimeRunStatus,
    usage?: TokenUsage,
    error?: string,
  ): Promise<void> {
    const run = this.runs.get(runId);
    if (!run) return Promise.resolve();
    run.status = status;
    if (usage) run.usage = usage;
    if (error) {
      void error;
    }
    return Promise.resolve();
  }

  appendMessage(runId: string, message: ChatMessage): Promise<void> {
    const run = this.runs.get(runId);
    if (!run) return Promise.resolve();
    const messages = this.conversations.get(run.conversationId) ?? [];
    messages.push(message);
    this.conversations.set(run.conversationId, messages);
    return Promise.resolve();
  }

  getConversationHistory(conversationId: string): Promise<ChatMessage[]> {
    return Promise.resolve([...(this.conversations.get(conversationId) ?? [])]);
  }
}
