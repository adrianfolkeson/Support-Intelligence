require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function test() {
  try {
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Say hi' }],
    });
    console.log('✅ SUCCESS! API key is working.');
    console.log('Credits are active.');
    console.log('Response:', response.content[0].text);
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    if (error.message.includes('credit balance')) {
      console.log('\n💡 Credits not yet active. Solutions:');
      console.log('1. Wait 1-2 minutes for credits to propagate');
      console.log('2. Check you added credits to the correct account');
      console.log('3. Verify at: https://console.anthropic.com/settings/plans');
    }
  }
}

test();
