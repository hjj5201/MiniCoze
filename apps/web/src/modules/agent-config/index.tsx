import React, { useState, useEffect } from "react";
import styles from "./index.module.css";
import { CreateAgent } from "./creatAgent";
import { AgentDetail } from "./agent-detail";
import type { AgentDetailData } from "./agent-detail";
import { AgentConfig, createAgent, getAgentList, deleteAgent } from "../../api/agent-config/index";

export function CreatAgent() {
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentConfig | null>(null);

  useEffect(() => {
    getAgentList().then(setAgents);
  }, []);

  const filteredAgents = agents.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (params: { name: string; avatar: string; description: string }) => {
    const newAgent = await createAgent(params);
    setAgents((prev) => [newAgent, ...prev]);
    setModalVisible(false);
    // 创建完自动跳转到详情页
    setSelectedAgent(newAgent);
  };

  const handleDelete = async (id: string) => {
    await deleteAgent(id);
    setAgents((prev) => prev.filter((a) => a.id !== id));
  };

  const handleBack = () => {
    setSelectedAgent(null);
    getAgentList().then(setAgents);
  };

  // ===== 详情页视图 =====
  if (selectedAgent) {
    const detailData: AgentDetailData = {
      id: selectedAgent.id,
      name: selectedAgent.name,
      avatar: selectedAgent.avatar,
      description: selectedAgent.description,
      mode: selectedAgent.mode,
      persona: selectedAgent.persona,
      orchestration: selectedAgent.orchestration,
      model: selectedAgent.model ?? 'gpt-4o-mini',
    };
    return <AgentDetail agent={detailData} onBack={handleBack} />;
  }

  // ===== 列表页视图 =====
  return (
    <div className={styles.agentConfig}>
      {/* ===== 顶部栏 ===== */}
      <div className={styles.topBar}>
        <span className={styles.topBarTitle}>智能体</span>
        <div className={styles.topBarRight}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              className={styles.searchInput}
              type="search"
              placeholder="搜索智能体名称"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setModalVisible(true)}
          >
            + 新建智能体
          </button>
        </div>
      </div>

      {/* ===== 智能体列表 ===== */}
      <div className={styles.agentList}>
        {filteredAgents.length === 0 ? (
          <div className={styles.agentListEmpty}>
            {search ? "没有找到匹配的智能体" : "暂无智能体，点击上方按钮创建"}
          </div>
        ) : (
          filteredAgents.map((agent) => (
            <div
              key={agent.id}
              className={styles.agentCard}
              onClick={() => setSelectedAgent(agent)}
              style={{ cursor: "pointer" }}
            >
              <img
                src={agent.avatar}
                alt={agent.name}
                className={styles.agentCardAvatar}
              />
              <div className={styles.agentCardInfo}>
                <span className={styles.agentCardName}>{agent.name}</span>
                {agent.description && (
                  <span className={styles.agentCardDesc}>{agent.description}</span>
                )}
              </div>
              <button
                className={styles.agentCardDelete}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(agent.id);
                }}
                title="删除"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* ===== 创建弹窗 ===== */}
      <CreateAgent
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}