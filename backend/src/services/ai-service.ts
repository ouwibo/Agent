import type { Env } from '../index';

const MODELS = {
  'qwen-turbo': 'qwen-turbo',
  'qwen-plus': 'qwen-plus',
  'qwen-max': 'qwen-max',
  'qwen3.5-turbo': 'qwen3.5-turbo',
  'qwen3.5-plus': 'qwen3.5-plus',
  'qwen3.5-max': 'qwen3.5-max',
};

export type ModelId = keyof typeof MODELS;

export async function callAI(
  env: Env,
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  model: ModelId = 'qwen3.5-plus',
  stream = false
): Promise<{ content: string; usage?: { prompt_tokens: number; completion_tokens: number } }> {
  const baseUrl = env.DASHSCOPE_BASE_URL || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';
  const modelId = MODELS[model] || model;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.DASHSCOPE_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': stream ? 'text/event-stream' : 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      messages,
      stream,
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`AI API error: ${response.status} - ${JSON.stringify(error)}`);
  }

  if (stream) {
    return { content: 'Streaming response not implemented' };
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
    usage?: { prompt_tokens: number; completion_tokens: number };
  };

  return {
    content: data.choices[0]?.message?.content || '',
    usage: data.usage,
  };
}

export async function analyzeWallet(
  env: Env,
  address: string,
  chain: string
): Promise<string> {
  const prompt = `Analyze this wallet address: ${address} on ${chain}. Provide insights on:
1. Token holdings
2. Recent activity
3. Risk assessment
4. Recommendations

Keep it concise and actionable.`;

  const result = await callAI(env, [{ role: 'user', content: prompt }], 'qwen3.5-plus');
  return result.content;
}

export async function explainTransaction(
  env: Env,
  txHash: string
): Promise<string> {
  const prompt = `Explain this Ethereum transaction in simple terms: ${txHash}. Include:
1. What happened
2. Who sent to whom
3. Amount/value transferred
4. Gas fees
5. Any smart contract interactions`;

  const result = await callAI(env, [{ role: 'user', content: prompt }], 'qwen3.5-plus');
  return result.content;
}

export async function suggestTrade(
  env: Env,
  tokenIn: string,
  tokenOut: string,
  amount: string
): Promise<string> {
  const prompt = `I want to swap ${amount} ${tokenIn} for ${tokenOut}. Analyze:
1. Current market conditions
2. Best DEX route
3. Slippage advice
4. Timing recommendation
5. Risk factors`;

  const result = await callAI(env, [{ role: 'user', content: prompt }], 'qwen3.5-plus');
  return result.content;
}
