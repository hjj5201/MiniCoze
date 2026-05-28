import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./index.module.css";
import { CreateAgent } from "./creatAgent";
import type { AgentConfig } from "../../api/agent-config/index";
import { createAgent, getAgentList, deleteAgent } from "../../api/agent-config/index";

export function CreatAgent() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

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
    navigate(`/agents/${newAgent.id}`);
  };

  const handleDelete = async (id: string) => {
    await deleteAgent(id);
    setAgents((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSelectAgent = (id: string) => {
    navigate(`/agents/${id}`);
  };

  return (
    <div className={styles.agentConfig}>
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
              onClick={() => handleSelectAgent(agent.id)}
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

      <CreateAgent
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
