import { useState } from 'react';
import { login } from '../../api/auth';
import { Button, Card, Flex, Form, Input, Typography } from 'antd';
import './auth.css';

const { Title, Text } = Typography;

interface LoginValues {
  email: string;
  password: string;
}

interface Props {
  onSuccess: () => void;
  onGoRegister: () => void;
}

export function LoginPage({ onSuccess, onGoRegister }: Props) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleFinish(values: LoginValues) {
    setError('');
    setLoading(true);
    try {
      await login(values);
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
            登录 MiniCoze
          </Title>

          <Form<LoginValues>
            className="auth-form"
            layout="vertical"
            onFinish={handleFinish}
            onValuesChange={() => setError('')}
            autoComplete="off"
          >
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
                placeholder="请输入密码"
                autoComplete="current-password"
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
              登 录
            </Button>
          </Form>

          <Flex justify="center" gap={4}>
            <Text style={{ color: '#6b7280', fontSize: 14 }}>还没有账号？</Text>
            <Button
              type="link"
              onClick={onGoRegister}
              style={{ padding: 0, height: 'auto', fontSize: 14, fontWeight: 600 }}
            >
              立即注册
            </Button>
          </Flex>
        </Flex>
      </Card>
    </main>
  );
}
