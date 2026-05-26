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
  model: string;
}

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

export interface OpeningConfig {
  openingMessage: string;
  openingQuestions: string[];
  openingQuestionsEnabled: boolean;
}

export interface OrchestrationConfig {
  planner?: PlannerConfig;
  flow?: FlowConfig;
  multi?: MultiConfig;
  opening?: OpeningConfig;
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
  const cleaned: Record<string, unknown> = {};
  if (config.planner) cleaned.planner = config.planner;
  if (config.flow) cleaned.flow = config.flow;
  if (config.multi) cleaned.multi = config.multi;
  if (config.opening && config.opening.openingMessage) cleaned.opening = config.opening;
  return Object.keys(cleaned).length > 0 ? JSON.stringify(cleaned) : '';
}

function defaultPlannerConfig(): PlannerConfig {
  return {
    selectedModel: 'gpt-4o-mini',
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

function defaultOpeningConfig(): OpeningConfig {
  return { openingMessage: '', openingQuestions: [], openingQuestionsEnabled: false };
}

interface Props {
  agent: AgentDetailData;
  onBack: () => void;
}

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

let contentKeyCounter = 0;
function nextContentKey(): number {
  contentKeyCounter += 1;
  return contentKeyCounter;
}

export function AgentDetail({ agent, onBack }: Props) {
  const [mode, setMode] = useState<AgentMode>(agent.mode);
  const [persona, setPersona] = useState(agent.persona);
  const [orchestration, setOrchestration] = useState(agent.orchestration);
  const [model, setModel] = useState(agent.model);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [contentKey, setContentKey] = useState(0);
  const [dirty, setDirty] = useState(false);

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
  const openingConfig = useMemo(
    () => parsedConfig.opening ?? defaultOpeningConfig(),
    [parsedConfig.opening],
  );

  const updateOrchestration = useCallback(
    (patch: Partial<OrchestrationConfig>) => {
      const next = serializeOrchestration({ ...parsedConfig, ...patch });
      setOrchestration(next);
      setDirty(true);
    },
    [parsedConfig],
  );

  const handlePlannerConfigChange = useCallback(
    (config: PlannerConfig) => {
      updateOrchestration({ planner: config });
      setModel(config.selectedModel);
    },
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
  const handleOpeningConfigChange = useCallback(
    (config: OpeningConfig) => updateOrchestration({ opening: config }),
    [updateOrchestration],
  );

  useEffect(() => {
    setMode(agent.mode);
    setPersona(agent.persona);
    setOrchestration(agent.orchestration);
    setModel(agent.model);
  }, [agent.mode, agent.persona, agent.orchestration, agent.model]);

  const handleModeChange = useCallback(
    (newMode: AgentMode) => {
      if (newMode === mode) return;
      setMode(newMode);
      setContentKey(nextContentKey());
    },
    [mode],
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAgent(agent.id, { mode, persona, orchestration, model });
      setSaved(true);
      setDirty(false);
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

  const handleModelChange = useCallback(
    (newModel: string) => {
      setModel(newModel);
      setDirty(true);
      // 同步更新 PlannerConfig 里的 selectedModel，保持编排配置里的模型与 Agent 顶层模型一致
      if (parsedConfig.planner) {
        updateOrchestration({ planner: { ...parsedConfig.planner, selectedModel: newModel } });
      }
    },
    [parsedConfig, updateOrchestration],
  );

  const renderContent = () => {
    const commonProps = { agent, persona, setPersona, model, onModelChange: handleModelChange, openingConfig, onOpeningChange: handleOpeningConfigChange };

    switch (mode) {
      case 'chat':
        return (
          <SingleAgentPlanner
            {...commonProps}
            config={plannerConfig}
            onConfigChange={handlePlannerConfigChange}
          />
        );
      case 'single':
        return (
          <SingleAgentFlow
            agent={agent}
            model={model}
            config={flowConfig}
            onConfigChange={handleFlowConfigChange}
            openingConfig={openingConfig}
            onOpeningChange={handleOpeningConfigChange}
          />
        );
      case 'multi':
        return (
          <MultiAgents
            {...commonProps}
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
          <button className={styles.backArrow} onClick={onBack} title="返回">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <img src={agent.avatar} alt={agent.name} className={styles.navAvatar} />
          <span className={styles.navName}>{agent.name}</span>
        </div>

        <div className={styles.navCenter}>
          <ModeSelector
            currentMode={mode}
            modes={MODE_CONFIG}
            onModeChange={handleModeChange}
          />
        </div>

        <div className={styles.navRight}>
          {saved && <span className={styles.savedHint}>已保存</span>}
          {dirty && !saved && (
            <span className={styles.draftHint}>
              <span className={styles.draftDot} />
              草稿
            </span>
          )}
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

      <div className={styles.columns} key={contentKey}>
        {renderContent()}
      </div>
    </div>
  );
}
