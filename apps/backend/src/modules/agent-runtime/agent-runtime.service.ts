import { Injectable } from '@nestjs/common';
import { AiGatewayService } from '../ai-gateway/ai-gateway.service';
import { RunAgentCommand, RuntimeEvent } from '../../shared/types/agent';
import { AgentRuntime } from './runtime/agent-runtime';
import { RuntimeMemoryRepository } from './runtime/runtime-memory.repository';
import { ToolRunner } from './tools/tool-runner';

@Injectable()
export class AgentRuntimeService {
  private readonly repository = new RuntimeMemoryRepository(); //临时保存在内存

  constructor(
    private readonly aiGateway: AiGatewayService,
    private readonly toolRunner: ToolRunner,
  ) {}

  run(command: RunAgentCommand): AsyncIterable<RuntimeEvent> {
    const runtime = new AgentRuntime(
      this.aiGateway,
      this.repository,
      this.toolRunner,
    );
    return runtime.run(command);
  }

  cancel(): Promise<void> {
    return Promise.resolve();
  }
}
