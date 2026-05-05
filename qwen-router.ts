import { readFileSync, writeFileSync } from 'fs';

// Multi-model Qwen Router for Zo Computer
const apiKey = process.env.DASHSCOPE_API_KEY || '';
const baseUrl = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';

if (!apiKey) {
  console.error('❌ DASHSCOPE_API_KEY not set. Add it in Settings > Advanced');
  process.exit(1);
}

const modelMap: Record<string, string> = {
  'chat': 'qwen-turbo',
  'default': 'qwen-plus',
  'crypto': 'qwen-max',
  'reasoning': 'qwen-max',
};

const task = process.argv[2] || 'default';
const prompt = process.argv[3] || 'Hello';
const model = modelMap[task] || modelMap.default;

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
  console.log(data.choices[0].message.content);
} else {
  console.log('⚠️ No response from model. Try again or check API key.');
}