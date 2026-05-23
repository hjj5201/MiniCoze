import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Input, Dropdown, Button } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { getCurrentUser } from '../../api/auth/auth-store'
import { logout } from '../../api/auth'
import styles from './index.module.css'

const MenuItems = [
  { title: 'minicoze', path: '/homepage', desc: '点击进入Ai智能聊天界面' },
  { title: '创建智能体', path: '/homepage/agent-config', desc: '点击进入智能体配置界面' },
  { title: '创建工作流', path: '/homepage/workflow-canvas', desc: '点击进入工作流配置界面' },
  { title: '创建知识库', path: '/homepage/knowledge-base', desc: '点击进入知识库配置界面' },
]

const TopNavText = 'MiniCoze AI Agent控制平台'
const PlaceholderText = '搜索功能待开发，敬请期待...'

const dropdownItems = [
  { key: 'logout', label: '退出登录' },
]

export const Homepage = () => {
  const navigate = useNavigate()
  const user = getCurrentUser()

  const handleMenuClick = (e: { key: string }) => {
    if (e.key === 'logout') {
      logout()
      navigate('/login')
    }
  }

  return (
    <div className={styles.homepageBox}>
      <div className={styles.centerBox}>
        {/* 侧边栏 */}
        <aside className={styles.sidebarPanel}>
          <div className={styles.sidebar}>
            <span className={styles.icon}>MC</span>
            <span className={styles.title}>minicoze</span>
          </div>
          <nav className={styles.leftNav}>
            {MenuItems.map((item) => (
              <NavLink
                to={item.path}
                key={item.title}
                className={styles.navLink}
              >
                <div className={styles.navText}>
                  <span className={styles.navTitle}>{item.title}</span>
                  <span className={styles.navDesc}>{item.desc}</span>
                </div>
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className={styles.consoleMain}>
          <div className={styles.topNav}>
            <Input.Search
              placeholder={PlaceholderText}
              className={styles.searchPanel}
              onSearch={() => {}}
            />
            <span>{TopNavText}</span>
            <div className={styles.topNavSpacer} />
            <Dropdown menu={{ items: dropdownItems, onClick: handleMenuClick }} placement="bottomRight">
              <Button
                type="text"
                className={styles.userBtn}
                icon={<UserOutlined />}
              >
                {user?.username ?? '用户'}
              </Button>
            </Dropdown>
          </div>
          <div className={styles.content}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
