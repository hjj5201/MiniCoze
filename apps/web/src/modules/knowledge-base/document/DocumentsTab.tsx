import { DeleteOutlined, ReloadOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Modal, Space, Table, Switch, Tooltip, type TableColumnsType } from 'antd';
import { useRef } from 'react';
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
  const { loading, documents, upload, remove, reparse, setEnabled } = useKnowledgeDocuments(knowledgeBaseId, onChanged);
  const uploadTip = '支持解析：PDF、DOCX、TXT、Markdown、CSV、XLSX';

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
    { title: '文件名', dataIndex: 'fileName' },
    { title: '文件类型', dataIndex: 'fileType', width: 90 },
    { title: '文件大小', dataIndex: 'fileSize', width: 110, render: (value: number) => formatSize(value) },
    { title: '状态', dataIndex: 'status', width: 110, render: (_, record) => <StatusBadge status={record.status} /> },
    { title: '分段数', dataIndex: 'chunkCount', width: 100 },
    { title: '更新时间', dataIndex: 'updatedAt', width: 170 },
    {
      title: '启用状态',
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
          <Button
            icon={<ReloadOutlined />}
            onClick={() => reparse(record.id)}
          >
            重新解析
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
        </Space>
      ),
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Tooltip title={uploadTip}>
          <Button
            type="primary"
            icon={<UploadOutlined />}
            title={uploadTip}
            onClick={() => fileInputRef.current?.click()}
          >
            上传文档
          </Button>
        </Tooltip>
        <input
          ref={fileInputRef}
          hidden
          type="file"
          accept=".pdf,.docx,.txt,.md,.csv,.xlsx"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) upload(file);
            event.currentTarget.value = '';
          }}
        />
      </Space>
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={documents}
        pagination={false}
      />
    </>
  );
}

export { DocumentsTab };
