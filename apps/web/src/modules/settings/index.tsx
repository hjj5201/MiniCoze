import { KeyOutlined, SettingOutlined, TeamOutlined } from '@ant-design/icons';
import styles from './index.module.css';

const settingSections = [
  {
    key: 'workspace',
    icon: <SettingOutlined />,
    title: '工作区设置',
    description: '预留工作区资料、默认模型、数据保留策略等配置。',
  },
  {
    key: 'members',
    icon: <TeamOutlined />,
    title: '成员与权限',
    description: '预留成员邀请、角色分配、权限策略和团队管理。',
  },
  {
    key: 'secrets',
    icon: <KeyOutlined />,
    title: '密钥管理',
    description: '预留模型密钥、第三方服务凭证和环境变量管理。',
  },
];

export function SettingsPage() {
  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <span className={styles.eyebrow}>Settings</span>
        <h1>设置</h1>
        <p>集中管理工作区、权限、安全和平台级配置。</p>
      </div>

      <div className={styles.grid}>
        {settingSections.map((item) => (
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
