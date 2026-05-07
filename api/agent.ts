type ZoStreamEvent = {
  type: 'text' | 'thinking' | 'done' | 'error';
  content?: string;
  message?: string;
};

const DEFAULT_MODEL = 'zo:openai/gpt-5.4-mini';
const PUBLIC_MODEL_PATTERNS = [/\/gpt-5\.4-mini$/i, /\/glm-5$/i];
const REQUEST_TIMEOUT_MS = 10 * 60 * 1000;
const HEARTBEAT_MS = 8000;

const SYSTEM_PROMPT = [
  'You are OUWIBO Agent, the public AI assistant for the OuwiboAgent website.',
  'Write in Indonesian by default unless the user writes another language.',
  'Be concise, polished, and professional.',
  'Do not mention Zo cloud, account storage, internal implementation, or backend details unless the user explicitly asks about them.',
  'When giving answers, prefer clean structure, clear wording, and practical next steps.',
  'When code is requested, use fenced markdown code blocks and keep code readable.',
  'If the user asks for multiple options or the task benefits from alternatives, provide 2 to 3 distinct options clearly labeled.',
].join(' ');

type ChatMode = 'standard' | 'long' | 'multi';

function writeEvent(res: any, event: ZoStreamEvent) {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

function extractBody(req: any) {
  const body = req.body ?? {};
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
}

function extractInput(body: any) {
  const input = body?.input ?? body?.message ?? body?.q ?? '';
  return typeof input === 'string' ? input.trim() : '';
}

function normalizeModelName(modelName: unknown) {
  if (typeof modelName !== 'string') return DEFAULT_MODEL;
  const trimmed = modelName.trim();
  if (!trimmed) return DEFAULT_MODEL;
  return PUBLIC_MODEL_PATTERNS.some((pattern) => pattern.test(trimmed)) ? trimmed : DEFAULT_MODEL;
}

function normalizeMode(mode: unknown): ChatMode {
  if (typeof mode !== 'string') return 'long';
  const value = mode.trim().toLowerCase();
  if (value === 'standard' || value === 'long' || value === 'multi') return value;
  return 'long';
}

function cleanText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function buildHistoryBlock(history: unknown) {
  if (!Array.isArray(history) || history.length === 0) return 'No prior messages.';

  return history
    .slice(-16)
    .map((entry) => {
      const role = entry?.role === 'assistant' ? 'Assistant' : 'User';
      const content = cleanText(entry?.content);
      return content ? `${role}: ${content}` : '';
    })
    .filter(Boolean)
    .join('\n');
}

function modeInstructions(mode: ChatMode) {
  if (mode === 'multi') {
    return [
      'Mode: multi-answer.',
      'Give the main answer first, then provide 2 to 3 concise alternatives or approaches when relevant.',
      'Label them clearly as Opsi 1, Opsi 2, etc., or Alternatif A/B/C.',
      'Keep the wording professional and avoid unnecessary repetition.',
    ].join(' ');
  }

  if (mode === 'long') {
    return [
      'Mode: long-form.',
      'Give a complete, structured answer with helpful detail.',
      'Use short headings or bullet points only when they improve clarity.',
      'Avoid filler and keep the wording polished.',
    ].join(' ');
  }

  return [
    'Mode: standard.',
    'Answer briefly but clearly.',
    'Use a short structured reply when useful.',
  ].join(' ');
}

function buildPrompt(body: any, prompt: string, mode: ChatMode) {
  return [
    SYSTEM_PROMPT,
    '',
    modeInstructions(mode),
    '',
    'Conversation history:',
    buildHistoryBlock(body?.history),
    '',
    'Current user request:',
    prompt,
  ].join('\n');
}

function isStreamEnd(parsed: any, currentEvent: string) {
  return currentEvent === 'End' || parsed?.kind === 'end' || parsed?.kind === 'done';
}

function collectOutput(parsed: any) {
  const direct = cleanText(parsed?.data?.output ?? parsed?.output ?? parsed?.result);
  return direct;
}

function splitForLiveWriting(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return [] as string[];
  if (trimmed.length <= 48) return [trimmed];

  const chunks: string[] = [];
  const tokens = trimmed.split(/(\s+)/);
  let buffer = '';

  for (const token of tokens) {
    if (!token) continue;
    if ((buffer + token).length > 36 && buffer.trim()) {
      chunks.push(buffer);
      buffer = token;
    } else {
      buffer += token;
    }
  }

  if (buffer.trim()) chunks.push(buffer);
  return chunks.length ? chunks : [trimmed];
}

async function streamTextGradually(res: any, text: string) {
  const chunks = splitForLiveWriting(text);
  for (let i = 0; i < chunks.length; i += 1) {
    writeEvent(res, { type: 'text', content: chunks[i] });
    const delay = Math.min(40, Math.max(8, Math.round(chunks[i].length / 3)));
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ZO_API_KEY;
  if (!apiKey) return res.status(401).json({ error: 'ZO_API_KEY is not configured on the server' });

  const body = extractBody(req);
  const input = extractInput(body);
  if (!input) return res.status(400).json({ error: 'Message is required' });

  const modelName = normalizeModelName(body?.model_name ?? body?.model);
  const mode = normalizeMode(body?.mode);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let upstream: Response;
  try {
    upstream = await fetch('https://api.zo.computer/zo/ask', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      signal: controller.signal,
      body: JSON.stringify({
        input: buildPrompt(body, input, mode),
        model_name: modelName,
        stream: true,
      }),
    });
  } catch (error: any) {
    clearTimeout(timeout);
    return res.status(500).json({ error: error?.name === 'AbortError' ? 'Zo request timed out' : error?.message || 'Zo request failed' });
  }

  if (!upstream.ok || !upstream.body) {
    clearTimeout(timeout);
    const errorBody = await upstream.text().catch(() => '');
    return res.status(upstream.status).json({ error: errorBody || `Zo request failed (${upstream.status})` });
  }

  res.status(200);
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let currentEvent = '';
  let sentAnyText = false;
  let finished = false;
  let lastEmitAt = Date.now();

  const touchEmit = () => {
    lastEmitAt = Date.now();
  };

  const finish = () => {
    if (finished) return;
    finished = true;
    clearTimeout(timeout);
    clearInterval(heartbeat);
    try {
      writeEvent(res, { type: 'done' });
    } catch {}
    try {
      res.end();
    } catch {}
  };

  const heartbeat = setInterval(() => {
    if (finished) return;
    if (Date.now() - lastEmitAt < HEARTBEAT_MS) return;
    writeEvent(res, { type: 'thinking', content: 'menyusun jawaban...' });
    touchEmit();
  }, HEARTBEAT_MS);

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          currentEvent = line.slice(7).trim();
          continue;
        }

        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6).trim();
        if (!raw) continue;

        let parsed: any = null;
        try {
          parsed = JSON.parse(raw);
        } catch {
          continue;
        }

        if (parsed?.kind === 'request') continue;

        if (parsed?.kind === 'error' || currentEvent === 'Error') {
          writeEvent(res, { type: 'error', message: parsed?.message || parsed?.error || 'Zo returned an error' });
          finish();
          return;
        }

        if (parsed?.kind === 'response' && Array.isArray(parsed.parts)) {
          for (const part of parsed.parts) {
            const content = cleanText(part?.content);
            if (!content) continue;
            if (part?.part_kind === 'thinking' || part?.part_delta_kind === 'thinking') {
              writeEvent(res, { type: 'thinking', content });
              touchEmit();
            } else if (part?.part_kind === 'text' || part?.part_delta_kind === 'text') {
              writeEvent(res, { type: 'text', content });
              sentAnyText = true;
              touchEmit();
            }
          }
          continue;
        }

        if (parsed?.part_delta_kind === 'thinking' || parsed?.kind === 'thinking') {
          const content = cleanText(parsed?.content ?? parsed?.delta);
          if (content) {
            writeEvent(res, { type: 'thinking', content });
            touchEmit();
          }
          continue;
        }

        if (parsed?.part_delta_kind === 'text') {
          const content = cleanText(parsed?.content ?? parsed?.delta);
          if (content) {
            writeEvent(res, { type: 'text', content });
            sentAnyText = true;
            touchEmit();
          }
          continue;
        }

        const output = collectOutput(parsed);
        if (isStreamEnd(parsed, currentEvent) && output) {
          if (!sentAnyText) {
            await streamTextGradually(res, output);
          } else {
            writeEvent(res, { type: 'text', content: output });
          }
          finish();
          return;
        }

        const content = cleanText(parsed?.content);
        if (content) {
          const type = parsed?.part_kind === 'thinking' ? 'thinking' : 'text';
          writeEvent(res, { type, content });
          if (type === 'text') sentAnyText = true;
          touchEmit();
        }
      }
    }

    finish();
  } catch (error: any) {
    clearTimeout(timeout);
    clearInterval(heartbeat);
    writeEvent(res, { type: 'error', message: error?.message || 'Streaming failed' });
    finish();
  }
}
