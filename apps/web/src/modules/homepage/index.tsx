import { useState, useMemo, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Dropdown, Button, Avatar } from 'antd'
import type { MenuProps } from 'antd'
import {
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  FileTextOutlined,
  MailOutlined,
  LogoutOutlined,
  CheckOutlined,
  SunOutlined,
  MoonOutlined,
  LaptopOutlined,
} from '@ant-design/icons'
import { getCurrentUser } from '../../api/auth/auth-store'
import { logout } from '../../api/auth'
import styles from './index.module.css'

export { HomepageIndex } from './home'

type ThemeMode = 'light' | 'dark' | 'system'

const MenuItems = [
  { title: 'minicoze', path: '/homepage', desc: '点击进入Ai智能聊天界面' },
  { title: '创建智能体', path: '/homepage/agent-config', desc: '点击进入智能体配置界面' },
  { title: '创建工作流', path: '/homepage/workflow-canvas', desc: '点击进入工作流配置界面' },
  { title: '创建知识库', path: '/homepage/knowledge-base', desc: '点击进入知识库配置界面' },
]

const TopNavText = 'MiniCoze AI Agent控制平台'

const themeOptions: { key: ThemeMode; icon: React.ReactNode; label: string }[] = [
  { key: 'light', icon: <SunOutlined />, label: '亮色' },
  { key: 'dark', icon: <MoonOutlined />, label: '暗色' },
  { key: 'system', icon: <LaptopOutlined />, label: '跟随系统' },
]

const THEME_STORAGE_KEY = 'minicoze_theme'

function readTheme(): ThemeMode {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY)
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw
  } catch { /* ignore */ }
  return 'system'
}

function persistTheme(mode: ThemeMode) {
  try { localStorage.setItem(THEME_STORAGE_KEY, mode) } catch { /* ignore */ }
}

function getEffectiveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return mode
}

function applyTheme(mode: ThemeMode) {
  const effective = getEffectiveTheme(mode)
  document.documentElement.setAttribute('data-theme', effective)
  document.documentElement.classList.toggle('dark', effective === 'dark')
}

export const Homepage = () => {
  const navigate = useNavigate()
  const user = getCurrentUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [theme, setTheme] = useState<ThemeMode>(readTheme)

  // 初始化时应用已保存的主题
  useEffect(() => {
    applyTheme(theme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 监听系统主题变化（仅在 system 模式下自动切换）
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      if (theme === 'system') applyTheme('system')
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme)
    persistTheme(newTheme)
    applyTheme(newTheme)
  }

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key === 'logout') {
      logout()
      navigate('/login')
    }
  }

  const profileDropdownItems: MenuProps['items'] = useMemo(() => [
    {
      key: 'theme',
      label: '主题',
      popupClassName: styles.themeSubmenu,
      children: themeOptions.map((opt) => ({
        key: `theme_${opt.key}`,
        label: (
          <div className={styles.themeItem}>
            {opt.icon}
            <span>{opt.label}</span>
            {theme === opt.key && <CheckOutlined className={styles.themeCheck} />}
          </div>
        ),
        onClick: () => handleThemeChange(opt.key),
      })),
    },
    { type: 'divider' },
    {
      key: 'download',
      icon: <LaptopOutlined />,
      label: '下载客户端',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      key: 'docs',
      icon: <FileTextOutlined />,
      label: '文档',
    },
    {
      key: 'contact',
      icon: <MailOutlined />,
      label: '联系我们',
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ], [theme])

  return (
    <div className={styles.homepageBox}>
      <div className={styles.centerBox}>
        {mobileMenuOpen && (
          <div
            className={styles.mobileOverlay}
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <aside className={`${styles.sidebarPanel} ${mobileMenuOpen ? styles.mobileOpen : ''}`}>
          <div className={styles.sidebar}>
            <span className={styles.icon}>MC</span>
            <span className={styles.title}>minicoze</span>
          </div>

          <nav className={styles.leftNav}>
            {MenuItems.map((item) => (
              <NavLink
                to={item.path}
                key={item.title}
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className={styles.navText}>
                  <span className={styles.navTitle}>{item.title}</span>
                  <span className={styles.navDesc}>{item.desc}</span>
                </div>
              </NavLink>
            ))}
          </nav>

          <div className={styles.sidebarFooter}>
            <Dropdown
              menu={{ items: profileDropdownItems, onClick: handleMenuClick }}
              placement="topLeft"
              trigger={['click']}
            >
              <div className={styles.userArea}>
                <Avatar
                  className={styles.userAvatar}
                  size={36}
                  icon={!user?.avatarUrl && <UserOutlined />}
                  src={user?.avatarUrl ?? undefined}
                />
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{user?.username ?? '用户'}</span>
                  <span className={styles.userStatus}>在线</span>
                </div>
                <span className={styles.notificationBadge}>22</span>
              </div>
            </Dropdown>
          </div>
        </aside>

        <main className={styles.consoleMain}>
          <div className={styles.topNav}>
            <Button
              type="text"
              icon={mobileMenuOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={styles.mobileMenuBtn}
              aria-label="切换菜单"
            />

            <span>{TopNavText}</span>

            <div className={styles.topNavSpacer} />
          </div>

          <div className={styles.content}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}