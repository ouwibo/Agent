import { readFileSync, writeFileSync } from 'fs';

// Qwen API call script for Zo Computer
const apiKey = process.env.DASHSCOPE_API_KEY || '';
const baseUrl = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';

if (!apiKey) {
  console.error('❌ DASHSCOPE_API_KEY not set. Add it in Settings > Advanced');
  process.exit(1);
}

const prompt = process.argv[2] || 'Hello';

const response = await fetch(`${baseUrl}/chat/completions`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'qwen-plus',
    messages: [{ role: 'user', content: prompt }],
  }),
});

const data = await response.json();

if (data.error) {
  console.error('❌ API Error:', data.error.message);
  process.exit(1);
}

console.log(data.choices[0].message.content);