import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AiProvider } from './types';

@ApiTags('ai-gateway')
@Controller('ai-gateway')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiGatewayController {
  @Get('providers')
  @ApiOperation({ summary: '获取支持的 AI 提供商列表' })
  getProviders() {
    return {
      providers: Object.values(AiProvider),
    };
  }
}
