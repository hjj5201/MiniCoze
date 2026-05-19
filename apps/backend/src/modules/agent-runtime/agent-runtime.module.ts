import { Module } from '@nestjs/common';
import { AiGatewayModule } from '../ai-gateway/ai-gateway.module';
import { AgentRuntimeController } from './agent-runtime.controller';
import { AgentRuntimeService } from './agent-runtime.service';
import { ToolRunner } from './tools/tool-runner';

@Module({
  imports: [AiGatewayModule],
  controllers: [AgentRuntimeController],
  providers: [AgentRuntimeService, ToolRunner],
  exports: [AgentRuntimeService, ToolRunner],
})
export class AgentRuntimeModule {}
