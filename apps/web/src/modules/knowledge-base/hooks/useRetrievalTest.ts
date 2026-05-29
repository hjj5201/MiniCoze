import { message } from 'antd';
import { useCallback, useState } from 'react';
import {
  knowledgeApi,
  type RetrievalResult,
  type RetrieveTestPayload,
} from '../../../api/knowledge-base';

function useRetrievalTest(knowledgeBaseId: string) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RetrievalResult[]>([]);

  const run = useCallback(async (payload: RetrieveTestPayload) => {
    setLoading(true);
    try {
      const response = await knowledgeApi.testRetrieval(knowledgeBaseId, payload);
      setResults(response.data);
      message.success('检索测试完成');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '检索测试失败');
    } finally {
      setLoading(false);
    }
  }, [knowledgeBaseId]);

  return { loading, results, run };
}

export { useRetrievalTest };
