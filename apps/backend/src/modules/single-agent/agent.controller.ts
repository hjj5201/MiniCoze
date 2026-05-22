import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUserInfo } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { CurrentUser } from '../../shared/types/current-user.type';
import { AgentService } from './agent.service';
import { AgentQueryDto } from './dto/agent-query.dto';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';

@ApiTags('agent')
@Controller('agents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post()
  @ApiOperation({ summary: '创建 Agent' })
  create(
    @CurrentUserInfo() currentUser: CurrentUser,
    @Body() createAgentDto: CreateAgentDto,
  ) {
    return this.agentService.create(currentUser.id, createAgentDto);
  }

  @Get()
  @ApiOperation({ summary: '获取工作空间下的 Agent 列表' })
  findByWorkspace(
    @CurrentUserInfo() currentUser: CurrentUser,
    @Query() query: AgentQueryDto,
  ) {
    return this.agentService.findByWorkspace(currentUser.id, query);
  }

  @Get(':agentId')
  @ApiOperation({ summary: '获取 Agent 详情' })
  findOne(
    @CurrentUserInfo() currentUser: CurrentUser,
    @Param('agentId') agentId: string,
  ) {
    return this.agentService.findOneForUser(currentUser.id, agentId);
  }

  @Patch(':agentId')
  @ApiOperation({ summary: '更新 Agent' })
  update(
    @CurrentUserInfo() currentUser: CurrentUser,
    @Param('agentId') agentId: string,
    @Body() updateAgentDto: UpdateAgentDto,
  ) {
    return this.agentService.update(currentUser.id, agentId, updateAgentDto);
  }

  @Delete(':agentId')
  @ApiOperation({ summary: '删除 Agent' })
  remove(
    @CurrentUserInfo() currentUser: CurrentUser,
    @Param('agentId') agentId: string,
  ) {
    return this.agentService.remove(currentUser.id, agentId);
  }
}
