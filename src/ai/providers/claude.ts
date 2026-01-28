/**
 * Claude AI Provider
 * Används för: kod och text
 * 
 * NOTE: This provider is deprecated. Use @anthropic-ai/sdk instead.
 * See src/services/analysis.ts for the current implementation.
 */

import { AIProvider, AIRequest, AIResponse } from '../types';

export class ClaudeProvider {
  private apiKey: string;
  readonly provider: AIProvider = 'claude';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async complete(request: AIRequest): Promise<AIResponse> {
    try {
      // Use the newer Anthropic API version
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01', // Note: Update to latest version for production
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: request.maxTokens || 4096,
          temperature: request.temperature || 0.7,
          messages: request.messages
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Claude API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json() as {
        content: Array<{ type: string; text: string }>;
        model: string;
        usage: { input_tokens: number; output_tokens: number };
      };

      const content = data.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('\n');

      return {
        content,
        model: data.model,
        provider: this.provider,
        usage: {
          inputTokens: data.usage.input_tokens,
          outputTokens: data.usage.output_tokens
        }
      };
    } catch (error) {
      console.error('Claude API error:', error);
      throw new Error(`Claude provider failed: ${error}`);
    }
  }
}
