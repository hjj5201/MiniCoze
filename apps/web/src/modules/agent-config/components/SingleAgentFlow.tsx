import React from 'react'
import styles from './SingleAgentFlow.module.css'
import type { AgentDetailData, FlowConfig } from '../agent-detail'

interface Props {
  agent: AgentDetailData
  activeTab: 'orchestration' | 'preview'
  config: FlowConfig
  onConfigChange: (config: FlowConfig) => void
}

const NODE_TYPES = [
  { key: 'start', label: '开始节点', icon: '▶' },
  { key: 'condition', label: '条件节点', icon: '◇' },
  { key: 'reply', label: '回复节点', icon: '💬' },
  { key: 'api', label: 'API 节点', icon: '🔌' },
  { key: 'end', label: '结束节点', icon: '⏹' },
] as const

export function SingleAgentFlow({ agent, activeTab, config, onConfigChange }: Props) {
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

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      // Placeholder for direct canvas click to add node
    }
  }

  return (
    <div className={styles.container}>
      {activeTab === 'orchestration' && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>对话流编排</h3>
            <p className={styles.panelDesc}>
              通过可视化拖拽的方式设计智能体的对话流程
            </p>
          </div>
          <div className={styles.flowEditor}>
            <div className={styles.nodeToolbar}>
              <span className={styles.toolbarTitle}>节点工具</span>
              {NODE_TYPES.map((node) => (
                <button
                  key={node.key}
                  className={styles.nodeItem}
                  onClick={() => handleAddNode(node)}
                  title={node.label}
                >
                  <span className={styles.nodeIcon}>{node.icon}</span>
                  <span className={styles.nodeLabel}>{node.label}</span>
                </button>
              ))}
            </div>
            <div className={styles.canvas} onClick={handleCanvasClick}>
              {nodes.length === 0 && (
                <div className={styles.canvasPlaceholder}>
                  <span className={styles.placeholderIcon}>+</span>
                  <span className={styles.placeholderText}>点击左侧节点添加第一个节点</span>
                </div>
              )}
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className={styles.canvasNode}
                  style={{ left: node.x, top: node.y }}
                >
                  <span className={styles.canvasNodeIcon}>
                    {NODE_TYPES.find((n) => n.key === node.type)?.icon}
                  </span>
                  <span className={styles.canvasNodeLabel}>
                    {NODE_TYPES.find((n) => n.key === node.type)?.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'preview' && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>预览与调试</h3>
            <p className={styles.panelDesc}>
              在发布前预览智能体的表现，测试回复效果。
            </p>
          </div>
          <div className={styles.previewBox}>
            <div className={styles.previewChat}>
              <div className={styles.previewBubble}>
                <img src={agent.avatar} alt="" className={styles.previewAvatarSmall} />
                <div className={styles.previewMsg}>
                  Hello! 我是 {agent.name}，有什么可以帮你的？
                </div>
              </div>
            </div>
            <div className={styles.previewInputRow}>
              <input
                className={styles.previewInput}
                placeholder="输入测试消息..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    alert('调试功能将在后续版本中开放')
                  }
                }}
              />
              <button className={styles.previewSendBtn}>发送</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}