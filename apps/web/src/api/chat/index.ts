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

export interface SendMessageRequest {
  content: string
}
