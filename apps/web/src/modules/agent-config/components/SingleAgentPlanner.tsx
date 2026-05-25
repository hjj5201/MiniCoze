import React, { useState, useCallback } from 'react'
import styles from './SingleAgentPlanner.module.css'
import type { AgentDetailData, PlannerConfig } from '../agent-detail'

type PlannerTab = 'persona' | 'orchestration' | 'preview'

interface Props {
  agent: AgentDetailData
  persona: string
  setPersona: (v: string) => void
  activeTab: PlannerTab
  config: PlannerConfig
  onConfigChange: (config: PlannerConfig) => void
}

const MODEL_OPTIONS = [
  '豆包·1.8·深度思考',
  '豆包·1.8·极速版',
  'GPT-4o',
  'Claude 3.5 Sonnet',
]

const DEFAULT_KNOWLEDGE_NAME = '知识库'

export function SingleAgentPlanner({ agent, persona, setPersona, activeTab, config, onConfigChange }: Props) {
  // 仅用于 UI 临时状态（下拉是否展开）
  const [modelOpen, setModelOpen] = useState(false)

  // 从 config 中读取持久化配置
  const { selectedModel, knowledgeEnabled, autoInvoke, plugins, workflows } = config

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
    <div className={styles.container}>
      {/* ---- 人设与回复逻辑 ---- */}
      {activeTab === 'persona' && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>人设与回复逻辑</h3>
            <p className={styles.panelDesc}>
              定义智能体的身份、性格、行为准则及回复风格。
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

      {/* ---- 编排 ---- */}
      {activeTab === 'orchestration' && (
        <div className={styles.panel}>
          {/* 模型设置 */}
          <div className={styles.configSection}>
            <h4 className={styles.sectionTitle}>模型设置</h4>
            <div className={styles.modelSelector}>
              <div
                className={styles.modelTrigger}
                onClick={() => setModelOpen((v) => !v)}
              >
                <span className={styles.modelIcon}>🧠</span>
                <span className={styles.modelName}>{selectedModel}</span>
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
                      key={m}
                      className={`${styles.modelOption} ${m === selectedModel ? styles.modelOptionActive : ''}`}
                      onClick={() => {
                        updateConfig({ selectedModel: m })
                        setModelOpen(false)
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 技能 */}
          <div className={styles.configSection}>
            <h4 className={styles.sectionTitle}>技能</h4>

            <div className={styles.skillRow}>
              <div className={styles.skillInfo}>
                <span className={styles.skillIcon}>🔌</span>
                <div className={styles.skillText}>
                  <span className={styles.skillName}>插件</span>
                  <span className={styles.skillDesc}>添加 AI 能力插件</span>
                </div>
              </div>
              <div className={styles.skillRight}>
                {plugins.length > 0 && (
                  <span className={styles.skillCount}>{plugins.length} 个插件</span>
                )}
                <button className={styles.addBtn} onClick={handleAddPlugin}>
                  <span>+</span>
                </button>
              </div>
            </div>

            <div className={styles.skillRow}>
              <div className={styles.skillInfo}>
                <span className={styles.skillIcon}>⚡</span>
                <div className={styles.skillText}>
                  <span className={styles.skillName}>工作流</span>
                  <span className={styles.skillDesc}>配置对话流程</span>
                </div>
              </div>
              <div className={styles.skillRight}>
                {workflows.length > 0 && (
                  <span className={styles.skillCount}>{workflows.length} 个工作流</span>
                )}
                <button className={styles.addBtn} onClick={handleAddWorkflow}>
                  <span>+</span>
                </button>
              </div>
            </div>
          </div>

          {/* 知识 */}
          <div className={styles.configSection}>
            <h4 className={styles.sectionTitle}>知识</h4>
            <div className={styles.knowledgeRow}>
              <div className={styles.skillInfo}>
                <span className={styles.skillIcon}>📚</span>
                <div className={styles.skillText}>
                  <span className={styles.skillName}>文本知识库</span>
                </div>
              </div>
              <div className={styles.knowledgeRight}>
                <span className={styles.knowledgeLabel}>{DEFAULT_KNOWLEDGE_NAME}</span>
                <label className={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    checked={knowledgeEnabled}
                    onChange={(e) => updateConfig({ knowledgeEnabled: e.target.checked })}
                  />
                  <span className={styles.toggleSlider} />
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={autoInvoke}
                    onChange={(e) => updateConfig({ autoInvoke: e.target.checked })}
                  />
                  <span className={styles.checkboxMark} />
                  <span className={styles.checkboxText}>自动调用</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---- 预览与调试 ---- */}
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