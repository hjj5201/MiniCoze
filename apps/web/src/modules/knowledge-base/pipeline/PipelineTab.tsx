import { ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Empty, Space, Timeline } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { knowledgeApi, type PipelineTask } from '../../../api/knowledge-base';
import { pipelineStepText } from '../components/labels';
import { StatusBadge } from '../components/StatusBadge';
import styles from '../document/document.module.css';

type PipelineTabProps = {
  knowledgeBaseId: string;
};

function PipelineTab({ knowledgeBaseId }: PipelineTabProps) {
  const [tasks, setTasks] = useState<PipelineTask[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await knowledgeApi.getPipelineTasks(knowledgeBaseId);
      setTasks(response.data);
    } finally {
      setLoading(false);
    }
  }, [knowledgeBaseId]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const latest = useMemo(
    () =>
      (Object.keys(pipelineStepText) as PipelineTask['step'][]).map((step) => (
        tasks.find((task) => task.step === step) ?? {
          id: step,
          knowledgeBaseId,
          step,
          status: 'pending' as const,
          message: '等待文档进入处理流水线',
          startedAt: '',
        }
      )),
    [knowledgeBaseId, tasks],
  );

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ReloadOutlined />} loading={loading} onClick={loadTasks}>
          刷新状态
        </Button>
      </Space>
      <div className={styles.pipeline}>
        {latest.map((task) => (
          <div className={styles.pipelineNode} key={task.id}>
            <strong>{pipelineStepText[task.step]}</strong>
            <StatusBadge status={task.status} />
            <p>{task.message}</p>
            {task.startedAt ? <span>{task.endedAt ? `${task.startedAt} - ${task.endedAt}` : task.startedAt}</span> : null}
          </div>
        ))}
      </div>
      <Card title="处理日志" style={{ marginTop: 16 }}>
        {tasks.length === 0 ? (
          <Empty description="暂无流水线日志，上传文档后会自动生成处理记录。" />
        ) : (
          <Timeline
            items={tasks.map((task) => ({
              color: task.status === 'success' ? 'green' : task.status === 'failed' ? 'red' : 'blue',
              children: `${pipelineStepText[task.step]} · ${task.message} · ${task.endedAt ?? task.startedAt}`,
            }))}
          />
        )}
      </Card>
    </>
  );
}

export { PipelineTab };
