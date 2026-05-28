import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { message } from 'antd';
import {
  getCurrentWorkspaceId,
  getWorkspace,
  getWorkspaces,
  persistWorkspaceId,
  type WorkspaceInfo,
} from '../../api/workspace';
import { WorkspaceContext, type WorkspaceContextValue } from './workspace-store';

interface WorkspaceProviderProps {
  children: ReactNode;
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const loadCurrentWorkspace = useCallback(async () => {
    setLoading(true);
    try {
      const workspaceList = await getWorkspaces();
      setWorkspaces(workspaceList);

      if (workspaceList.length === 0) {
        setCurrentWorkspace(null);
        return;
      }

      const workspaceId = await getCurrentWorkspaceId();
      const detail = await getWorkspace(workspaceId);
      setCurrentWorkspace(detail);
      persistWorkspaceId(detail.id);
    } catch (error) {
      console.error(error);
      message.error('加载工作区失败');
    } finally {
      setLoading(false);
    }
  }, []);

  const switchWorkspace = useCallback(async (workspaceId: string) => {
    setLoading(true);
    try {
      const detail = await getWorkspace(workspaceId);
      setCurrentWorkspace(detail);
      persistWorkspaceId(detail.id);
    } catch (error) {
      console.error(error);
      message.error('切换工作区失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentWorkspace();
  }, [loadCurrentWorkspace]);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      workspaces,
      currentWorkspace,
      loading,
      refreshWorkspaces: loadCurrentWorkspace,
      switchWorkspace,
    }),
    [currentWorkspace, loadCurrentWorkspace, loading, switchWorkspace, workspaces],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}
