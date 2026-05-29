const capabilities = [
  '角色设定',
  '知识库',
  '工具调用',
  '工作流编排',
  '调试评估',
];

export function App() {
  return (
    <main className="app-shell">
      <section className="workspace-panel" aria-labelledby="page-title">
        <div className="brand-mark">MC</div>
        <div className="intro">
          <p className="eyebrow">MiniCoze Web</p>
          <h1 id="page-title">可视化 AI Agent 搭建平台</h1>
          <p className="summary">
            前端工程已经初始化为 React + TypeScript + Vite，可以继续接入后端接口、工作区管理和 Agent 编排页面。
          </p>
        </div>
        <div className="capability-grid" aria-label="核心能力">
          {capabilities.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>
    </main>
  );
}
