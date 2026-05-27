import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUserInfo } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { CurrentUser } from '../../shared/types/current-user.type';
import { PluginService } from './plugin.service';

@ApiTags('plugin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller()
export class PluginController {
  constructor(private readonly pluginService: PluginService) {}

  @Get('plugins')
  @ApiOperation({ summary: '获取平台插件列表' })
  listAvailablePlugins() {
    return this.pluginService.listAvailablePlugins();
  }

  @Get('agents/:agentId/plugins')
  @ApiOperation({ summary: '获取 Agent 已绑定插件' })
  listAgentPlugins(
    @CurrentUserInfo() currentUser: CurrentUser,
    @Param('agentId') agentId: string,
  ) {
    return this.pluginService.listAgentPlugins(currentUser.id, agentId);
  }

  @Post('agents/:agentId/plugins/:pluginId')
  @ApiOperation({ summary: '为 Agent 绑定插件' })
  bindPluginToAgent(
    @CurrentUserInfo() currentUser: CurrentUser,
    @Param('agentId') agentId: string,
    @Param('pluginId') pluginId: string,
  ) {
    return this.pluginService.bindPluginToAgent(
      currentUser.id,
      agentId,
      pluginId,
    );
  }

  @Delete('agents/:agentId/plugins/:pluginId')
  @ApiOperation({ summary: '解绑 Agent 插件' })
  unbindPluginFromAgent(
    @CurrentUserInfo() currentUser: CurrentUser,
    @Param('agentId') agentId: string,
    @Param('pluginId') pluginId: string,
  ) {
    return this.pluginService.unbindPluginFromAgent(
      currentUser.id,
      agentId,
      pluginId,
    );
  }
}
