import { readFileSync, writeFileSync } from 'fs';

// Qwen Model Selector CLI for Zo Computer
const apiKey = process.env.DASHSCOPE_API_KEY || '';
const baseUrl = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';

if (!apiKey) {
  console.error('❌ DASHSCOPE_API_KEY not set. Add it in Settings > Advanced');
  process.exit(1);
}

const models = [
  'qwen3.6-flash',
  'qwen3.5-plus',
  'qwen3-max',
  'qwen3-max'
];

console.log('🔧 Qwen Model Selector');
console.log('Available models:');
models.forEach((m, i) => console.log(`  ${i + 1}. ${m}`));
console.log();

const modelIndex = parseInt(process.argv[2] || '0') - 1;
if (modelIndex < 0 || modelIndex >= models.length) {
  console.error('❌ Invalid model number. Choose 1-4.');
  console.log('Usage: bun run qwen-select.ts <1-4> "your prompt"');
  process.exit(1);
}

const model = models[modelIndex];
const prompt = process.argv[3] || 'Hello';

console.log(`🚀 Using model: ${model}`);
console.log(`💬 Prompt: ${prompt}`);
console.log();

const response = await fetch(`${baseUrl}/chat/completions`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model,
    messages: [{ role: 'user', content: prompt }],
  }),
});

const data = await response.json();

if (data.choices && data.choices.length > 0 && data.choices[0].message?.content) {
  console.log('✅ Response:');
  console.log(data.choices[0].message.content);
} else {
  console.log('⚠️ No response from model. Try again or check API key.');
}