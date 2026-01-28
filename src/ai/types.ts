/**
 * AI Provider Types
 */

export type AIProvider = 'zai' | 'claude';

export type TaskType = 'planning' | 'reasoning' | 'code' | 'text';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIRequest {
  messages: AIMessage[];
  taskType: TaskType;
  maxTokens?: number;
  temperature?: number;
}

export interface AIResponse {
  content: string;
  model: string;
  provider: AIProvider;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}
