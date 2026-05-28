import React, { useState, useRef, useEffect, useCallback } from 'react'
import styles from '../agent-detail.module.css'
import { runAgentStream } from '../../../api/agent-runtime'
import type { RuntimeEvent, MessageDeltaEvent } from '../../../api/agent-runtime'
import type { OpeningConfig } from '../agent-detail'
import { deleteConversation, getConversation, getConversations } from '../../../api/homepage'

interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'agent'
  time: string
}

interface Props {
  agentId: string
  agentName: string
  avatar: string
  persona: string
  model: string
  temperature: number
  openingConfig: OpeningConfig
}

export function PreviewChat({ agentId, avatar, persona, model, temperature, openingConfig }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [sending, setSending] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const sendingRef = useRef(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  useEffect(() => {
    let active = true

    setMessages([])
    setConversationId(null)
    sendingRef.current = false
    setSending(false)
    abortRef.current?.abort()
    abortRef.current = null

    getConversations(agentId, { preview: true })
      .then(async (list) => {
        const latest = list[0]
        if (!active || !latest) return

        const detail = await getConversation(latest.id)
        if (!active || !detail) return

        setConversationId(detail.id)
        setMessages(
          detail.messages
            .filter((message) => message.role === 'USER' || message.role === 'ASSISTANT')
            .map((message) => ({
              id: message.id,
              text: message.content,
              sender: message.role === 'USER' ? 'user' : 'agent',
              time: new Date(message.createdAt).toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
              }),
            })),
        )
      })
      .catch(() => {
        if (active) {
          setMessages([])
          setConversationId(null)
        }
      })

    return () => {
      active = false
    }
  }, [agentId])

  const doSend = useCallback((text: string) => {
    if (sendingRef.current) return

    const now = new Date()
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      text,
      sender: 'user',
      time: timeStr,
    }

    const agentMsgId = `agent-${Date.now()}`
    const agentMsg: ChatMessage = {
      id: agentMsgId,
      text: '',
      sender: 'agent',
      time: timeStr,
    }

    setMessages((prev) => [...prev, userMsg, agentMsg])
    setInputValue('')
    sendingRef.current = true
    setSending(true)

    runAgentStream(
      {
        agentId,
        message: text,
        conversationId: conversationId ?? undefined,
        preview: true,
        model: model || undefined,
        systemPrompt: persona || undefined,
        temperature,
      },
      {
        onEvent: (event: RuntimeEvent) => {
          switch (event.type) {
            case 'run.created':
              setConversationId(event.conversationId)
              break

            case 'message.delta':
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === agentMsgId ? { ...m, text: m.text + (event as MessageDeltaEvent).content } : m
                )
              )
              break

            case 'message.completed':
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === agentMsgId
                    ? { ...m, text: event.content, id: event.messageId }
                    : m
                )
              )
              sendingRef.current = false
              setSending(false)
              abortRef.current = null
              break

            case 'run.completed':
            case 'stream.done':
              sendingRef.current = false
              setSending(false)
              abortRef.current = null
              break

            case 'run.failed':
              sendingRef.current = false
              setSending(false)
              abortRef.current = null
              break

            case 'run.in_progress':
            case 'tool.call.created':
            case 'tool.call.completed':
              break

            default:
              break
          }
        },
        onError: () => {
          sendingRef.current = false
          setSending(false)
          abortRef.current = null
        },
      },
    ).then((controller) => {
      abortRef.current = controller
    })
  }, [agentId, conversationId, persona, model, temperature])

  const handleClear = useCallback(async () => {
    abortRef.current?.abort()
    abortRef.current = null
    sendingRef.current = false
    setSending(false)
    setMessages([])
    setInputValue('')

    const currentConversationId = conversationId
    setConversationId(null)

    if (currentConversationId) {
      await deleteConversation(currentConversationId)
    }
  }, [conversationId])

  const handleSend = useCallback(() => {
    const text = inputValue.trim()
    if (!text) return
    doSend(text)
  }, [inputValue, doSend])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend()
    }
  }

  return (
    <div className={styles.previewBox}>
      <div className={styles.previewToolbar}>
        <span className={styles.previewToolbarText}>预览会话</span>
        <button
          className={styles.previewClearBtn}
          type="button"
          onClick={handleClear}
          disabled={messages.length === 0 && !conversationId}
        >
          清除
        </button>
      </div>
      <div className={styles.previewChat}>
        {openingConfig.openingMessage && messages.length === 0 && (
          <div className={styles.previewBubble}>
            <img src={avatar} alt="" className={styles.previewAvatarSmall} />
            <div>
              <div className={styles.previewMsg}>{openingConfig.openingMessage}</div>
            </div>
          </div>
        )}

        {openingConfig.openingQuestionsEnabled &&
          openingConfig.openingQuestions.length > 0 &&
          messages.length === 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingLeft: 38, marginBottom: 12 }}>
              {openingConfig.openingQuestions.map((q, i) => (
                <span
                  key={i}
                  onClick={() => doSend(q)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 14,
                    border: '1px solid rgba(104,119,144,0.15)',
                    fontSize: 12,
                    color: '#506070',
                    cursor: 'pointer',
                    background: '#fff',
                  }}
                >
                  {q}
                </span>
              ))}
            </div>
          )}

        {messages.map((msg) =>
          msg.sender === 'user' ? (
            <div key={msg.id} className={`${styles.previewBubble} ${styles.previewBubbleUser}`}>
              <div>
                <div className={styles.previewMsg}>{msg.text}</div>
                <div className={styles.previewMeta}><span>{msg.time}</span></div>
              </div>
            </div>
          ) : (
            <div key={msg.id} className={styles.previewBubble}>
              <img src={avatar} alt="" className={styles.previewAvatarSmall} />
              <div>
                <div className={styles.previewMsg}>
                  {msg.text || (sending ? '思考中...' : '无法获取回复')}
                </div>
                <div className={styles.previewMeta}><span>{msg.time}</span></div>
              </div>
            </div>
          )
        )}
        <div ref={chatEndRef} />
      </div>

      <div className={styles.previewInputRow}>
        <input
          className={styles.previewInput}
          placeholder="输入消息..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sending}
        />
        <button
          className={styles.previewSendBtn}
          onClick={handleSend}
          disabled={sending}
          style={{ opacity: sending ? 0.5 : 1, cursor: sending ? 'not-allowed' : 'pointer' }}
        >
          {sending ? '等待...' : '发送'}
        </button>
      </div>
    </div>
  )
}
