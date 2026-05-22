import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState, useMemo } from 'react'
import { Select, Input, Button, Tag, Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import { PaperClipOutlined, SendOutlined, CloseOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons'
import { getCurrentUser } from '../../api/auth/auth-store';
import { logout } from '../../api/auth';
import styles from './index.module.css'

interface Message {
  id: string
  text: string
  timestamp: string
  sender: 'user' | 'agent'
  fileName?: string
  filePreview?: string
  fileIsImage?: boolean
  agentName?: string
  agentIcon?: string
}

const AgentItems = [
  {id:'',name:'默认智能体',icon:''},
  {id:'',name:'代码助手',icon:''},
  {id:'',name:'文档助手',icon:''},
]

const MenuItems = [
  { title: 'minicoze', path: '/homepage', desc: '点击进入Ai智能聊天界面' },
  { title: '创建智能体', path: '/homepage/agent-config', desc: '点击进入智能体配置界面' },
  { title: '创建工作流', path: '/workflow-canvas', desc: '点击进入工作流配置界面' },
  { title: '创建知识库', path: '/knowledge-base', desc: '点击进入知识库配置界面' },
]

const TopNavText = 'MiniCoze AI Agent控制平台'
const PlaceholderText = '搜索功能待开发，敬请期待...'
const NavPlaceholderText = '请输入指令...'

function getAllAgents() {
  try {
    const raw = localStorage.getItem('agent-config')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        const customAgents = parsed
          .filter((a: { name?: string }) => a?.name?.trim?.())
          .map((a: { id?: string; name: string; icon?: string }) => ({
            id: String(a.id ?? ''),
            name: a.name,
            icon: a.icon ?? '',
          }))
        return [...AgentItems, ...customAgents]
      }
      if (parsed?.name?.trim?.()) {
        return [...AgentItems, { id: String(parsed.id ?? ''), name: parsed.name, icon: '' }]
      }
    }
  } catch { /* ignore parse error */ }
  return AgentItems
}

function formatFileSize(bytes:number):string{
  if(bytes < 1024 ) return `${bytes} B`
  if(bytes < 1024 * 1024 ) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export const HomepageIndex = () => {

  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [selectedFile,setSelectedFile] = useState<{file:File; preview:string;isImage:boolean;size:string} | null>(null)
  const allAgents = useMemo(() => getAllAgents(), [])
  const [selectedAgent, setSelectedAgent] = useState(() => getAllAgents()[0])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() =>{
    return () =>{
      if(selectedFile?.preview){
        URL.revokeObjectURL(selectedFile.preview)
      }
    }
  },[selectedFile])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    const text = inputValue.trim()
    if(!text) return

    const now = new Date()
    const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

    const newMessage: Message = {
      id: Date.now().toString(),
      text:text || '附带文件',
      timestamp,
      sender: 'user',
      agentName: selectedAgent.id !== '' ? selectedAgent.name : undefined,
    }

    if(selectedFile){
      newMessage.fileName = selectedFile.file.name
      newMessage.filePreview = selectedFile.preview
      newMessage.fileIsImage = selectedFile.isImage
    }
    
    setMessages((prev) => [...prev, newMessage])
    setInputValue('')
    handleFileRemove()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      sendMessage()
    }
  }

  const handleFileChange = (e:React.ChangeEvent<HTMLInputElement>) =>{
    const file = e.target.files?.[0]
    if(!file) return

    const isImage = file.type.startsWith('image/')
    const preview = isImage ? URL.createObjectURL(file) : ''
    const size = formatFileSize(file.size)

    setSelectedFile({file,preview,isImage,size})

    if(fileInputRef.current){
      fileInputRef.current.value = ''
    }
  }

  const handleFileRemove = () =>{
    if(selectedFile?.preview){
      URL.revokeObjectURL(selectedFile.preview)
    }

    setSelectedFile(null)

  }

  return (
    <div className={styles.windowBox}>
      <div className={styles.centerChat}>
        {messages.length === 0 ? (
          <span className={styles.chatPlaceholder}>准备大干一场吧</span>
        ) : (
          <div className={styles.chatMessageList}>
            {messages.map((item) => {
              const isUser = item.sender === 'user'
              return (
                <div key={item.id} className={`${styles.chatMessage} ${isUser ? styles.userRow : styles.agentRow}`}>
                  <div className={`${styles.messageContent} ${isUser ? styles.userBubble : styles.agentBubble}`}>

                    <span className={styles.messageText}>{item.text}</span>
                    {
                      item.fileName && item.filePreview && item.fileIsImage && (
                        <img src={item.filePreview} alt={item.fileName} className={styles.messageFile} />
                      )
                    }
                    {
                      item.fileName && !item.fileIsImage && (
                        <Tag className={styles.messageFileTag}>{item.fileName}</Tag>
                      )
                    }
                  </div>
                  <span className={styles.messageTime}>{item.timestamp}</span>
                </div>
              )
            })}
          <div ref={chatEndRef}/>
          </div>
        )}
      </div>
      <div className={styles.lefrSelect}>
        <Select
          className={styles.agentSelect}
          value={selectedAgent.id || undefined}
          onChange={(value) => {
            const agent = allAgents.find((a) => a.id === value)
            if (agent) setSelectedAgent(agent)
          }}
          options={allAgents.map((agt) => ({ value: agt.id, label: agt.name }))}
        />
      </div>
      <div className={styles.centerInput}>
        {selectedFile && (
                <div className={styles.filePreviewBar}>
                    {selectedFile.isImage ? (
                      <img src={selectedFile.preview} alt={selectedFile.file.name} className={styles.filePreviewThumb} />
                    ) : (
                      <span className={styles.docIcon}>📄</span>
                    )}
                    <div className={styles.filePreviewInfo}>
                      <span className={styles.filePreviewName}>{selectedFile.file.name}</span>
                      <span className={styles.filePreviewSize}>{selectedFile.size}</span>
                    </div>
                    <Button
                      icon={<CloseOutlined />}
                      size="small"
                      type="text"
                      danger
                      onClick={handleFileRemove}
                      aria-label="删除文件"
                    />
                  </div>
                )}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/png,image/jpg,image/jpeg,image/gif,image/webp,.pdf,.doc,.docx,.txt,.xlsx,.pptx"
          style={{display:'none'}}
          onChange={handleFileChange} />
        <div className={styles.inputRow}>
          <Button
            icon={<PaperClipOutlined />}
            type="text"
            onClick={() => fileInputRef.current?.click()}
            aria-label="文件上传"
          />
          <Input
            placeholder={NavPlaceholderText}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            variant="borderless"
          />
          <Button
            icon={<SendOutlined />}
            type="primary"
            shape="circle"
            onClick={sendMessage}
            aria-label="发送信息"
          />
        </div>
      </div>
    </div>
  )
}

export const Homepage = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const dropdownItems: MenuProps['items'] = [
    {
      key: 'username',
      label: user?.username ?? '用户',
      icon: <UserOutlined />,
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      logout();
      navigate('/login');
    }
  };

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
