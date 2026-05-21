import { Outlet } from 'react-router-dom'
import styles from './index.module.css'
import { useState, useEffect, useRef, useCallback } from 'react'


interface AgentConfig {
  name: string
  description: string
  systemPrompt: string
  model: string
  maxTokens: number
}

interface SavedAgent extends AgentConfig {
  id: string
}

const defaultConfig: AgentConfig = {
  name: '',
  description: '',
  systemPrompt: '',
  model: 'gpt-4o',
  maxTokens: 2048,
}

const modelOption = [
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  { value: 'claude-3-opus', label: 'Claude 3 Opus' },
  { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
  { value: 'deepseek-v4-pro', label: 'deepseek-v4-pro'},
  { value: 'deepseek-v4-flash', label: 'deepseek-v4-flash'},
  { value: 'doubao-seed-2.0-pro', label: 'doubao-seed-2.0-pro'},
]

const STORAGE_KEY = 'agent-config'

function loadAgentList(): SavedAgent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed.filter((a: { id?: string }) => a?.id && typeof a.id === 'string')
    }
    if (parsed?.id && parsed?.name) {
      return [{ ...defaultConfig, ...parsed } as SavedAgent]
    }
  } catch { /* corrupt data */ }
  return []
}

function saveAgentList(list: SavedAgent[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

export const AgentConfigIndex = () => {

  const [agentList, setAgentList] = useState<SavedAgent[]>(() => loadAgentList())
  const [config, setConfig] = useState<AgentConfig>({ ...defaultConfig })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const handleNewAgent = useCallback(() => {
    if (editingId && !isCreating) {
      setAgentList((prev) => {
        const updated = prev.map((a) =>
          a.id === editingId ? { ...a, ...config } as SavedAgent : a
        )
        saveAgentList(updated)
        return updated
      })
    }
    setConfig({ ...defaultConfig })
    setEditingId(null)
    setIsCreating(true)
    setErrors({})
    setSaved(false)
  }, [editingId, isCreating, config])

  const handleCreateAgent = useCallback(() => {
    const newErrors: Record<string, string> = {}
    if (!config.name.trim()) newErrors.name = '请输入智能体名称'
    if (!config.systemPrompt.trim()) newErrors.systemPrompt = '请输入角色提示词'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    const newAgent: SavedAgent = {
      ...config,
      id: generateId(),
    }
    setAgentList((prev) => {
      const updated = [...prev, newAgent]
      saveAgentList(updated)
      return updated
    })
    setEditingId(newAgent.id)
    setIsCreating(false)
    setErrors({})
    setSaved(true)
    clearTimeout(savedTimerRef.current)
    savedTimerRef.current = setTimeout(() => setSaved(false), 2000)
  }, [config])

  const handleSelectAgent = useCallback((agent: SavedAgent) => {
    if (editingId) {
      setAgentList((prev) => {
        const updated = prev.map((a) =>
          a.id === editingId ? { ...a, ...config } as SavedAgent : a
        )
        saveAgentList(updated)
        return updated
      })
    }
    setConfig({
      name: agent.name,
      description: agent.description,
      systemPrompt: agent.systemPrompt,
      model: agent.model,
      maxTokens: agent.maxTokens,
    })
    setEditingId(agent.id)
    setIsCreating(false)
    setErrors({})
    setSaved(false)
  }, [editingId, config])

  const handleDeleteAgent = useCallback((id: string) => {
    setAgentList((prev) => {
      const updated = prev.filter((a) => a.id !== id)
      saveAgentList(updated)
      return updated
    })
    if (editingId === id) {
      setEditingId(null)
      setConfig({ ...defaultConfig })
      setErrors({})
      setSaved(false)
    }
  }, [editingId])

  const handleChange = useCallback(
    (field: keyof AgentConfig) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const raw = e.target.value
        const value = field === 'maxTokens' ? Number(raw) : raw
        setConfig((prev) => ({ ...prev, [field]: value }))
        setErrors((prev) => {
          if (!(field in prev)) return prev
          const next = { ...prev }
          delete next[field]
          return next
        })
        setSaved(false)
      },
    [],
  )

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (!editingId || isCreating) return

    clearTimeout(saveTimerRef.current)

    saveTimerRef.current = setTimeout(() => {
      setAgentList((prev) => {
        const updated = prev.map((a) =>
          a.id === editingId ? { ...a, ...config } as SavedAgent : a
        )
        saveAgentList(updated)
        return updated
      })
      setSaved(true)
      clearTimeout(savedTimerRef.current)
      savedTimerRef.current = setTimeout(() => setSaved(false), 2000)
    }, 600)

    return () => {
      clearTimeout(saveTimerRef.current)
    }
  }, [config, editingId, isCreating])

  return (
    <div className={styles.windowBox}>
      <div className={styles.leftHistory}>
        <aside className={styles.agentListPanel}>
          <button className={styles.newAgentBtn} onClick={handleNewAgent}>
            + 新建智能体
          </button>
          <div className={styles.agentListScroll}>
            {agentList.length === 0 ? (
              <p className={styles.agentListEmpty}>暂无智能体</p>
            ) : (
              agentList.map((agent) => (
                <div
                  key={agent.id}
                  className={`${styles.agentListItem} ${editingId === agent.id ? styles.agentListItemActive : ''}`}
                  onClick={() => handleSelectAgent(agent)}
                >
                  <span className={styles.agentListItemName}>{agent.name || '未命名智能体'}</span>
                  <button
                    className={styles.agentListItemDelete}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteAgent(agent.id)
                    }}
                    aria-label="删除智能体"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
      <div className={styles.rightAgent}>
        <h1 className={styles.pageTitle}>智能体配置</h1>
        <p className={styles.pageNextTitle}>创建和管理你的AI智能体</p>
        {saved && <span className={styles.savedFeedback}>保存成功</span>}
        <div className={styles.formContent}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              智能体名称<span className={styles.formRequired}>*</span>
            </label>
            <input
              type="text"
              className={`${styles.formInput} ${errors.name ? styles.formInputError : ''}`}
              placeholder="请输入智能体名称"
              value={config.name}
              onChange={handleChange('name')}
            />
            {errors.name && <span className={styles.formError}>{errors.name}</span>}
          </div>
          <div className={styles.formDescribe}>
            <label className={styles.formLabel}>描述</label>
            <input
              type="text"
              className={styles.formInput}
              placeholder="简要描述智能体的功能"
              value={config.description}
              onChange={handleChange('description')}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              角色提示词<span className={styles.formRequired}>*</span>
            </label>
            <textarea
              className={`${styles.formTextarea} ${errors.systemPrompt ? styles.formTextareaError : ''}`}
              placeholder="定义智能体的角色、能力和行为规范"
              value={config.systemPrompt}
              onChange={handleChange('systemPrompt')}
            />
            {errors.systemPrompt && <span className={styles.formError}>{errors.systemPrompt}</span>}
          </div>
          <div className={styles.formSelectBox}>
            <label className={styles.formLabel}>
              模型选择<span className={styles.formRequired}>*</span>
            </label>
            <select
              className={styles.formSelect}
              value={config.model}
              onChange={handleChange('model')}
            >
              {modelOption.map((mdo) => (
                <option value={mdo.value} key={mdo.value}>
                  {mdo.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formTool}>
            <label className={styles.formLabel}>工具-MCP</label>
            <div className={styles.formDescribeBox}>
              <h4>什么是MCP Servers?</h4>
              <p>Model Context Protocol允许大语言模型访问自定义工具和服务。MCP Servers是支持该协议的服务，提供工具和功能来拓展智能体的能力。添加后，智能体会自动调用合适的工具完成任务。</p>
              <button className={styles.formToolButton}>添加MCP Servers</button>
            </div>
          </div>
          {isCreating && (
            <button className={styles.formCreate} onClick={handleCreateAgent}>
              创建智能体
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export const AgentConfigPage = () => {
  return (
      <div className={styles.content}>
         <Outlet/>
      </div>
  );
}
