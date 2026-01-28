/**
 * AI Router
 * Väljer rätt provider baserat på task-typ
 *
 * Strategi:
 * - planning/reasoning → z.ai (GLM-4.7)
 * - code/text → Claude
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { AIProvider, AIRequest, AIResponse, TaskType } from './types';
import { ClaudeProvider } from './providers/claude';
import { ZaiProvider } from './providers/zai';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export class AIRouter {
  private claude: ClaudeProvider;
  private zai: ZaiProvider;

  constructor(claudeApiKey: string, zaiApiKey: string) {
    this.claude = new ClaudeProvider(claudeApiKey);
    this.zai = new ZaiProvider(zaiApiKey);
  }

  /**
   * Välj provider baserat på task-typ
   */
  private selectProvider(taskType: TaskType): AIProvider {
    switch (taskType) {
      case 'planning':
      case 'reasoning':
        return 'zai';
      case 'code':
      case 'text':
        return 'claude';
      default:
        return 'claude'; // Default till Claude
    }
  }

  /**
   * Routa request till rätt provider
   */
  async route(request: AIRequest): Promise<AIResponse> {
    const provider = this.selectProvider(request.taskType);

    console.log(`AI Router: ${request.taskType} → ${provider}`);

    switch (provider) {
      case 'claude':
        return this.claude.complete(request);
      case 'zai':
        return this.zai.complete(request);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  /**
   * Direkt access till providers (för manuellt val)
   */
  getClaude(): ClaudeProvider {
    return this.claude;
  }

  getZai(): ZaiProvider {
    return this.zai;
  }
}

// Singleton instance
let routerInstance: AIRouter | null = null;

export function initAIRouter(): AIRouter {
  const claudeKey = process.env.ANTHROPIC_API_KEY;
  const zaiKey = process.env.ZAI_API_KEY;

  if (!claudeKey) {
    throw new Error('ANTHROPIC_API_KEY not set in environment');
  }

  if (!zaiKey) {
    throw new Error('ZAI_API_KEY not set in environment');
  }

  if (!routerInstance) {
    routerInstance = new AIRouter(claudeKey, zaiKey);
  }

  return routerInstance;
}

export function getAIRouter(): AIRouter {
  if (!routerInstance) {
    return initAIRouter();
  }
  return routerInstance;
}
