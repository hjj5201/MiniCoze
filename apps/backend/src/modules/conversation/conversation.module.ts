import { Module } from '@nestjs/common';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { AiGatewayModule } from '../ai-gateway/ai-gateway.module';
import { WorkspaceModule } from '../workspace/workspace.module';

@Module({
  imports: [AiGatewayModule, WorkspaceModule],
  controllers: [ConversationController],
  providers: [ConversationService],
})
export class ConversationModule {}
