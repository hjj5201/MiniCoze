import { Module } from '@nestjs/common';
import { AiGatewayController } from '../controllers/ai-gateway.controller';
import { AiGatewayService } from '../services/ai-gateway.service';

@Module({
  controllers: [AiGatewayController],
  providers: [AiGatewayService],
  exports: [AiGatewayService],
})
export class AiGatewayModule {}
