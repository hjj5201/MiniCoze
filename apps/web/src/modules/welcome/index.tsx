import { Button, Card, Flex, Tag, Typography } from 'antd';

const { Title, Text } = Typography;

interface Props {
  onGoLogin: () => void;
}

const capabilities = [
  '角色设定',
  '知识库',
  '工具调用',
  '工作流编排',
  '调试评估',
];

export function WelcomePage({ onGoLogin }: Props) {
  return (
    <main className="app-shell">
      <Card
        className="workspace-panel"
        styles={{ body: { width: '100%' } }}
      >
        <Flex vertical gap={28}>
          <Flex gap={28} align="center" wrap="wrap">
            <Flex
              align="center"
              justify="center"
              style={{
                width: 76,
                height: 76,
                borderRadius: 8,
                background: '#18202f',
                color: '#ffffff',
                fontSize: 24,
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              MC
            </Flex>
            <Flex vertical gap={10} flex={1}>
              <Text
                type="secondary"
                style={{ color: '#0f766e', fontWeight: 700, fontSize: 14 }}
              >
                MiniCoze Web
              </Text>
              <Title
                level={1}
                style={{ margin: 0, fontSize: 'clamp(32px, 7vw, 64px)', lineHeight: 1.05 }}
              >
                可视化 AI Agent 搭建平台
              </Title>
              <Text style={{ color: '#506070', fontSize: 17, lineHeight: 1.75 }}>
                前端工程已经初始化为 React + TypeScript + Vite，可以继续接入后端接口、工作区管理和 Agent 编排页面。
              </Text>
            </Flex>
          </Flex>

          <Flex gap={12} wrap="wrap" aria-label="核心能力">
            {capabilities.map((item) => (
              <Tag
                key={item}
                style={{
                  minHeight: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 12px',
                  fontSize: 14,
                  fontWeight: 700,
                  flex: '1 1 calc(20% - 10px)',
                  minWidth: 120,
                  textAlign: 'center',
                }}
              >
                {item}
              </Tag>
            ))}
          </Flex>

          <Button
            type="primary"
            size="large"
            block
            onClick={onGoLogin}
            style={{ height: 46, fontSize: 16, fontWeight: 700 }}
          >
            进入平台
          </Button>
        </Flex>
      </Card>
    </main>
  );
}
