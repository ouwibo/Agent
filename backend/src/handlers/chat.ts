import type { Context } from 'hono';

type Env = {
  DASHSCOPE_API_KEY: string;
  DASHSCOPE_BASE_URL?: string;
  DEFAULT_MODEL?: string;
};

const MAX_MESSAGE_LENGTH = 10000;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function handleChat(c: Context<{ Bindings: Env }>) {
  const body = await c.req.json().catch(() => ({})) as { message?: string; model?: string };
  const message = body.message?.trim();
  
  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    return c.json({ error: 'Invalid message' }, 400);
  }

  const model = body.model || c.env.DEFAULT_MODEL || 'qwen3.5-plus';
  const baseUrl = c.env.DASHSCOPE_BASE_URL || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${c.env.DASHSCOPE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: message }],
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return c.json({ error: 'AI service error', details: error }, response.status);
    }

    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const answer = data.choices?.[0]?.message?.content || '';

    return c.json({ ok: true, model, answer, timestamp: Date.now() });
  } catch (err) {
    return c.json({ error: 'Network error' }, 500);
  }
}

export function chatOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
