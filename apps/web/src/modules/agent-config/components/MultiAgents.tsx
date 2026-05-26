import React, { useState } from 'react'
import styles from '../agent-detail.module.css'
import type { AgentDetailData, MultiConfig, OpeningConfig } from '../agent-detail'
import { OpeningMessageEditor } from './OpeningMessageEditor'
import { PreviewChat } from './PreviewChat'

interface Props {
  agent: AgentDetailData
  persona: string
  setPersona: (v: string) => void
  model: string
  config: MultiConfig
  onConfigChange: (config: MultiConfig) => void
  openingConfig: OpeningConfig
  onOpeningChange: (config: OpeningConfig) => void
}

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

export function MultiAgents({ agent, persona, setPersona, model, config, onConfigChange, openingConfig, onOpeningChange }: Props) {
  const { subAgents } = config

  const handleAddAgent = () => {
    const newAgent = {
      id: `agent-${Date.now()}`,
      name: `Agent ${subAgents.length + 1}`,
    }
    onConfigChange({ subAgents: [...subAgents, newAgent] })
  }

  return (
    <>
      {/* 左侧栏：配置面板 */}
      <div className={styles.col} style={{ flex: '0 0 320px', minWidth: 280 }}>
        <div className={styles.colHeader}>
          <h3 className={styles.colTitle}>编排</h3>
        </div>
        <div className={styles.colBody}>
          <CollapsePanel title="人设与回复逻辑">
            <textarea
              className={styles.panelTextarea}
              placeholder={`定义主 Agent 的基础人设，例如：\n你是一个协调者，负责将任务分发给合适的子 Agent...`}
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              rows={6}
            />
            <span className={styles.charCount}>{persona.length} 字</span>
          </CollapsePanel>

          <CollapsePanel title="技能">
            <div className={styles.configRow}>
              <div className={styles.configRowInfo}>
                <span className={styles.configRowIcon}>🔌</span>
                <div className={styles.configRowText}>
                  <span className={styles.configRowName}>插件</span>
                </div>
              </div>
              <div className={styles.configRowRight}>
                <button className={styles.addBtn}><span>+</span></button>
              </div>
            </div>
            <div className={styles.configRow}>
              <div className={styles.configRowInfo}>
                <span className={styles.configRowIcon}>⚡</span>
                <div className={styles.configRowText}>
                  <span className={styles.configRowName}>工作流</span>
                </div>
              </div>
              <div className={styles.configRowRight}>
                <button className={styles.addBtn}><span>+</span></button>
              </div>
            </div>
          </CollapsePanel>

          <CollapsePanel title="触发器">
            <div className={styles.configRow}>
              <div className={styles.configRowInfo}>
                <span className={styles.configRowIcon}>⚡</span>
                <div className={styles.configRowText}>
                  <span className={styles.configRowName}>触发器配置</span>
                  <span className={styles.configRowDesc}>设置多 Agent 协作触发条件</span>
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

      {/* 中间栏：可视化画布 */}
      <div className={styles.col} style={{ flex: 1, minWidth: 400 }}>
        <div className={styles.colHeader}>
          <h3 className={styles.colTitle}>编排画布</h3>
        </div>
        <div className={styles.colBody} style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
          <div className={styles.canvasWrap}>
            <div className={styles.canvasArea}>
              {/* 开始节点 */}
              <div className={styles.canvasStartNode}>
                ▶ 开始
              </div>

              {/* 连接线 */}
              <div className={styles.canvasConnector} />
              <div className={styles.canvasConnectorArrow} />

              {/* Agent 节点 */}
              <div className={styles.canvasAgentNode}>
                <img src={agent.avatar} alt={agent.name} className={styles.canvasAgentAvatar} />
                <div className={styles.canvasAgentInfo}>
                  <span className={styles.canvasAgentName}>{agent.name}</span>
                  <span className={styles.canvasAgentRole}>主 Agent</span>
                </div>
              </div>

              {/* 子 Agent 节点 */}
              {subAgents.map((sub, index) => (
                <div
                  key={sub.id}
                  className={styles.canvasAgentNode}
                  style={{
                    top: `${160 + index * 80}px`,
                    left: '240px',
                  }}
                >
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#506070',
                  }}>
                    {sub.name.charAt(0)}
                  </div>
                  <div className={styles.canvasAgentInfo}>
                    <span className={styles.canvasAgentName}>{sub.name}</span>
                    <span className={styles.canvasAgentRole}>子 Agent</span>
                  </div>
                </div>
              ))}

              {subAgents.length === 0 && (
                <div className={styles.canvasPlaceholder}>
                  从左侧面板添加子 Agent
                </div>
              )}
            </div>

            {/* 底部工具栏 */}
            <div className={styles.canvasToolbar}>
              <div className={styles.canvasToolbarLeft}>
                <button className={styles.canvasToolBtn} onClick={handleAddAgent}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 2V10M2 6H10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                  添加节点
                </button>
                <button className={styles.canvasToolBtn}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 8L6 10L9 8M3 6L6 8L9 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  撤销
                </button>
                <button className={styles.canvasToolBtn}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M9 8L6 10L3 8M9 6L6 8L3 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  重做
                </button>
              </div>
              <div className={styles.canvasToolbarRight}>
                <button className={styles.canvasToolBtn} title="缩小">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M8 8L11 11M3 5H7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    <circle cx="5" cy="5" r="3" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </button>
                <span style={{ fontSize: 12, color: '#8896a6', fontWeight: 500 }}>100%</span>
                <button className={styles.canvasToolBtn} title="放大">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M8 8L11 11M5 3V7M3 5H7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    <circle cx="5" cy="5" r="3" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </button>
                <button className={styles.canvasToolBtn} title="全屏">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1 4V1H4M8 1H11V4M11 8V11H8M4 11H1V8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button className={styles.canvasToolBtn} title="重置视图">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1V3M6 9V11M1 6H3M9 6H11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    <rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧栏：预览与调试 */}
      <div className={styles.col} style={{ flex: '0 0 360px', minWidth: 320 }}>
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
