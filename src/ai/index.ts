/**
 * AI Module
 * Router för z.ai (GLM-4.7) och Claude
 *
 * Användning:
 * import { getAIRouter } from './ai';
 *
 * const router = getAIRouter();
 * const response = await router.route({
 *   messages: [{ role: 'user', content: '...' }],
 *   taskType: 'planning'
 * });
 */

export * from './types';
export * from './router';
export { ClaudeProvider } from './providers/claude';
export { ZaiProvider } from './providers/zai';
