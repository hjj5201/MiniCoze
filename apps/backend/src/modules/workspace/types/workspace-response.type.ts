import { WorkspaceRole } from '@prisma/client';

export interface WorkspaceResponse {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  role: WorkspaceRole;
  createdAt: string;
  updatedAt: string;
}
