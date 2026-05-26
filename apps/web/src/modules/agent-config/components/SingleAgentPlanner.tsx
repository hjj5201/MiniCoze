import React, { useState, useCallback } from 'react'
import styles from '../agent-detail.module.css'
import type { AgentDetailData, PlannerConfig, OpeningConfig } from '../agent-detail'
import { OpeningMessageEditor } from './OpeningMessageEditor'
import { PreviewChat } from './PreviewChat'

interface Props {
  agent: AgentDetailData
  persona: string
  setPersona: (v: string) => void
  model: string
  onModelChange: (v: string) => void
  config: PlannerConfig
  onConfigChange: (config: PlannerConfig) => void
  openingConfig: OpeningConfig
  onOpeningChange: (config: OpeningConfig) => void
}

const MODEL_OPTIONS = [
  { label: 'GPT-4o mini', value: 'gpt-4o-mini' },
  { label: 'GPT-4o', value: 'gpt-4o' },
  { label: 'DeepSeek Chat', value: 'deepseek-chat' },
  { label: 'DeepSeek Reasoner', value: 'deepseek-reasoner' },
]

const DEFAULT_KNOWLEDGE_NAME = '知识库'

function CollapsePanel({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={styles.collapsePanel}>
      <div className={styles.collapseHeader} onClick={() => setOpen(!open)}>
        <span className={styles.collapseTitle}>{title}</span>
        <span className={`${styles.collapseArrow} ${open ? styles.collapseArrowOpen : ''}`}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
      {open && <div className={styles.collapseContent}>{children}</div>}
    </div>
  )
}

export function SingleAgentPlanner({ agent, persona, setPersona, model, onModelChange, config, onConfigChange, openingConfig, onOpeningChange }: Props) {
  const [modelOpen, setModelOpen] = useState(false)

  const { knowledgeEnabled, autoInvoke, plugins, workflows } = config

  const updateConfig = useCallback(
    (patch: Partial<PlannerConfig>) => onConfigChange({ ...config, ...patch }),
    [config, onConfigChange],
  )

  const handleAddPlugin = () => {
    updateConfig({ plugins: [...plugins, `插件 ${plugins.length + 1}`] })
  }

  const handleAddWorkflow = () => {
    updateConfig({ workflows: [...workflows, `工作流 ${workflows.length + 1}`] })
  }

  return (
    <>
      {/* 左侧栏：人设与回复逻辑 */}
      <div className={styles.col} style={{ flex: '0 0 340px', minWidth: 280 }}>
        <div className={styles.colHeader}>
          <h3 className={styles.colTitle}>人设与回复逻辑</h3>
          <div className={styles.colToolbar}>
            <button className={styles.toolbarBtn} title="编辑">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 10.5V12H3.5L10.35 5.15L8.85 3.65L2 10.5Z" fill="currentColor" />
                <path d="M11.5 2.5L11.3 2.3C11.1 2.1 10.9 2 10.7 2C10.5 2 10.3 2.1 10.1 2.3L9.15 3.25L10.75 4.85L11.7 3.9C12.1 3.5 12.1 2.9 11.7 2.5H11.5Z" fill="currentColor" />
              </svg>
            </button>
            <button className={styles.toolbarBtn} title="清空">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 4H12M5 4V2.5C5 2.22386 5.22386 2 5.5 2H8.5C8.77614 2 9 2.22386 9 2.5V4M11 4V12C11 12.5523 10.5523 13 10 13H4C3.44772 13 3 12.5523 3 12V4H11Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button className={styles.toolbarBtn} title="格式刷">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 12L5 9L9 13L6.5 13.5L2 12Z" fill="currentColor" opacity="0.3" />
                <rect x="3" y="1" width="8" height="8" rx="1" transform="rotate(-45 7 5)" stroke="currentColor" strokeWidth="1.2" fill="none" />
              </svg>
            </button>
            <button className={styles.toolbarBtn} title="收藏">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L9 5.5L14 6L10.5 9.5L11.5 14.5L7 12L2.5 14.5L3.5 9.5L0 6L5 5.5L7 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
        <div className={styles.colBody}>
          <textarea
            className={styles.panelTextarea}
            placeholder={`例如：\n你是一个专业的客服助手，名叫${agent.name}。你需要：\n1. 始终保持礼貌和耐心\n2. 用简洁清晰的语言回复\n3. 遇到无法解决的问题时，引导用户提供更多信息`}
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            rows={20}
            style={{ height: '100%', minHeight: 300 }}
          />
          <span className={styles.charCount}>{persona.length} 字</span>
        </div>
      </div>

      {/* 中间栏：编排 */}
      <div className={styles.col} style={{ flex: '0 0 340px', minWidth: 280 }}>
        <div className={styles.colHeader}>
          <h3 className={styles.colTitle}>编排</h3>
        </div>
        <div className={styles.colBody}>
          <CollapsePanel title="模型设置">
            <div className={styles.modelSelector}>
              <div
                className={styles.modelTrigger}
                onClick={() => setModelOpen((v) => !v)}
              >
                <span className={styles.modelIcon}>🧠</span>
                <span className={styles.modelName}>{MODEL_OPTIONS.find(m => m.value === model)?.label ?? model}</span>
                <span className={`${styles.modelArrow} ${modelOpen ? styles.modelArrowOpen : ''}`}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2.5 3.5L5 6.5L7.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
              {modelOpen && (
                <div className={styles.modelDropdown}>
                  {MODEL_OPTIONS.map((m) => (
                    <button
                      key={m.value}
                      className={`${styles.modelOption} ${m.value === model ? styles.modelOptionActive : ''}`}
                      onClick={() => {
                        onModelChange(m.value)
                        updateConfig({ selectedModel: m.value })
                        setModelOpen(false)
                      }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CollapsePanel>

          <CollapsePanel title="技能">
            <div className={styles.configRow}>
              <div className={styles.configRowInfo}>
                <span className={styles.configRowIcon}>🔌</span>
                <div className={styles.configRowText}>
                  <span className={styles.configRowName}>插件</span>
                  <span className={styles.configRowDesc}>添加 AI 能力插件</span>
                </div>
              </div>
              <div className={styles.configRowRight}>
                {plugins.length > 0 && (
                  <span className={styles.configRowCount}>{plugins.length} 个插件</span>
                )}
                <button className={styles.addBtn} onClick={handleAddPlugin}>
                  <span>+</span>
                </button>
              </div>
            </div>
            <div className={styles.configRow}>
              <div className={styles.configRowInfo}>
                <span className={styles.configRowIcon}>⚡</span>
                <div className={styles.configRowText}>
                  <span className={styles.configRowName}>工作流</span>
                  <span className={styles.configRowDesc}>配置对话流程</span>
                </div>
              </div>
              <div className={styles.configRowRight}>
                {workflows.length > 0 && (
                  <span className={styles.configRowCount}>{workflows.length} 个工作流</span>
                )}
                <button className={styles.addBtn} onClick={handleAddWorkflow}>
                  <span>+</span>
                </button>
              </div>
            </div>
          </CollapsePanel>

          <CollapsePanel title="知识">
            <div className={styles.configRow}>
              <div className={styles.configRowInfo}>
                <span className={styles.configRowIcon}>📚</span>
                <div className={styles.configRowText}>
                  <span className={styles.configRowName}>文本知识库</span>
                </div>
              </div>
              <div className={styles.configRowRight}>
                <span style={{ fontSize: 12, color: '#8896a6' }}>{DEFAULT_KNOWLEDGE_NAME}</span>
              </div>
            </div>
            <div className={styles.configRow}>
              <div className={styles.configRowInfo}>
                <span className={styles.configRowIcon}>📊</span>
                <div className={styles.configRowText}>
                  <span className={styles.configRowName}>表格知识库</span>
                </div>
              </div>
              <div className={styles.configRowRight}>
                <label className={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    checked={knowledgeEnabled}
                    onChange={(e) => updateConfig({ knowledgeEnabled: e.target.checked })}
                  />
                  <span className={styles.toggleSlider} />
                </label>
              </div>
            </div>
            <div className={styles.configRow}>
              <div className={styles.configRowInfo}>
                <span className={styles.configRowIcon}>🖼️</span>
                <div className={styles.configRowText}>
                  <span className={styles.configRowName}>照片知识库</span>
                </div>
              </div>
              <div className={styles.configRowRight}>
                <button className={styles.addBtn}><span>+</span></button>
              </div>
            </div>
          </CollapsePanel>

          <CollapsePanel title="记忆">
            <div className={styles.configRow}>
              <div className={styles.configRowInfo}>
                <span className={styles.configRowIcon}>📝</span>
                <div className={styles.configRowText}>
                  <span className={styles.configRowName}>变量</span>
                </div>
              </div>
              <div className={styles.configRowRight}>
                <button className={styles.addBtn}><span>+</span></button>
              </div>
            </div>
            <div className={styles.configRow}>
              <div className={styles.configRowInfo}>
                <span className={styles.configRowIcon}>🗄️</span>
                <div className={styles.configRowText}>
                  <span className={styles.configRowName}>数据库</span>
                </div>
              </div>
              <div className={styles.configRowRight}>
                <button className={styles.addBtn}><span>+</span></button>
              </div>
            </div>
            <div className={styles.configRow}>
              <div className={styles.configRowInfo}>
                <span className={styles.configRowIcon}>🧠</span>
                <div className={styles.configRowText}>
                  <span className={styles.configRowName}>长期记忆</span>
                </div>
              </div>
              <div className={styles.configRowRight}>
                <label className={styles.toggleSwitch}>
                  <input type="checkbox" />
                  <span className={styles.toggleSlider} />
                </label>
              </div>
            </div>
          </CollapsePanel>

          <CollapsePanel title="文件盒子">
            <div className={styles.configRow}>
              <div className={styles.configRowInfo}>
                <span className={styles.configRowIcon}>📁</span>
                <div className={styles.configRowText}>
                  <span className={styles.configRowName}>文件盒子</span>
                  <span className={styles.configRowDesc}>允许上传文件进行处理</span>
                </div>
              </div>
              <div className={styles.configRowRight}>
                <label className={styles.toggleSwitch}>
                  <input type="checkbox" />
                  <span className={styles.toggleSlider} />
                </label>
              </div>
            </div>
          </CollapsePanel>

          <CollapsePanel title="对话体验">
            <OpeningMessageEditor
              agentName={agent.name}
              config={openingConfig}
              onChange={onOpeningChange}
              defaultOpen={!!openingConfig.openingMessage}
            />
          </CollapsePanel>
        </div>
      </div>

      {/* 右侧栏：预览与调试 */}
      <div className={styles.col} style={{ flex: 1, minWidth: 320 }}>
        <div className={styles.colHeader}>
          <h3 className={styles.colTitle}>预览与调试</h3>
        </div>
        <div className={styles.colBody} style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
          <PreviewChat
            agentId={agent.id}
            agentName={agent.name}
            avatar={agent.avatar}
            persona={persona}
            model={model}
            openingConfig={openingConfig}
          />
        </div>
      </div>
    </>
  )
}
