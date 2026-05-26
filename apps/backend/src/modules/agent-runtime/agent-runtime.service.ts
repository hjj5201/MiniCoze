import { Injectable } from '@nestjs/common';
import { RunAgentCommand, RuntimeEvent } from '../../shared/types/agent';
import { AgentRuntime } from './runtime/agent-runtime';

@Injectable()
export class AgentRuntimeService {
  constructor(private readonly agentRuntime: AgentRuntime) {}

  run(command: RunAgentCommand): AsyncIterable<RuntimeEvent> {
    return this.agentRuntime.run(command);
  }

  cancel(): Promise<void> {
    return Promise.resolve();
  }
}
