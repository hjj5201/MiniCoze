import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Avatar, Button, Dropdown, Menu, Select } from 'antd';
import type { MenuProps } from 'antd';
import {
  DownOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  RobotOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { logout } from '../../api/auth';
import { getCurrentUser } from '../../api/auth/auth-store';
import { useWorkspace } from '../workspace/use-workspace';
import { appMenuItems, flattenMenuItems, getMenuParentKeys } from './menu';
import styles from './AppLayout.module.css';

const flatMenuItems = flattenMenuItems(appMenuItems);

function getSelectedMenuKey(pathname: string) {
  const matched = flatMenuItems
    .filter((item) => item.path && (pathname === item.path || pathname.startsWith(`${item.path}/`)))
    .sort((a, b) => (b.path?.length ?? 0) - (a.path?.length ?? 0))[0];

  return matched?.key ?? '';
}

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { workspaces, currentWorkspace, loading, switchWorkspace } = useWorkspace();
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const selectedKey = getSelectedMenuKey(location.pathname);
  const selectedParentKeys = selectedKey ? getMenuParentKeys(appMenuItems, selectedKey) : [];

  useEffect(() => {
    if (!collapsed) {
      setOpenKeys((currentKeys) => Array.from(new Set([...currentKeys, ...selectedParentKeys])));
    }
  }, [collapsed, selectedKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const sidebarMenuItems: MenuProps['items'] = useMemo(
    () =>
      appMenuItems.map((item) => ({
        key: item.key,
        icon: item.icon,
        label: item.label,
        children: item.children?.map((child) => ({
          key: child.key,
          icon: child.icon,
          label: child.label,
        })),
      })),
    [],
  );

  const userDropdownItems: MenuProps['items'] = useMemo(
    () => [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: user?.username ?? '用户',
        disabled: true,
      },
      { type: 'divider' },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        danger: true,
      },
    ],
    [user?.username],
  );

  const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className={styles.appLayout}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <RobotOutlined />
          </div>
          {!collapsed && <span className={styles.brandText}>AI Agent 平台</span>}
        </div>

        <Menu
          className={styles.navMenu}
          mode="inline"
          inlineCollapsed={collapsed}
          items={sidebarMenuItems}
          selectedKeys={selectedKey ? [selectedKey] : []}
          openKeys={collapsed ? undefined : openKeys}
          onOpenChange={setOpenKeys}
          onClick={({ key }) => {
            const target = flatMenuItems.find((item) => item.key === key);
            if (target?.path) {
              navigate(target.path);
            }
          }}
        />

        <div className={styles.sidebarFooter}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed((value) => !value)}
            className={styles.collapseButton}
            aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
          >
            {!collapsed && '收起'}
          </Button>
        </div>
      </aside>

      <section className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <Select
              className={styles.workspaceSelect}
              value={currentWorkspace?.id}
              placeholder="选择一个工作区"
              loading={loading}
              options={workspaces.map((workspace) => ({
                value: workspace.id,
                label: workspace.name,
              }))}
              onChange={switchWorkspace}
              suffixIcon={<DownOutlined />}
            />
          </div>

          <div className={styles.headerRight}>
            <Dropdown
              menu={{ items: userDropdownItems, onClick: handleUserMenuClick }}
              placement="bottomRight"
              trigger={['click']}
            >
              <button className={styles.userButton} type="button">
                <Avatar size={34} src={user?.avatarUrl ?? undefined} icon={!user?.avatarUrl && <UserOutlined />} />
                <span className={styles.userName}>{user?.username ?? '用户'}</span>
                <DownOutlined className={styles.userArrow} />
              </button>
            </Dropdown>
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </section>
    </div>
  );
}
