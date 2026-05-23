import { useEffect, useRef, useState } from 'react'
import { Select, Input, Button, Tag } from 'antd'
import { PaperClipOutlined, SendOutlined, CloseOutlined, PlusOutlined, MessageOutlined, DeleteOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import styles from './home.module.css'
import { createConversation, getConversations, getConversation, deleteConversation, sendMessageStream } from '../../api/homepage'
import type { Conversation } from '../../api/homepage'

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
  {id:'1',name:'默认智能体',icon:''},
  {id:'2',name:'代码助手',icon:''},
  {id:'3',name:'文档助手',icon:''},
]

const NavPlaceholderText = '请输入指令...'

function getAllAgents() {
  try {
    const raw = localStorage.getItem('agent-config')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        const hardcodedIds = new Set(AgentItems.map((a) => a.id))
        const customAgents = parsed
          .filter((a: any) => a?.name?.trim?.() && !hardcodedIds.has(String(a.id ?? '')))
          .map((a: any) => ({
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
  } catch {  }
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
  const [allAgents] = useState(() => getAllAgents())
  const [selectedAgent, setSelectedAgent] = useState(allAgents[0])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [historyOpen, setHistoryOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadConversations = () => {
    getConversations().then((data) => {
      if (Array.isArray(data)) setConversations(data)
    }).catch(console.error)
  }

  useEffect(() => {
    loadConversations()
  }, [])

  const handleNewChat = () => {
    setConversationId(null)
    setMessages([])
    setSending(false)
  }

  const handleSelectConversation = async (convId: string) => {
    if (convId === conversationId) return
    setConversationId(convId)
    setMessages([])
    try {
      const detail = await getConversation(convId)
      const msgs: Message[] = detail.messages.map((m) => ({
        id: m.id,
        text: m.content,
        timestamp: new Date(m.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        sender: m.role === 'user' ? 'user' : 'agent',
        agentName: m.role === 'assistant' ? detail.agentName : undefined,
      }))
      setMessages(msgs)
    } catch (e) {
      console.error(e)
    }
  }

  const handleDeleteConversation = async (e: React.MouseEvent, convId: string) => {
    e.stopPropagation()
    try {
      await deleteConversation(convId)
      if (convId === conversationId) {
        setConversationId(null)
        setMessages([])
      }
      loadConversations()
    } catch (err) {
      console.error(err)
    }
  }

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

  const sendMessage = async () => {
    const text = inputValue.trim()
    if (!text || sending) return

    const now = new Date()
    const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

    const newMessage: Message = {
      id: Date.now().toString(),
      text: text || '附带文件',
      timestamp,
      sender: 'user',
      agentName: selectedAgent.id !== '' ? selectedAgent.name : undefined,
    }

    if (selectedFile) {
      newMessage.fileName = selectedFile.file.name
      newMessage.filePreview = selectedFile.preview
      newMessage.fileIsImage = selectedFile.isImage
    }

    const agentMsgId = `agent-${Date.now()}`
    const agentMsg: Message = {
      id: agentMsgId,
      text: '',
      timestamp: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
      sender: 'agent',
      agentName: selectedAgent.name,
    }

    setMessages((prev) => [...prev, newMessage, agentMsg])
    setInputValue('')
    handleFileRemove()
    setSending(true)

    try {
      let convId = conversationId
      if (!convId) {
        const conv = await createConversation(selectedAgent.id)
        convId = conv.id
        setConversationId(convId)
        loadConversations()
      }

      sendMessageStream(
        convId,
        text,
        (chunk) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === agentMsgId ? { ...m, text: m.text + chunk } : m))
          )
        },
        () => {
          setSending(false)
          loadConversations()
        },
        (err) => {
          console.error(err)
          setSending(false)
        },
      )
    } catch (e) {
      console.error(e)
      setSending(false)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
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
      <div className={`${styles.historyPanel} ${historyOpen ? styles.historyPanelOpen : ''}`}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleNewChat}
          className={styles.newChatBtn}
        >
          新对话
        </Button>
        <div className={styles.historyList}>
          {conversations.length === 0 ? (
            <span className={styles.historyEmpty}>暂无历史对话</span>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`${styles.historyItem} ${conv.id === conversationId ? styles.historyItemActive : ''}`}
                onClick={() => handleSelectConversation(conv.id)}
              >
                <MessageOutlined className={styles.historyItemIcon} />
                <div className={styles.historyItemContent}>
                  <span className={styles.historyItemTitle}>{conv.title || '新对话'}</span>
                  <span className={styles.historyItemAgent}>{conv.agentName || ''}</span>
                </div>
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  className={styles.historyItemDelete}
                  onClick={(e) => handleDeleteConversation(e, conv.id)}
                  aria-label="删除对话"
                />
              </div>
            ))
          )}
        </div>
      </div>
      <div className={styles.chatPanel}>
        <div className={styles.chatTopBar}>
          <Button
            type="text"
            icon={historyOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
            onClick={() => setHistoryOpen(!historyOpen)}
            className={styles.toggleBtn}
            aria-label="切换历史面板"
          />
        </div>
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
            value={selectedAgent.id}
            onChange={(value) => {
              const agent = allAgents.find((a) => a.id === String(value))
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
            <Input.TextArea
              placeholder={NavPlaceholderText}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              autoSize={{ minRows: 1, maxRows: 6 }}
              variant="borderless"
            />
            <Button
              icon={<SendOutlined />}
              type="primary"
              shape="circle"
              onClick={sendMessage}
              loading={sending}
              disabled={sending}
              aria-label="发送信息"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
