import React, { useState, useEffect } from "react";
import styles from "./agent-detail.module.css";
import { updateAgent } from "../../api/agent-config/index";

export type AgentMode = 'chat' | 'single' | 'multi';

export interface AgentDetailData {
  id: string;
  name: string;
  avatar: string;
  description: string;
  mode: AgentMode;
  persona: string;
  orchestration: string;
}

interface Props {
  agent: AgentDetailData;
  onBack: () => void;
}

const MODE_OPTIONS: { key: AgentMode; label: string; desc: string }[] = [
  { key: 'chat', label: '对话模式', desc: '基础对话交互' },
  { key: 'single', label: '单Agent自主规划模式', desc: '单智能体自主推理与执行' },
  { key: 'multi', label: '多Agent协作模式', desc: '多智能体协同工作' },
];

type TabKey = 'persona' | 'orchestration' | 'preview';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'persona', label: '人设与回复逻辑' },
  { key: 'orchestration', label: '编排' },
  { key: 'preview', label: '预览与调试' },
];

export function AgentDetail({ agent, onBack }: Props) {
  const [mode, setMode] = useState<AgentMode>(agent.mode);
  const [persona, setPersona] = useState(agent.persona);
  const [orchestration, setOrchestration] = useState(agent.orchestration);
  const [activeTab, setActiveTab] = useState<TabKey>('persona');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMode(agent.mode);
    setPersona(agent.persona);
    setOrchestration(agent.orchestration);
  }, [agent.id]);

  const handleSave = async () => {
    setSaving(true);
    await updateAgent(agent.id, { mode, persona, orchestration });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePublish = () => {
    alert(`智能体 "${agent.name}" 发布成功！`);
  };

  return (
    <div className={styles.detailPage}>
      {/* ===== 顶部导航栏 ===== */}
      <div className={styles.navbar}>
        <div className={styles.navLeft}>
          <button className={styles.backBtn} onClick={onBack}>
            ← 返回
          </button>
          <img src={agent.avatar} alt={agent.name} className={styles.navAvatar} />
          <span className={styles.navName}>{agent.name}</span>
        </div>

        <div className={styles.navCenter}>
          <div className={styles.modeSelector}>
            {MODE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                className={`${styles.modeOption} ${mode === opt.key ? styles.modeOptionActive : ''}`}
                onClick={() => setMode(opt.key)}
                title={opt.desc}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.navRight}>
          {saved && <span className={styles.savedHint}>已保存</span>}
          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '保存中...' : '保存'}
          </button>
          <button className={styles.publishBtn} onClick={handlePublish}>
            发布
          </button>
        </div>
      </div>

      {/* ===== 标签栏 ===== */}
      <div className={styles.tabBar}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tabItem} ${activeTab === tab.key ? styles.tabItemActive : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== Tab 内容区 ===== */}
      <div className={styles.tabContent}>
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

        {activeTab === 'orchestration' && (
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3 className={styles.panelTitle}>编排</h3>
              <p className={styles.panelDesc}>
                配置智能体的工作流、工具调用和子智能体编排逻辑。
              </p>
            </div>
            <textarea
              className={styles.panelTextarea}
              placeholder={`在此处编排工作流...\n\n当前模式：${MODE_OPTIONS.find((o) => o.key === mode)?.label}`}
              value={orchestration}
              onChange={(e) => setOrchestration(e.target.value)}
              rows={16}
            />
            <span className={styles.charCount}>{orchestration.length} 字</span>
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
                      alert('调试功能将在后续版本中开放');
                    }
                  }}
                />
                <button className={styles.previewSendBtn}>发送</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}