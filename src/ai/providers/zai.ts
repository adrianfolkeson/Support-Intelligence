/**
 * Z.ai Provider (GLM-4.7)
 * Används för: planering och resonemang
 * API: https://open.bigmodel.cn/api/paas/v4/chat/completions
 */

import { AIProvider, AIRequest, AIResponse } from '../types';

export class ZaiProvider {
  private apiKey: string;
  private baseURL = 'https://open.bigmodel.cn/api/paas/v4';
  readonly provider: AIProvider = 'zai';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async complete(request: AIRequest): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'glm-4-plus',
          messages: request.messages,
          max_tokens: request.maxTokens || 4096,
          temperature: request.temperature || 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Z.ai API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json() as {
        choices: Array<{ message: { content: string } }>;
        model: string;
        usage?: { prompt_tokens: number; completion_tokens: number };
      };

      return {
        content: data.choices[0].message.content,
        model: data.model,
        provider: this.provider,
        usage: {
          inputTokens: data.usage?.prompt_tokens || 0,
          outputTokens: data.usage?.completion_tokens || 0
        }
      };
    } catch (error) {
      console.error('Z.ai API error:', error);
      throw new Error(`Z.ai provider failed: ${error}`);
    }
  }
}
