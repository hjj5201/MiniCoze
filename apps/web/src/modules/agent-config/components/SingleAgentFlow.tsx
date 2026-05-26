import React, { useState } from 'react'
import styles from '../agent-detail.module.css'
import type { AgentDetailData, FlowConfig, OpeningConfig } from '../agent-detail'
import { OpeningMessageEditor } from './OpeningMessageEditor'
import { PreviewChat } from './PreviewChat'

interface Props {
  agent: AgentDetailData
  model: string
  config: FlowConfig
  onConfigChange: (config: FlowConfig) => void
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

const NODE_TYPES = [
  { key: 'start', label: '开始节点', icon: '▶' },
  { key: 'condition', label: '条件节点', icon: '◇' },
  { key: 'reply', label: '回复节点', icon: '💬' },
  { key: 'api', label: 'API 节点', icon: '🔌' },
  { key: 'end', label: '结束节点', icon: '⏹' },
] as const

export function SingleAgentFlow({ agent, model, config, onConfigChange, openingConfig, onOpeningChange }: Props) {
  const { nodes } = config

  const handleAddNode = (nodeType: (typeof NODE_TYPES)[number]) => {
    const newNode = {
      id: `${nodeType.key}-${Date.now()}`,
      type: nodeType.key,
      x: 200 + nodes.length * 40,
      y: 200 + nodes.length * 40,
    }
    onConfigChange({ nodes: [...nodes, newNode] })
  }

  return (
    <>
      {/* 左侧栏：编排 */}
      <div className={styles.col} style={{ flex: 1, minWidth: 420 }}>
        <div className={styles.colHeader}>
          <h3 className={styles.colTitle}>编排</h3>
        </div>
        <div className={styles.colBody}>
          {/* 对话流配置区 */}
          <div className={styles.flowAddArea}>
            <div className={styles.flowAddIcon}>+</div>
            <span className={styles.flowAddText}>点击添加对话流</span>
            <span className={styles.flowAddDesc}>
              每次对话都会调用该对话流，用户"本轮对话输入"会作为对话流的输入参数"USER_INPUT"传入
            </span>
          </div>

          {/* 节点工具栏 */}
          <div style={{
            display: 'flex',
            gap: 8,
            padding: '8px 0',
            flexWrap: 'wrap',
            marginBottom: 16,
          }}>
            {NODE_TYPES.map((node) => (
              <button
                key={node.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 12px',
                  border: '1px solid rgba(104,119,144,0.15)',
                  borderRadius: 6,
                  background: '#fff',
                  color: '#506070',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
                onClick={() => handleAddNode(node)}
              >
                <span>{node.icon}</span>
                <span>{node.label}</span>
              </button>
            ))}
          </div>

          {/* 画布区域 */}
          <div style={{
            border: '1px solid rgba(104,119,144,0.15)',
            borderRadius: 8,
            minHeight: 300,
            backgroundImage:
              'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {nodes.length === 0 && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                color: '#a0aec0',
                fontSize: 13,
                pointerEvents: 'none',
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  border: '2px dashed #d0d5dd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                }}>+</div>
                <span>从上方工具栏添加节点</span>
              </div>
            )}
            {nodes.map((node) => (
              <div
                key={node.id}
                style={{
                  position: 'absolute',
                  left: node.x,
                  top: node.y,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 14px',
                  background: '#fff',
                  border: '1px solid rgba(104,119,144,0.2)',
                  borderRadius: 6,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  fontSize: 12,
                  fontWeight: 500,
                  color: '#18202f',
                  cursor: 'pointer',
                }}
              >
                <span>{NODE_TYPES.find((n) => n.key === node.type)?.icon}</span>
                <span>{NODE_TYPES.find((n) => n.key === node.type)?.label}</span>
              </div>
            ))}
          </div>

          {/* 可折叠配置面板 */}
          <div style={{ marginTop: 20 }}>
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
            persona={agent.persona}
            model={model}
            openingConfig={openingConfig}
          />
        </div>
      </div>
    </>
  )
}
