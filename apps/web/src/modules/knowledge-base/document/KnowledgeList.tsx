import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Empty, Form, Input, InputNumber, Modal, Select, Space, Spin, Switch } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChunkMode,
  IndexMode,
  KnowledgeStatus,
  RetrievalMode,
  type KnowledgeBase,
  type UpdateKnowledgeBasePayload,
} from '../../../api/knowledge-base';
import { DraggableKnowledgeCardGrid } from '../components/DraggableKnowledgeCardGrid';
import { KbPageHeader } from '../components/KbPageHeader';
import { KnowledgeIconEditor } from '../components/KnowledgeIconEditor';
import { chunkModeText, indexModeText, retrievalModeText } from '../components/labels';
import { useKnowledgeBases } from '../hooks/useKnowledgeBases';
import styles from './document.module.css';

type EditFormValues = {
  name: string;
  description: string;
  icon: string;
  iconType?: 'emoji' | 'image';
  iconImageUrl?: string;
  indexMode: IndexMode;
  chunkMode: ChunkMode;
  embeddingModel: string;
  retrievalMode: RetrievalMode;
  topK: number;
  scoreThreshold: number;
  rerankEnabled: boolean;
};

function toUpdatePayload(values: EditFormValues): UpdateKnowledgeBasePayload {
  return {
    name: values.name,
    description: values.description,
    icon: values.icon,
    iconType: values.iconType,
    iconImageUrl: values.iconImageUrl,
    indexMode: values.indexMode,
    chunkConfig: {
      chunkMode: values.chunkMode,
      chunkSize: 800,
      chunkOverlap: 100,
      separator: '\\n\\n',
      autoClean: true,
    },
    embeddingConfig: {
      embeddingModel: values.embeddingModel,
      embeddingDimension: values.embeddingModel.includes('large') ? 3072 : 768,
      language: 'zh-CN',
    },
    retrievalConfig: {
      retrievalMode: values.retrievalMode,
      topK: values.topK,
      scoreThreshold: values.scoreThreshold,
      rerankEnabled: values.rerankEnabled,
    },
    status: KnowledgeStatus.Active,
  };
}

function KnowledgeList() {
  const navigate = useNavigate();
  const { loading, keyword, setKeyword, filteredItems, update, remove, reorder } = useKnowledgeBases();
  const [editing, setEditing] = useState<KnowledgeBase | null>(null);
  const [form] = Form.useForm<EditFormValues>();
  const icon = Form.useWatch('icon', form);
  const iconType = Form.useWatch('iconType', form);
  const iconImageUrl = Form.useWatch('iconImageUrl', form);

  const openEdit = (item: KnowledgeBase) => {
    setEditing(item);
    form.setFieldsValue({
      name: item.name,
      description: item.description,
      icon: item.icon ?? '📘',
      iconType: item.iconType ?? (item.iconImageUrl ? 'image' : 'emoji'),
      iconImageUrl: item.iconImageUrl,
      indexMode: item.indexMode,
      chunkMode: item.chunkConfig.chunkMode,
      embeddingModel: item.embeddingConfig.embeddingModel,
      retrievalMode: item.retrievalConfig.retrievalMode,
      topK: item.retrievalConfig.topK,
      scoreThreshold: item.retrievalConfig.scoreThreshold,
      rerankEnabled: item.retrievalConfig.rerankEnabled,
    });
  };

  const handleEditSave = async () => {
    if (!editing) return;
    const values = await form.validateFields();
    await update(editing.id, toUpdatePayload(values));
    setEditing(null);
  };

  const handleDelete = (item: KnowledgeBase) => {
    Modal.confirm({
      title: '删除知识库',
      content: `确认删除「${item.name}」吗？相关文档、分段和元数据会一并删除。`,
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => remove(item.id),
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <KbPageHeader
          title="知识库"
          description="管理企业 RAG 数据集，覆盖文档解析、分段、元数据、处理流水线与检索测试。"
          actions={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/knowledge/create')}>
              新建知识库
            </Button>
          }
        />

        <div className={styles.toolbar}>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="搜索知识库"
            style={{ maxWidth: 360 }}
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
        </div>

        <Spin spinning={loading}>
          {filteredItems.length === 0 ? (
            <Card>
              <Empty description="暂无数据">
                <Button type="primary" onClick={() => navigate('/knowledge/create')}>
                  创建知识库
                </Button>
              </Empty>
            </Card>
          ) : (
            <DraggableKnowledgeCardGrid
              items={filteredItems}
              onOrderChange={reorder}
              onOpen={(item) => navigate(`/knowledge/${item.id}`)}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          )}
        </Spin>

        <Modal
          title="编辑知识库"
          open={Boolean(editing)}
          onCancel={() => setEditing(null)}
          onOk={handleEditSave}
          okText="保存"
          cancelText="取消"
          width={760}
        >
          <Form form={form} layout="vertical">
            <Form.Item name="icon" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="iconType" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="iconImageUrl" hidden>
              <Input />
            </Form.Item>
            <div className={styles.iconFormLayout}>
              <KnowledgeIconEditor
                value={{ icon, iconType, iconImageUrl }}
                onChange={(value) => form.setFieldsValue(value)}
              />
              <div>
                <Form.Item name="name" label="知识库名称" rules={[{ required: true, message: '请输入知识库名称' }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="description" label="知识库描述">
                  <Input.TextArea rows={3} />
                </Form.Item>
              </div>
            </div>
            <Form.Item name="indexMode" label="索引模式">
              <Select options={Object.values(IndexMode).map((value) => ({ value, label: indexModeText[value] }))} />
            </Form.Item>
            <Form.Item name="chunkMode" label="分段模式">
              <Select options={Object.values(ChunkMode).map((value) => ({ value, label: chunkModeText[value] }))} />
            </Form.Item>
            <Form.Item name="embeddingModel" label="Embedding 模型">
              <Select
                options={[
                  { value: 'text-embedding-3-large', label: 'text-embedding-3-large' },
                  { value: 'bge-large-zh', label: 'bge-large-zh' },
                  { value: 'm3e-base', label: 'm3e-base' },
                ]}
              />
            </Form.Item>
            <Form.Item name="retrievalMode" label="检索方式">
              <Select options={Object.values(RetrievalMode).map((value) => ({ value, label: retrievalModeText[value] }))} />
            </Form.Item>
            <Space>
              <Form.Item name="topK" label="召回数量">
                <InputNumber min={1} max={20} />
              </Form.Item>
              <Form.Item name="scoreThreshold" label="分数阈值">
                <InputNumber min={0} max={1} step={0.05} />
              </Form.Item>
              <Form.Item name="rerankEnabled" label="开启重排序" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Space>
          </Form>
        </Modal>
      </div>
    </div>
  );
}

export { KnowledgeList };
