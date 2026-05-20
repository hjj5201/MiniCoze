import { Module } from '@nestjs/common';
import { AGENT_EXECUTION_STRATEGY } from '../../shared/tokens/runtime.tokens';
import { AiGatewayModule } from '../ai-gateway/ai-gateway.module';
import { WorkspaceModule } from '../workspace/workspace.module';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { SingleAgentRunner } from './single-agent-runner';

@Module({
  imports: [AiGatewayModule, WorkspaceModule],
  controllers: [AgentController],
  providers: [
    AgentService,
    SingleAgentRunner,
    { provide: AGENT_EXECUTION_STRATEGY, useExisting: SingleAgentRunner },
  ],
  exports: [AgentService, AGENT_EXECUTION_STRATEGY],
})
export class AgentModule {}
