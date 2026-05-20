import { getCurrentUser } from '../../api/auth/auth-store';
import { logout } from '../../api/auth';
import { Button, Flex, Layout, Typography } from 'antd';

const { Header, Content } = Layout;
const { Text } = Typography;

export function HomePage({ onLogout }: { onLogout: () => void }) {
  const user = getCurrentUser();

  return (
    <Layout className="home-shell">
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 56,
          padding: '0 24px',
          background: '#ffffff',
          borderBottom: '1px solid rgba(104, 119, 144, 0.15)',
        }}
      >
        <Flex align="center" gap={8}>
          <Flex
            align="center"
            justify="center"
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: '#18202f',
              color: '#ffffff',
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            MC
          </Flex>
          <Text style={{ fontSize: 16, fontWeight: 700, color: '#18202f' }}>
            MiniCoze
          </Text>
        </Flex>
        <Flex align="center" gap={16}>
          {user && (
            <Text style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>
              {user.username}
            </Text>
          )}
          <Button
            onClick={() => {
              logout();
              onLogout();
            }}
          >
            退出登录
          </Button>
        </Flex>
      </Header>

      <Content className="home-content">
        <div className="home-empty">
          <Text className="home-empty-text">主页面 — 内容待开发</Text>
        </div>
      </Content>
    </Layout>
  );
}
