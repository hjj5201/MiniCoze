import React from 'react'
import styles from './MultiAgents.module.css'
import type { AgentDetailData, MultiConfig } from '../agent-detail'

interface Props {
  agent: AgentDetailData
  persona: string
  setPersona: (v: string) => void
  activeTab: 'persona' | 'orchestration' | 'preview'
  config: MultiConfig
  onConfigChange: (config: MultiConfig) => void
}

export function MultiAgents({ agent, persona, setPersona, activeTab, config, onConfigChange }: Props) {
  const { subAgents } = config

  const handleAddAgent = () => {
    const newAgent = {
      id: `agent-${Date.now()}`,
      name: `Agent ${subAgents.length + 1}`,
    }
    onConfigChange({ subAgents: [...subAgents, newAgent] })
  }

  return (
    <div className={styles.container}>
      {activeTab === 'persona' && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>人设与回复逻辑</h3>
            <p className={styles.panelDesc}>
              定义主 Agent 的基础人设
            </p>
          </div>
          <textarea
            className={styles.panelTextarea}
            placeholder={`例如：\n你是一个专业的客服助手，名叫${agent.name}。你需要：\n1. 始终保持礼貌和耐心\n2. 用简洁清晰的语言回复\n3. 遇到无法解决的问题时，引导用户提供更多信息`}
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            rows={16}
          />
          <span className={styles.charCount}>{persona.length} 字</span>
        </div>
      )}

      {activeTab === 'orchestration' && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>多 Agent 协作编排</h3>
            <p className={styles.panelDesc}>
              添加多个 Agent 并设计它们之间的协作流程
            </p>
          </div>
          <div className={styles.orchestrationArea}>
            <div className={styles.orchestrationToolbar}>
              <button className={styles.addAgentBtn} onClick={handleAddAgent}>
                <span className={styles.addAgentIcon}>+</span>
                添加 Agent
              </button>
            </div>
            <div className={styles.canvas}>
              {/* 主 Agent 节点 */}
              <div className={styles.mainAgentNode}>
                <img
                  src={agent.avatar}
                  alt={agent.name}
                  className={styles.mainAgentAvatar}
                />
                <div className={styles.mainAgentInfo}>
                  <span className={styles.mainAgentName}>{agent.name}</span>
                  <span className={styles.mainAgentRole}>主 Agent</span>
                </div>
              </div>

              {/* 子 Agent 节点 */}
              {subAgents.map((sub, index) => (
                <div
                  key={sub.id}
                  className={styles.subAgentNode}
                  style={{
                    top: `${140 + index * 90}px`,
                  }}
                >
                  <div className={styles.subAgentAvatar}>
                    {sub.name.charAt(0)}
                  </div>
                  <div className={styles.subAgentInfo}>
                    <span className={styles.subAgentName}>{sub.name}</span>
                    <span className={styles.subAgentRole}>子 Agent</span>
                  </div>
                  <div className={styles.connectorLine} />
                </div>
              ))}

              {subAgents.length === 0 && (
                <div className={styles.canvasHint}>
                  <span>点击上方"添加 Agent"按钮添加子 Agent</span>
                </div>
              )}
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