import { createContext } from 'react';
import type { WorkspaceInfo } from '../../api/workspace';

export interface WorkspaceContextValue {
  workspaces: WorkspaceInfo[];
  currentWorkspace: WorkspaceInfo | null;
  loading: boolean;
  refreshWorkspaces: () => Promise<void>;
  switchWorkspace: (workspaceId: string) => Promise<void>;
}

export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);
