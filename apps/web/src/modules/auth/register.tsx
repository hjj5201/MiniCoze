import { useState } from 'react';
import { register } from '../../api/auth';
import { Button, Card, Flex, Form, Input, Typography } from 'antd';

const { Title, Text } = Typography;

interface RegisterValues {
  username: string;
  email: string;
  password: string;
}

interface Props {
  onSuccess: () => void;
  onGoLogin: () => void;
}

export function RegisterPage({ onSuccess, onGoLogin }: Props) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleFinish(values: RegisterValues) {
    setError('');
    setLoading(true);
    try {
      await register(values);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : '请求失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <Card className="auth-card" styles={{ body: { width: '100%' } }}>
        <Flex vertical gap={28}>
          <Flex align="center" gap={10}>
            <Flex
              align="center"
              justify="center"
              style={{
                width: 36,
                height: 36,
                borderRadius: 6,
                background: '#18202f',
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              MC
            </Flex>
            <Text style={{ fontSize: 18, fontWeight: 700, color: '#18202f' }}>
              MiniCoze
            </Text>
          </Flex>

          <Title level={2} style={{ margin: 0 }}>
            注册 MiniCoze
          </Title>

          <Form<RegisterValues>
            className="auth-form"
            layout="vertical"
            onFinish={handleFinish}
            onValuesChange={() => setError('')}
            autoComplete="off"
          >
            <Form.Item
              label="用户名"
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input placeholder="请输入用户名" autoComplete="username" />
            </Form.Item>

            <Form.Item
              label="邮箱"
              name="email"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '邮箱格式不正确' },
              ]}
            >
              <Input placeholder="请输入邮箱" autoComplete="email" />
            </Form.Item>

            <Form.Item
              label="密码"
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少 6 位' },
              ]}
            >
              <Input.Password
                placeholder="请输入密码（至少 6 位）"
                autoComplete="new-password"
              />
            </Form.Item>

            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}

            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              disabled={loading}
              style={{ height: 46, fontSize: 16, fontWeight: 700 }}
            >
              注 册
            </Button>
          </Form>

          <Flex justify="center" gap={4}>
            <Text style={{ color: '#6b7280', fontSize: 14 }}>已有账号？</Text>
            <Button
              type="link"
              onClick={onGoLogin}
              style={{ padding: 0, height: 'auto', fontSize: 14, fontWeight: 600 }}
            >
              立即登录
            </Button>
          </Flex>
        </Flex>
      </Card>
    </main>
  );
}
