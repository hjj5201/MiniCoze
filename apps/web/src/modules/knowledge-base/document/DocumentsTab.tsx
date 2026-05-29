import { DeleteOutlined, ReloadOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Modal, Space, Table, Switch, Tooltip, type TableColumnsType } from 'antd';
import type { Key } from 'react';
import { useRef, useState } from 'react';
import type { KnowledgeDocument } from '../../../api/knowledge-base';
import { StatusBadge } from '../components/StatusBadge';
import { useKnowledgeDocuments } from '../hooks/useKnowledgeDocuments';

type DocumentsTabProps = {
  knowledgeBaseId: string;
  onChanged: () => void;
  onViewChunks: (documentId: string) => void;
};

function formatSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function DocumentsTab({ knowledgeBaseId, onChanged, onViewChunks }: DocumentsTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const { loading, documents, upload, remove, reparse, setEnabled } = useKnowledgeDocuments(knowledgeBaseId, onChanged);
  const uploadTip = '支持 PDF、DOCX、TXT、Markdown、CSV、XLSX，可多选上传。';

  const handleDelete = (document: KnowledgeDocument) => {
    Modal.confirm({
      title: '删除文档',
      content: `确认删除「${document.fileName}」吗？对应分段会一并删除。`,
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        await remove(document.id);
      },
    });
  };

  const columns: TableColumnsType<KnowledgeDocument> = [
    { title: '文件名', dataIndex: 'fileName', minWidth: 220 },
    { title: '类型', dataIndex: 'fileType', width: 90 },
    { title: '大小', dataIndex: 'fileSize', width: 110, render: (value: number) => formatSize(value) },
    { title: '状态', dataIndex: 'status', width: 110, render: (_, record) => <StatusBadge status={record.status} /> },
    { title: '分段数', dataIndex: 'chunkCount', width: 100 },
    { title: '解析器', dataIndex: 'parserVersion', width: 120, render: (value?: string) => value ?? 'pipeline-v1' },
    { title: '最近解析', dataIndex: 'lastParsedAt', width: 170, render: (value?: string) => value ?? '-' },
    {
      title: '启用',
      dataIndex: 'enabled',
      width: 90,
      render: (_, record) => (
        <Switch
          checked={record.enabled}
          onChange={async (checked) => {
            await setEnabled(record.id, checked);
          }}
        />
      ),
    },
    {
      title: '操作',
      width: 260,
      render: (_, record) => (
        <Space>
          <Button onClick={() => onViewChunks(record.id)}>查看分段</Button>
          <Button icon={<ReloadOutlined />} onClick={() => reparse(record.id)}>
            重新解析
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
        </Space>
      ),
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }} wrap>
        <Tooltip title={uploadTip}>
          <Button type="primary" icon={<UploadOutlined />} onClick={() => fileInputRef.current?.click()}>
            上传文档
          </Button>
        </Tooltip>
        <Button
          disabled={selectedRowKeys.length === 0}
          onClick={async () => {
            await Promise.all(selectedRowKeys.map((id) => reparse(String(id))));
            setSelectedRowKeys([]);
          }}
        >
          批量重试
        </Button>
        <Button
          danger
          disabled={selectedRowKeys.length === 0}
          onClick={() => {
            Modal.confirm({
              title: '批量删除文档',
              content: `确认删除已选择的 ${selectedRowKeys.length} 个文档吗？`,
              okText: '删除',
              cancelText: '取消',
              okButtonProps: { danger: true },
              onOk: async () => {
                await Promise.all(selectedRowKeys.map((id) => remove(String(id))));
                setSelectedRowKeys([]);
              },
            });
          }}
        >
          批量删除
        </Button>
        <input
          ref={fileInputRef}
          hidden
          multiple
          type="file"
          accept=".pdf,.docx,.txt,.md,.csv,.xlsx"
          onChange={(event) => {
            Array.from(event.target.files ?? []).forEach((file) => void upload(file));
            event.currentTarget.value = '';
          }}
        />
      </Space>
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={documents}
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
        pagination={false}
        scroll={{ x: 980 }}
      />
    </>
  );
}

export { DocumentsTab };
