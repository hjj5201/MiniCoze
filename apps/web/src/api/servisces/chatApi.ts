import { http, getAuthToken } from '../http'
import type { Conversation, ConversationDetail, CreateConversationRequest } from '../chat'

interface ApiResponse<T> {
  code: number
  data: T
}

export async function createConversation(agentId: string) {
  const res = await http.post<ApiResponse<Conversation>, CreateConversationRequest>('/conversations', { agentId })
  return res.data
}

export async function getConversation(conversationId: string) {
  const res = await http.get<ApiResponse<ConversationDetail>>(`/conversations/${conversationId}`)
  return res.data
}

export async function getConversations() {
  const res = await http.get<ApiResponse<Conversation[]>>('/conversations')
  return res.data ?? []
}

export async function deleteConversation(conversationId: string) {
  const res = await http.delete<ApiResponse<{ id: string; deleted: boolean }>>(`/conversations/${conversationId}`)
  return res.data
}

export async function sendMessageStream(
  conversationId: string,
  content: string,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: Error) => void,
) {
  const token = getAuthToken()

  try {
    const response = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ content }),
    })

    if (!response.ok) {
      throw new Error(`请求失败: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      onDone()
      return
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data:')) continue

        const dataStr = trimmed.slice(5).trim()
        if (dataStr === '[DONE]') {
          onDone()
          return
        }

        try {
          const parsed = JSON.parse(dataStr)
          if (parsed.chunk) {
            onChunk(parsed.chunk)
          }
        } catch { /* skip unparseable chunk */ }
      }
    }

    onDone()
  } catch (err) {
    onError(err instanceof Error ? err : new Error('网络请求失败'))
  }
}
