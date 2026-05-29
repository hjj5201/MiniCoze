import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Modal, Select, Space, Switch, Table, Tag, type TableColumnsType } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import {
  knowledgeApi,
  MetadataFieldType,
  type MetadataField,
} from '../../../api/knowledge-base';
import { metadataFieldTypeText } from '../components/labels';

type MetadataTabProps = {
  knowledgeBaseId: string;
};

type MetadataFormValues = {
  name: string;
  type: MetadataFieldType;
  description: string;
  enabled: boolean;
};

function MetadataTab({ knowledgeBaseId }: MetadataTabProps) {
  const [fields, setFields] = useState<MetadataField[]>([]);
  const [editing, setEditing] = useState<MetadataField | null>(null);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<MetadataFormValues>();

  const loadFields = useCallback(async () => {
    const response = await knowledgeApi.getMetadataFields(knowledgeBaseId);
    setFields(response.data);
  }, [knowledgeBaseId]);

  useEffect(() => {
    loadFields();
  }, [loadFields]);

  const openModal = (field?: MetadataField) => {
    setEditing(field ?? null);
    form.setFieldsValue({
      name: field?.name ?? '',
      type: field?.type ?? MetadataFieldType.String,
      description: field?.description ?? '',
      enabled: field?.enabled ?? true,
    });
    setOpen(true);
  };

  const saveField = async () => {
    const values = await form.validateFields();
    if (editing) {
      await knowledgeApi.updateMetadataField(editing.id, values);
      message.success('保存元数据字段成功');
    } else {
      await knowledgeApi.createMetadataField(knowledgeBaseId, values);
      message.success('新增元数据字段成功');
    }
    setOpen(false);
    await loadFields();
  };

  const columns: TableColumnsType<MetadataField> = [
    { title: '字段名', dataIndex: 'name' },
    { title: '字段类型', dataIndex: 'type', width: 120, render: (value: MetadataFieldType) => metadataFieldTypeText[value] },
    { title: '描述', dataIndex: 'description' },
    { title: '来源', dataIndex: 'source', width: 110, render: (value?: string) => <Tag>{value ?? 'custom'}</Tag> },
    { title: '标签', dataIndex: 'tags', width: 160, render: (tags?: string[]) => tags?.length ? tags.map((tag) => <Tag key={tag}>{tag}</Tag>) : '-' },
    { title: '更新时间', dataIndex: 'updatedAt', width: 170, render: (value?: string) => value ?? '-' },
    {
      title: '启用',
      dataIndex: 'enabled',
      width: 90,
      render: (_, record) => (
        <Switch
          checked={record.enabled}
          onChange={async (checked) => {
            await knowledgeApi.updateMetadataField(record.id, { enabled: checked });
            message.success(checked ? '元数据字段已启用' : '元数据字段已停用');
            await loadFields();
          }}
        />
      ),
    },
    {
      title: '操作',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: '删除元数据字段',
                content: `确认删除「${record.name}」吗？`,
                okText: '删除',
                cancelText: '取消',
                okButtonProps: { danger: true },
                onOk: async () => {
                  await knowledgeApi.deleteMetadataField(record.id);
                  message.success('删除元数据字段成功');
                  await loadFields();
                },
              });
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 16 }} onClick={() => openModal()}>
        新增字段
      </Button>
      <Table rowKey="id" columns={columns} dataSource={fields} pagination={false} scroll={{ x: 980 }} />
      <Modal open={open} title={editing ? '编辑元数据字段' : '新增元数据字段'} onCancel={() => setOpen(false)} onOk={saveField}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="字段名" rules={[{ required: true, message: '请输入字段名' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="字段类型">
            <Select
              options={Object.values(MetadataFieldType).map((value) => ({ value, label: metadataFieldTypeText[value] }))}
            />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="enabled" label="启用" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export { MetadataTab };
