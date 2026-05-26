import { HttpStatus, Injectable } from '@nestjs/common';
import { Agent, Prisma } from '@prisma/client';
import { ErrorCode } from '../../common/constants/error-code';
import { BusinessException } from '../../common/exceptions/business.exception';
import { createPaginatedData } from '../../common/types/pagination-response.type';
import { formatShanghaiDateTime } from '../../common/utils/date-time';
import { PrismaService } from '../../database/prisma.service';
import { WorkspaceAccessService } from '../workspace/workspace-access.service';
import { AgentQueryDto } from './dto/agent-query.dto';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { AgentResponse } from './types/agent-response.type';

@Injectable()
export class AgentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspaceAccessService: WorkspaceAccessService,
  ) {}

  async create(
    userId: string,
    createAgentDto: CreateAgentDto,
  ): Promise<AgentResponse> {
    await this.workspaceAccessService.ensureCanManage(
      userId,
      createAgentDto.workspaceId,
    );

    const agent = await this.prisma.agent.create({
      data: {
        workspaceId: createAgentDto.workspaceId,
        creatorId: userId,
        name: createAgentDto.name,
        description: createAgentDto.description,
        avatarUrl: createAgentDto.avatarUrl,
        systemPrompt: createAgentDto.systemPrompt,
        model: createAgentDto.model,
        temperature: createAgentDto.temperature,
        status: createAgentDto.status,
      },
    });

    return this.toAgentResponse(agent);
  }

  async findByWorkspace(userId: string, query: AgentQueryDto) {
    await this.workspaceAccessService.ensureMember(userId, query.workspaceId);

    const { page, pageSize, workspaceId, status, keyword } = query;
    const where: Prisma.AgentWhereInput = {
      workspaceId,
      status,
      ...(keyword
        ? {
            OR: [
              { name: { contains: keyword, mode: 'insensitive' } },
              { description: { contains: keyword, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [agents, total] = await this.prisma.$transaction([
      this.prisma.agent.findMany({
        where,
        orderBy: {
          updatedAt: 'desc',
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.agent.count({ where }),
    ]);

    return createPaginatedData({
      list: agents.map((agent) => this.toAgentResponse(agent)),
      total,
      page,
      pageSize,
    });
  }

  async findOneForUser(
    userId: string,
    agentId: string,
  ): Promise<AgentResponse> {
    const agent = await this.findAgentOrThrow(agentId);
    await this.workspaceAccessService.ensureMember(userId, agent.workspaceId);

    return this.toAgentResponse(agent);
  }

  async findRunnableAgentForUser(
    userId: string,
    agentId: string,
  ): Promise<Agent> {
    const agent = await this.findAgentOrThrow(agentId);
    await this.workspaceAccessService.ensureMember(userId, agent.workspaceId);

    return agent;
  }

  async update(
    userId: string,
    agentId: string,
    updateAgentDto: UpdateAgentDto,
  ): Promise<AgentResponse> {
    const agent = await this.findAgentOrThrow(agentId);
    await this.workspaceAccessService.ensureCanManage(
      userId,
      agent.workspaceId,
    );

    const updatedAgent = await this.prisma.agent.update({
      where: {
        id: agentId,
      },
      data: {
        name: updateAgentDto.name,
        description: updateAgentDto.description,
        avatarUrl: updateAgentDto.avatarUrl,
        systemPrompt: updateAgentDto.systemPrompt,
        model: updateAgentDto.model,
        temperature: updateAgentDto.temperature,
        status: updateAgentDto.status,
      },
    });

    return this.toAgentResponse(updatedAgent);
  }

  async remove(userId: string, agentId: string): Promise<AgentResponse> {
    const agent = await this.findAgentOrThrow(agentId);
    await this.workspaceAccessService.ensureCanManage(
      userId,
      agent.workspaceId,
    );

    const deletedAgent = await this.prisma.agent.delete({
      where: {
        id: agentId,
      },
    });

    return this.toAgentResponse(deletedAgent);
  }

  private async findAgentOrThrow(agentId: string) {
    const agent = await this.prisma.agent.findUnique({
      where: {
        id: agentId,
      },
    });

    if (!agent) {
      throw new BusinessException(
        'Agent 不存在',
        ErrorCode.NotFound,
        HttpStatus.NOT_FOUND,
      );
    }

    return agent;
  }

  private toAgentResponse(agent: Agent): AgentResponse {
    return {
      id: agent.id,
      workspaceId: agent.workspaceId,
      creatorId: agent.creatorId,
      name: agent.name,
      description: agent.description,
      avatarUrl: agent.avatarUrl,
      systemPrompt: agent.systemPrompt,
      model: agent.model,
      temperature: agent.temperature,
      status: agent.status,
      createdAt: formatShanghaiDateTime(agent.createdAt),
      updatedAt: formatShanghaiDateTime(agent.updatedAt),
    };
  }
}
