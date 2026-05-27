import { BranchesOutlined, CloudUploadOutlined, HistoryOutlined } from '@ant-design/icons';
import styles from './index.module.css';

const publishSections = [
  {
    key: 'channels',
    icon: <CloudUploadOutlined />,
    title: '发布渠道',
    description: '预留 Web、API、嵌入式组件和第三方渠道发布配置。',
  },
  {
    key: 'versions',
    icon: <BranchesOutlined />,
    title: '版本管理',
    description: '预留草稿、正式版本、灰度版本和回滚能力。',
  },
  {
    key: 'history',
    icon: <HistoryOutlined />,
    title: '发布记录',
    description: '预留发布审批、变更摘要、操作者和发布时间线。',
  },
];

export function PublishPage() {
  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <span className={styles.eyebrow}>Publish</span>
        <h1>发布</h1>
        <p>统一管理智能体、工作流和知识库关联应用的发布生命周期。</p>
      </div>

      <div className={styles.grid}>
        {publishSections.map((item) => (
          <article className={styles.panel} key={item.key}>
            <div className={styles.icon}>{item.icon}</div>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
