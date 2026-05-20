import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUserInfo } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { CurrentUser } from '../../shared/types/current-user.type';
import { ConversationService } from './conversation.service';
import { CreateConversationDto, SendMessageDto } from './dto';

@ApiTags('conversation')
@Controller('workspaces/:workspaceId/conversations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  @ApiOperation({ summary: '创建对话并发送首条消息' })
  create(
    @CurrentUserInfo() currentUser: CurrentUser,
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateConversationDto,
  ) {
    return this.conversationService.create(currentUser.id, workspaceId, dto);
  }

  @Get(':conversationId')
  @ApiOperation({ summary: '获取对话详情及消息列表' })
  findOne(
    @CurrentUserInfo() currentUser: CurrentUser,
    @Param('workspaceId') workspaceId: string,
    @Param('conversationId') conversationId: string,
  ) {
    return this.conversationService.findOne(
      currentUser.id,
      workspaceId,
      conversationId,
    );
  }

  @Post(':conversationId/messages')
  @ApiOperation({ summary: '发送消息' })
  sendMessage(
    @CurrentUserInfo() currentUser: CurrentUser,
    @Param('workspaceId') workspaceId: string,
    @Param('conversationId') conversationId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.conversationService.sendMessage(
      currentUser.id,
      workspaceId,
      conversationId,
      dto,
    );
  }

  @Get('agents/:agentId')
  @ApiOperation({ summary: '获取某 Agent 下的对话列表' })
  findByAgent(
    @CurrentUserInfo() currentUser: CurrentUser,
    @Param('workspaceId') workspaceId: string,
    @Param('agentId') agentId: string,
  ) {
    return this.conversationService.findByAgent(
      currentUser.id,
      workspaceId,
      agentId,
    );
  }
}
