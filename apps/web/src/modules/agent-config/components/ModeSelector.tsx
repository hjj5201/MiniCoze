import React, { useState, useRef, useEffect, useCallback } from 'react'
import styles from './ModeSelector.module.css'
import type { AgentMode } from '../agent-detail'

export interface ModeOption {
  key: AgentMode
  name: string
  description: string
  icon: React.ReactNode
}

interface Props {
  currentMode: AgentMode
  modes: ModeOption[]
  onModeChange: (mode: AgentMode) => void
}

// 各模式对应的图标（16x16 灰色线性图标）
const ModeIcons: Record<AgentMode, React.ReactNode> = {
  chat: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <text x="8" y="11.5" textAnchor="middle" fill="currentColor" fontSize="9" fontWeight="600">1</text>
    </svg>
  ),
  single: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="4" height="3" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="10" y="3" width="4" height="3" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="2" y="10" width="4" height="3" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="10" y="10" width="4" height="3" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <line x1="6" y1="4.5" x2="10" y2="4.5" stroke="currentColor" strokeWidth="1" />
      <line x1="4" y1="7.5" x2="4" y2="10" stroke="currentColor" strokeWidth="1" />
      <line x1="12" y1="7.5" x2="12" y2="10" stroke="currentColor" strokeWidth="1" />
    </svg>
  ),
  multi: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <polygon points="8,1 14,4.5 14,11.5 8,15 2,11.5 2,4.5" stroke="currentColor" strokeWidth="1.3" fill="none" />
      <polygon points="8,5 11,6.8 11,10.2 8,12 5,10.2 5,6.8" stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
  ),
}

// 触发按钮内对应的简短名称
const ModeShortLabels: Record<AgentMode, string> = {
  chat: '单 Agent（自主规划模式）',
  single: '单 Agent（对话流模式）',
  multi: '多 Agents',
}

export function ModeSelector({ currentMode, modes, onModeChange }: Props) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setOpen(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, handleClickOutside])

  const handleSelect = useCallback(
    (key: AgentMode) => {
      onModeChange(key)
      setOpen(false)
    },
    [onModeChange],
  )

  return (
    <div className={styles.container} ref={containerRef}>
      {/* 触发按钮 */}
      <button
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <span className={styles.triggerIcon}>
          {ModeIcons[currentMode]}
        </span>
        <span className={styles.triggerLabel}>
          {ModeShortLabels[currentMode]}
        </span>
        <span className={`${styles.triggerArrow} ${open ? styles.triggerArrowOpen : ''}`}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {/* 下拉菜单 */}
      {open && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownTitle}>选择模式</div>
          {modes.map((opt) => (
            <button
              key={opt.key}
              className={`${styles.option} ${currentMode === opt.key ? styles.optionSelected : ''}`}
              onClick={() => handleSelect(opt.key)}
              type="button"
            >
              <span className={styles.optionIcon}>
                {opt.icon || ModeIcons[opt.key]}
              </span>
              <div className={styles.optionText}>
                <span className={styles.optionName}>{opt.name}</span>
                <span className={styles.optionDesc}>{opt.description}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}