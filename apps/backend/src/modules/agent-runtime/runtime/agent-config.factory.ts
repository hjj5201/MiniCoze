import { Injectable } from '@nestjs/common';
import { AgentConfig, RunAgentCommand } from '../../../shared/types/agent';

const DEFAULT_SYSTEM_PROMPT = 'You are a helpful assistant.';
const DEFAULT_MODEL = 'gpt-4.1-mini';
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 1024;

@Injectable()
export class AgentConfigFactory {
  build(command: RunAgentCommand): AgentConfig {
    return {
      id: command.agentId,
      name: command.agentId,
      systemPrompt: command.systemPrompt ?? DEFAULT_SYSTEM_PROMPT,
      model: command.model ?? DEFAULT_MODEL,
      temperature: command.temperature ?? DEFAULT_TEMPERATURE,
      maxTokens: command.maxTokens ?? DEFAULT_MAX_TOKENS,
      tools: command.tools ?? [],
    };
  }
}
