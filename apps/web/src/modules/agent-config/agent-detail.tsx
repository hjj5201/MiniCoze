import React, { useState, useEffect, useCallback, useMemo } from "react";
import styles from "./agent-detail.module.css";
import { updateAgent } from "../../api/agent-config/index";
import { SingleAgentPlanner } from "./components/SingleAgentPlanner";
import { SingleAgentFlow } from "./components/SingleAgentFlow";
import { MultiAgents } from "./components/MultiAgents";
import { ModeSelector } from "./components/ModeSelector";
import type { ModeOption } from "./components/ModeSelector";

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

// ---- 编排配置（序列化为 orchestration 字段持久化） ----

export interface PlannerConfig {
  selectedModel: string;
  knowledgeEnabled: boolean;
  autoInvoke: boolean;
  plugins: string[];
  workflows: string[];
}

export interface FlowConfig {
  nodes: Array<{ id: string; type: string; x: number; y: number }>;
}

export interface MultiConfig {
  subAgents: Array<{ id: string; name: string }>;
}

export interface OrchestrationConfig {
  planner?: PlannerConfig;
  flow?: FlowConfig;
  multi?: MultiConfig;
}

function parseOrchestration(raw: string): OrchestrationConfig {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed as OrchestrationConfig;
  } catch {
    // ignore
  }
  return {};
}

function serializeOrchestration(config: OrchestrationConfig): string {
  // 过滤掉全空/默认的配置以节省空间
  const cleaned: Record<string, unknown> = {};
  if (config.planner) cleaned.planner = config.planner;
  if (config.flow) cleaned.flow = config.flow;
  if (config.multi) cleaned.multi = config.multi;
  return Object.keys(cleaned).length > 0 ? JSON.stringify(cleaned) : '';
}

function defaultPlannerConfig(): PlannerConfig {
  return {
    selectedModel: '豆包·1.8·深度思考',
    knowledgeEnabled: true,
    autoInvoke: true,
    plugins: [],
    workflows: [],
  };
}

function defaultFlowConfig(): FlowConfig {
  return { nodes: [] };
}

function defaultMultiConfig(): MultiConfig {
  return { subAgents: [] };
}

interface Props {
  agent: AgentDetailData;
  onBack: () => void;
}

// ---- 模式配置（供 ModeSelector 下拉使用） ----
export const MODE_CONFIG: ModeOption[] = [
  {
    key: 'chat',
    name: '单 Agent（自主规划模式）',
    description: '用户与大模型进行对话，由一个大模型自主思考决策，适用于较为简单的业务逻辑。',
    icon: null,
  },
  {
    key: 'single',
    name: '单 Agent（对话流模式）',
    description: '该智能体会严格按照对话流编排的流程进行执行，支持保留多轮历史对话记录，适用于结构化或有明确流程的任务。',
    icon: null,
  },
  {
    key: 'multi',
    name: '多 Agents',
    description: '在一个智能体中设置多个 Agent，以处理复杂的逻辑。',
    icon: null,
  },
] as ModeOption[];

type TabKey = 'persona' | 'orchestration' | 'preview';

// ---- 每个模式可用的子标签 ----
const MODE_TABS: Record<AgentMode, { key: TabKey; label: string }[]> = {
  chat: [
    { key: 'persona', label: '人设与回复逻辑' },
    { key: 'orchestration', label: '编排' },
    { key: 'preview', label: '预览与调试' },
  ],
  single: [
    { key: 'orchestration', label: '编排' },
    { key: 'preview', label: '预览与调试' },
  ],
  multi: [
    { key: 'persona', label: '人设与回复逻辑' },
    { key: 'orchestration', label: '编排' },
    { key: 'preview', label: '预览与调试' },
  ],
};

// ---- 模式切换动画的 key 生成 ----
let contentKeyCounter = 0;
function nextContentKey(): number {
  contentKeyCounter += 1;
  return contentKeyCounter;
}

export function AgentDetail({ agent, onBack }: Props) {
  const [mode, setMode] = useState<AgentMode>(agent.mode);
  const [persona, setPersona] = useState(agent.persona);
  const [orchestration, setOrchestration] = useState(agent.orchestration);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // 每个模式下记住上次选中的子标签
  const [activeTabByMode, setActiveTabByMode] = useState<Record<AgentMode, TabKey>>({
    chat: 'persona',
    single: 'orchestration',
    multi: 'persona',
  });

  const [contentKey, setContentKey] = useState(0);

  // ---- 解析 orchestration JSON → 结构化配置 ----
  const parsedConfig = useMemo(() => parseOrchestration(orchestration), [orchestration]);

  const plannerConfig = useMemo(
    () => parsedConfig.planner ?? defaultPlannerConfig(),
    [parsedConfig.planner],
  );
  const flowConfig = useMemo(
    () => parsedConfig.flow ?? defaultFlowConfig(),
    [parsedConfig.flow],
  );
  const multiConfig = useMemo(
    () => parsedConfig.multi ?? defaultMultiConfig(),
    [parsedConfig.multi],
  );

  // ---- 更新配置的通用方法 ----
  const updateOrchestration = useCallback(
    (patch: Partial<OrchestrationConfig>) => {
      const next = serializeOrchestration({ ...parsedConfig, ...patch });
      setOrchestration(next);
    },
    [parsedConfig],
  );

  const handlePlannerConfigChange = useCallback(
    (config: PlannerConfig) => updateOrchestration({ planner: config }),
    [updateOrchestration],
  );
  const handleFlowConfigChange = useCallback(
    (config: FlowConfig) => updateOrchestration({ flow: config }),
    [updateOrchestration],
  );
  const handleMultiConfigChange = useCallback(
    (config: MultiConfig) => updateOrchestration({ multi: config }),
    [updateOrchestration],
  );

  // agent prop 变更时同步
  useEffect(() => {
    setMode(agent.mode);
    setPersona(agent.persona);
    setOrchestration(agent.orchestration);
  }, [agent.mode, agent.persona, agent.orchestration]);

  const currentTabs = MODE_TABS[mode];
  const currentActiveTab = activeTabByMode[mode];

  const handleModeChange = useCallback(
    (newMode: AgentMode) => {
      if (newMode === mode) return;
      setMode(newMode);
      setContentKey(nextContentKey());
      const tabs = MODE_TABS[newMode];
      const remembered = activeTabByMode[newMode];
      if (!tabs.some((t) => t.key === remembered)) {
        setActiveTabByMode((prev) => ({ ...prev, [newMode]: tabs[0].key }));
      }
    },
    [mode, activeTabByMode],
  );

  const handleTabChange = useCallback(
    (tabKey: TabKey) => {
      setActiveTabByMode((prev) => ({ ...prev, [mode]: tabKey }));
    },
    [mode],
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAgent(agent.id, { mode, persona, orchestration });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert('保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = () => {
    alert(`智能体 "${agent.name}" 发布成功！`);
  };

  const renderContent = () => {
    const commonProps = { agent, persona, setPersona };

    switch (mode) {
      case 'chat':
        return (
          <SingleAgentPlanner
            {...commonProps}
            activeTab={currentActiveTab}
            config={plannerConfig}
            onConfigChange={handlePlannerConfigChange}
          />
        );
      case 'single':
        return (
          <SingleAgentFlow
            agent={agent}
            activeTab={currentActiveTab as 'orchestration' | 'preview'}
            config={flowConfig}
            onConfigChange={handleFlowConfigChange}
          />
        );
      case 'multi':
        return (
          <MultiAgents
            {...commonProps}
            activeTab={currentActiveTab as 'persona' | 'orchestration' | 'preview'}
            config={multiConfig}
            onConfigChange={handleMultiConfigChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.detailPage}>
      <div className={styles.navbar}>
        <div className={styles.navLeft}>
          <button className={styles.backBtn} onClick={onBack}>
            ← 返回
          </button>
          <img src={agent.avatar} alt={agent.name} className={styles.navAvatar} />
          <span className={styles.navName}>{agent.name}</span>
          <ModeSelector
            currentMode={mode}
            modes={MODE_CONFIG}
            onModeChange={handleModeChange}
          />
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

      <div className={styles.tabBar}>
        {currentTabs.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tabItem} ${currentActiveTab === tab.key ? styles.tabItemActive : ''}`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.tabContent} key={contentKey}>
        {renderContent()}
      </div>
    </div>
  );
}