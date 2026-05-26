import { http, getAuthToken } from '../http'
import { getCurrentWorkspaceId } from '../workspace'

export interface Conversation {
  id: string
  agentId: string
  agentName?: string
  title?: string
  createdAt: string
  updatedAt?: string
}

export interface ConversationDetail {
  id: string
  agentId: string
  agentName: string
  messages: Message[]
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  conversationId: string
  createdAt: string
}

export interface CreateConversationRequest {
  agentId: string
}

export interface SendMessageStreamRequest {
  agentId: string
  message: string
  conversationId?: string
}

export interface StreamCallbacks {
  onRunCreated: (conversationId: string) => void
  onChunk: (text: string) => void
  onRunCompleted: () => void
  onDone: () => void
  onError: (error: Error) => void
}

interface ApiResponse<T> {
  code: number
  data: T
}

export async function createConversation(agentId: string) {
  const res = await http.post<ApiResponse<Conversation>, CreateConversationRequest>('/conversations', { agentId })
  return res.data
}

export async function getConversation(conversationId: string) {
  const workspaceId = await getCurrentWorkspaceId()
  const res = await http.get<ApiResponse<ConversationDetail>>(`/workspaces/${workspaceId}/conversations/${conversationId}`)
  return res.data
}

export async function getConversations() {
  const workspaceId = await getCurrentWorkspaceId()
  const res = await http.get<ApiResponse<Conversation[]>>(`/workspaces/${workspaceId}/conversations`)
  return res.data ?? []
}

export async function deleteConversation(conversationId: string) {
  const workspaceId = await getCurrentWorkspaceId()
  const res = await http.delete<ApiResponse<{ id: string; deleted: boolean }>>(`/workspaces/${workspaceId}/conversations/${conversationId}`)
  return res.data
}

export async function sendMessageStream(
  params: SendMessageStreamRequest,
  callbacks: StreamCallbacks,
) {
  const { agentId, message, conversationId } = params
  const { onRunCreated, onChunk, onRunCompleted, onDone, onError } = callbacks
  const token = getAuthToken()

  try {
    const response = await fetch('/api/agent-runs/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        agentId,
        message,
        ...(conversationId ? { conversationId } : {}),
      }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      throw new Error(errorText || `HTTP ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      onDone()
      return
    }

    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    let currentEvent = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()

        if (trimmed.startsWith('event:')) {
          currentEvent = trimmed.slice(6).trim()
          continue
        }

        if (trimmed.startsWith('data:')) {
          const dataStr = trimmed.slice(5).trim()

          switch (currentEvent) {
            case 'run.created': {
              try {
                const parsed = JSON.parse(dataStr)
                if (parsed.conversationId) {
                  onRunCreated(parsed.conversationId)
                }
              } catch { }
              break
            }
            case 'message.delta': {
              try {
                const parsed = JSON.parse(dataStr)
                if (parsed.content) {
                  onChunk(parsed.content)
                }
              } catch {
                if (dataStr) onChunk(dataStr)
              }
              break
            }
            case 'run.completed': {
              try{
                const parsed = JSON.parse(dataStr)
                if(parsed.error){
                  onError(new Error(parsed.error))
                }else{
                  onRunCompleted()
                }
              } catch{
                onRunCompleted()
              }
              break
            }
            case 'stream.done': {
              onDone()
              return
            }
            default:
              break
          }
        }
      }
    }

    onDone()
  } catch (err) {
    onError(err instanceof Error ? err : new Error(String(err)))
  }
}