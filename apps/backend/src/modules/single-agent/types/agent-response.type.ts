import { AgentStatus } from '@prisma/client';

export interface AgentResponse {
  id: string;
  workspaceId: string;
  creatorId: string;
  name: string;
  description: string | null;
  avatarUrl: string | null;
  systemPrompt: string;
  model: string;
  temperature: number;
  status: AgentStatus;
  createdAt: string;
  updatedAt: string;
}
