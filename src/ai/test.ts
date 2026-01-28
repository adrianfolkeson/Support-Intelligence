/**
 * Testscript för AI Router
 * Kör: npm run test-ai
 */

import * as dotenv from 'dotenv';
import { getAIRouter, TaskType } from './index';
import * as path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Debug: verify key is loaded
console.log('ANTHROPIC_API_KEY loaded:', process.env.ANTHROPIC_API_KEY?.substring(0, 20) + '...');

async function testCode() {
  console.log('\n=== Test: Code (Claude) ===');
  const router = getAIRouter();

  const response = await router.route({
    messages: [
      {
        role: 'user',
        content: 'Skriv en TypeScript-funktion som summerar två tal'
      }
    ],
    taskType: 'code' as TaskType
  });

  console.log(`Provider: ${response.provider}`);
  console.log(`Model: ${response.model}`);
  console.log(`Content:\n${response.content.substring(0, 500)}...`);
}

async function testText() {
  console.log('\n=== Test: Text (Claude) ===');
  const router = getAIRouter();

  const response = await router.route({
    messages: [
      {
        role: 'user',
        content: 'Sammanfatta: Support-intelligence är ett SaaS-verktyg för att analysera supportärenden med AI.'
      }
    ],
    taskType: 'text' as TaskType
  });

  console.log(`Provider: ${response.provider}`);
  console.log(`Model: ${response.model}`);
  console.log(`Content:\n${response.content.substring(0, 500)}...`);
}

async function runAllTests() {
  try {
    console.log('Notera: Z.ai testerna är inaktiverade pga otillräcklig balans.');
    console.log('Ladda upp konto på https://open.bigmodel.cn/usercenter/balance\n');

    await testCode();
    await testText();

    console.log('\n=== Alla tester klara! ===');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

// Run tests
runAllTests();
