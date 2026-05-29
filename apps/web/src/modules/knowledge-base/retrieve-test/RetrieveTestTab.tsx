import { Button, Card, Form, Input, InputNumber, List, Select, Switch, Tag } from 'antd';
import {
  RetrievalMode,
} from '../../../api/knowledge-base';
import { retrievalModeText } from '../components/labels';
import { useRetrievalTest } from '../hooks/useRetrievalTest';
import styles from '../document/document.module.css';

type RetrieveTestTabProps = {
  knowledgeBaseId: string;
};

type RetrieveFormValues = {
  query: string;
  retrievalMode: RetrievalMode;
  topK: number;
  scoreThreshold: number;
  rerankEnabled: boolean;
  metadataFilterText?: string;
};

function parseFilter(value?: string) {
  if (!value?.trim()) return undefined;
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((result, line) => {
      const [key, ...rest] = line.split('=');
      if (key && rest.length > 0) result[key.trim()] = rest.join('=').trim();
      return result;
    }, {});
}

function RetrieveTestTab({ knowledgeBaseId }: RetrieveTestTabProps) {
  const { loading, results, run } = useRetrievalTest(knowledgeBaseId);

  const runTest = async (values: RetrieveFormValues) => {
    await run({
      query: values.query,
      retrievalMode: values.retrievalMode,
      topK: values.topK,
      scoreThreshold: values.scoreThreshold,
      rerankEnabled: values.rerankEnabled,
      metadataFilter: parseFilter(values.metadataFilterText),
    });
  };

  return (
    <div className={styles.twoColumn}>
      <Card title="测试配置">
        <Form<RetrieveFormValues>
          layout="vertical"
          initialValues={{
            query: '',
            retrievalMode: RetrievalMode.Hybrid,
            topK: 5,
            scoreThreshold: 0.35,
            rerankEnabled: true,
          }}
          onFinish={runTest}
        >
          <Form.Item label="用户问题" name="query" rules={[{ required: true, message: '请输入测试问题' }]}>
            <Input.TextArea rows={4} placeholder="例如：如何绑定 Agent？" />
          </Form.Item>
          <Form.Item label="检索方式" name="retrievalMode">
            <Select
              options={[
                { value: RetrievalMode.Vector, label: retrievalModeText[RetrievalMode.Vector] },
                { value: RetrievalMode.FullText, label: retrievalModeText[RetrievalMode.FullText] },
                { value: RetrievalMode.Hybrid, label: retrievalModeText[RetrievalMode.Hybrid] },
              ]}
            />
          </Form.Item>
          <Form.Item label="召回数量" name="topK">
            <InputNumber min={1} max={20} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="分数阈值" name="scoreThreshold">
            <InputNumber min={0} max={1} step={0.05} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="开启重排序" name="rerankEnabled" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item label="元数据过滤（每行 key=value）" name="metadataFilterText">
            <Input.TextArea rows={3} placeholder="category=产品" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            开始测试
          </Button>
        </Form>
      </Card>

      <Card title="召回结果">
        <List
          dataSource={results}
          locale={{ emptyText: '暂无数据' }}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={`排名 ${item.rank} · 相似度 ${item.score} · 来源文档：${item.documentName}`}
                description={`命中内容：${item.chunkContent}`}
              />
              <div className={styles.tagRow}>
                {Object.entries(item.metadata).map(([key, value]) => (
                  <Tag key={key}>
                    {key}: {String(value)}
                  </Tag>
                ))}
              </div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}

export { RetrieveTestTab };
