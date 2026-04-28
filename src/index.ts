import { defaultModel, modelCatalog, resolveModel, getModelRotation, isModelId } from "./models";

type ChatMessage = {
  role: string;
  content: string;
};

type RequestPayload = {
  message?: string;
  messages?: ChatMessage[];
  model?: string;
  mode?: string;
  sessionId?: string;
  stream?: boolean;
};

type Env = {
  DASHSCOPE_API_KEY: string;
  DASHSCOPE_BASE_URL?: string;
  DEFAULT_MODEL?: string;
  KV: KVNamespace;
};

type ConversationRecord = {
  sessionId: string;
  messages: ChatMessage[];
  updatedAt: number;
};

const SESSION_KEY = "ouwibo_session_id";
const HISTORY_TTL_SECONDS = 60 * 60 * 24 * 30;
const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX = 30;
const MAX_MESSAGE_LENGTH = 6000;
const HISTORY_LIMIT = 24;

const ALLOWED_MODEL_SET = new Set(modelCatalog.map((m) => m.id));

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

function withCors(headers: HeadersInit = {}): Headers {
  return new Headers({
    ...CORS_HEADERS,
    ...headers,
  });
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: withCors({ "Content-Type": "application/json; charset=utf-8" }),
  });
}

function textResponse(text: string, contentType = "text/plain; charset=utf-8", status = 200): Response {
  return new Response(text, {
    status,
    headers: withCors({ "Content-Type": contentType }),
  });
}

function svgResponse(svg: string): Response {
  return new Response(svg, {
    headers: withCors({ "Content-Type": "image/svg+xml; charset=utf-8" }),
  });
}

function getBaseUrl(request: Request): string {
  const url = new URL(request.url);
  return url.origin.replace(/\/$/, "");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function trimAndValidateMessage(message: unknown): string | null {
  if (typeof message !== "string") return null;
  const normalized = message.replace(/\u0000/g, "").trim();
  if (!normalized) return null;
  if (normalized.length > MAX_MESSAGE_LENGTH) return null;
  return normalized;
}

function getClientIp(request: Request): string {
  return request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function getDefaultModel(env: Env): string {
  const configured = env.DEFAULT_MODEL?.trim();
  if (configured && ALLOWED_MODEL_SET.has(configured as (typeof modelCatalog)[number]["id"])) {
    return configured;
  }
  return defaultModel;
}

function resolveChatModel(payload: RequestPayload, env: Env): { model: string } | { error: string; status: number } {
  const mode = payload.mode?.trim().toLowerCase();
  const requested = payload.model?.trim();

  if (mode === "auto" || requested === "auto") {
    return { model: getModelRotation() };
  }

  if (requested && !isModelId(requested)) {
    return { error: "Invalid model name", status: 400 };
  }

  if (requested && isModelId(requested)) {
    return { model: requested };
  }

  return { model: getDefaultModel(env) };
}

async function parseJsonPayload(request: Request): Promise<RequestPayload | null> {
  try {
    const data: unknown = await request.json();
    if (!data || typeof data !== "object") return null;
    return data as RequestPayload;
  } catch {
    return null;
  }
}

function getSessionId(payload: RequestPayload): string {
  const sessionId = payload.sessionId?.trim();
  return sessionId || crypto.randomUUID();
}

async function loadConversation(env: Env, sessionId: string): Promise<ConversationRecord> {
  const key = `chat:${sessionId}`;
  const raw = await env.KV.get(key);
  if (!raw) {
    return { sessionId, messages: [], updatedAt: Date.now() };
  }

  try {
    const parsed = JSON.parse(raw) as ConversationRecord;
    if (!parsed || !Array.isArray(parsed.messages)) {
      return { sessionId, messages: [], updatedAt: Date.now() };
    }
    return {
      sessionId,
      messages: parsed.messages.filter((message) => typeof message.content === "string" && message.content.length > 0).slice(-HISTORY_LIMIT),
      updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : Date.now(),
    };
  } catch {
    return { sessionId, messages: [], updatedAt: Date.now() };
  }
}

async function saveConversation(env: Env, record: ConversationRecord): Promise<void> {
  const key = `chat:${record.sessionId}`;
  await env.KV.put(key, JSON.stringify(record), {
    expirationTtl: HISTORY_TTL_SECONDS,
  });
}

async function clearConversation(env: Env, sessionId: string): Promise<void> {
  await env.KV.delete(`chat:${sessionId}`);
}

function clampHistory(messages: ChatMessage[]): ChatMessage[] {
  return messages.filter((message) => message.role !== "system").slice(-HISTORY_LIMIT);
}

function buildUpstreamMessages(history: ChatMessage[], userMessage: string): ChatMessage[] {
  return [
    ...clampHistory(history),
    { role: "user", content: userMessage },
  ];
}

async function rateLimit(env: Env, request: Request): Promise<{ allowed: true } | { allowed: false; retryAfter: number }> {
  const ip = getClientIp(request);
  const bucket = Math.floor(Date.now() / (RATE_LIMIT_WINDOW_SECONDS * 1000));
  const key = `rl:${ip}:${bucket}`;
  const raw = await env.KV.get(key);
  const nextCount = (raw ? Number(raw) || 0 : 0) + 1;

  await env.KV.put(key, String(nextCount), {
    expirationTtl: RATE_LIMIT_WINDOW_SECONDS + 5,
  });

  if (nextCount > RATE_LIMIT_MAX) {
    return { allowed: false, retryAfter: RATE_LIMIT_WINDOW_SECONDS };
  }

  return { allowed: true };
}

async function fetchDashScope(env: Env, model: string, messages: ChatMessage[], stream: boolean): Promise<Response> {
  const baseUrl = (env.DASHSCOPE_BASE_URL || "https://dashscope-intl.aliyuncs.com/compatible-mode/v1").replace(/\/$/, "");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    return await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.DASHSCOPE_API_KEY}`,
        "Content-Type": "application/json",
        Accept: stream ? "text/event-stream" : "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        stream,
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function extractAssistantText(data: unknown): string {
  const asRecord = data as {
    choices?: Array<{ message?: { content?: string }; delta?: { content?: string } }>;
    output?: { text?: string };
    text?: string;
  };

  const choiceMessage = asRecord.choices?.[0]?.message?.content;
  if (typeof choiceMessage === "string" && choiceMessage.trim()) return choiceMessage;
  const delta = asRecord.choices?.[0]?.delta?.content;
  if (typeof delta === "string" && delta.trim()) return delta;
  if (typeof asRecord.output?.text === "string" && asRecord.output.text.trim()) return asRecord.output.text;
  if (typeof asRecord.text === "string" && asRecord.text.trim()) return asRecord.text;
  return "";
}

function humanizeUpstreamError(status: number, data: unknown): string {
  const message = (data as { error?: { message?: string }; message?: string })?.error?.message || (data as { message?: string })?.message || "";

  if (status === 401) return "Authentication failed. Please check the DashScope API key.";
  if (status === 404) return "The selected model is unavailable or not enabled for this key.";
  if (status === 429) return "The provider rate limited this request. Please try again shortly.";
  if (status >= 500) return "The model provider is temporarily unavailable.";
  if (message) return message;
  return "The request could not be completed.";
}

async function collectStreamingText(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let result = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;

      try {
        const parsed = JSON.parse(payload) as {
          choices?: Array<{ delta?: { content?: string }; message?: { content?: string } }>;
          output?: { text?: string };
          text?: string;
        };
        const delta = parsed.choices?.[0]?.delta?.content ?? parsed.choices?.[0]?.message?.content ?? parsed.output?.text ?? parsed.text ?? "";
        if (typeof delta === "string") {
          result += delta;
        }
      } catch {
        continue;
      }
    }
  }

  return result;
}

function buildFaviconSvg(): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
      <rect width="64" height="64" rx="16" fill="#0a0a0b"/>
      <circle cx="32" cy="32" r="16" fill="#f0a500"/>
      <path d="M27 25l10 7-10 7V25z" fill="#0a0a0b"/>
    </svg>
  `.trim();
}

function buildOgImageSvg(baseUrl: string): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" fill="none">
      <rect width="1200" height="630" fill="#0a0a0b"/>
      <rect x="48" y="48" width="1104" height="534" rx="34" fill="#111113" stroke="#2a2a31"/>
      <circle cx="112" cy="112" r="14" fill="#f0a500"/>
      <text x="112" y="184" fill="#f0ede8" font-family="Inter, Arial, sans-serif" font-size="72" font-weight="700">Ouwibo Agent</text>
      <text x="112" y="246" fill="#9d9a94" font-family="Inter, Arial, sans-serif" font-size="28">Public AI assistant for a premium brand experience</text>
      <text x="112" y="324" fill="#f0a500" font-family="JetBrains Mono, monospace" font-size="22">${escapeHtml(baseUrl)}</text>
      <rect x="112" y="372" width="976" height="120" rx="22" fill="#18181c" stroke="#2a2a31"/>
      <text x="146" y="425" fill="#f0ede8" font-family="JetBrains Mono, monospace" font-size="24">Chat memory · Model selection · Streaming responses · Rate limiting</text>
      <text x="146" y="462" fill="#9d9a94" font-family="JetBrains Mono, monospace" font-size="20">Cloudflare-ready full stack agent</text>
    </svg>
  `.trim();
}

function buildRobotsTxt(baseUrl: string): string {
  return `User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`;
}

function buildSitemap(baseUrl: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${baseUrl}/</loc></url>
  <url><loc>${baseUrl}/health</loc></url>
  <url><loc>${baseUrl}/api/models</loc></url>
</urlset>`;
}

function htmlPage(baseUrl: string): string {
  const title = "Ouwibo Agent";
  const description = "Ouwibo Agent is a branded public AI assistant with chat memory, streaming responses, model selection, and a Cloudflare-ready backend.";
  const canonical = `${baseUrl}/`;
  const ogImage = `${baseUrl}/og-image.svg`;
  const favicon = `${baseUrl}/favicon.svg`;
  const modelsHtml = modelCatalog
    .map((model) => `<button class="pill" data-model="${escapeHtml(model.id)}" type="button">${escapeHtml(model.label)}</button>`)
    .join("");
  const suggestionsHtml = [
    "Explain Ouwibo Agent in simple terms",
    "Write a Python web scraper",
    "Summarize the latest AI news",
    "Help me debug my code",
  ]
    .map((item) => `<button class="suggestion" data-suggest="${escapeHtml(item)}" type="button">${escapeHtml(item)}</button>`)
    .join("");

  const modelInfo = modelCatalog
    .map(
      (model) => `<li><code>${escapeHtml(model.id)}</code> — ${escapeHtml(model.purpose)}</li>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="robots" content="index,follow">
<link rel="canonical" href="${canonical}">
<link rel="icon" href="${favicon}" type="image/svg+xml">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogImage}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${ogImage}">
<meta name="theme-color" content="#0a0a0b">
<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: title,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description,
    url: canonical,
  })}</script>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; min-height: 100%; }
  body {
    background:
      radial-gradient(circle at top, rgba(240,165,0,0.10), transparent 30%),
      linear-gradient(180deg, #0a0a0b 0%, #101013 100%);
    color: #f0ede8;
    font-family: 'Syne', sans-serif;
  }
  a { color: inherit; }
  .app {
    min-height: 100vh;
    max-width: 1160px;
    margin: 0 auto;
    padding: 0 20px 28px;
  }
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 22px 0 18px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .brand { display: flex; align-items: center; gap: 12px; }
  .brand-mark {
    width: 40px; height: 40px; border-radius: 12px;
    background: linear-gradient(135deg, #f0a500, #ffc340);
    display: grid; place-items: center; color: #0a0a0b; font-weight: 800;
  }
  .brand h1 { margin: 0; font-size: 18px; letter-spacing: -0.02em; }
  .brand p { margin: 2px 0 0; color: #9d9a94; font-size: 12px; }
  .status { color: #9d9a94; font-size: 12px; display: flex; align-items: center; gap: 8px; }
  .status::before { content: ''; width: 8px; height: 8px; border-radius: 999px; background: #3ecf6e; box-shadow: 0 0 8px #3ecf6e; }
  .hero {
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    gap: 18px;
    margin-top: 22px;
    align-items: stretch;
  }
  .card, .chat-shell, .info-card {
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(17,17,19,0.78);
    backdrop-filter: blur(18px);
    border-radius: 24px;
    box-shadow: 0 24px 80px rgba(0,0,0,0.28);
  }
  .card { padding: 28px; }
  .eyebrow {
    text-transform: uppercase; letter-spacing: .22em; font-size: 11px; color: #9d9a94;
  }
  .hero h2 { margin: 12px 0 12px; font-size: clamp(36px, 6vw, 68px); line-height: 0.95; letter-spacing: -0.05em; }
  .lead { margin: 0; color: #d1ccc4; font-size: 17px; line-height: 1.75; max-width: 62ch; }
  .cta-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 22px; }
  .button {
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 999px;
    padding: 11px 16px;
    background: rgba(255,255,255,0.04);
    color: #f0ede8;
    font: inherit;
    font-size: 14px;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: transform .18s ease, border-color .18s ease, background .18s ease;
  }
  .button:hover { transform: translateY(-1px); border-color: rgba(240,165,0,0.6); }
  .button.primary { background: linear-gradient(135deg, #f0a500, #ffc340); color: #0a0a0b; border-color: transparent; font-weight: 700; }
  .meta-grid { display: grid; gap: 12px; }
  .meta-box { padding: 16px; border-radius: 18px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); }
  .meta-box strong { display: block; margin-bottom: 4px; font-size: 15px; }
  .meta-box span { color: #9d9a94; font-size: 13px; line-height: 1.55; }
  .sections { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 18px; }
  .info-card { padding: 22px; }
  .info-card h3 { margin: 0 0 10px; font-size: 18px; }
  .info-card p { margin: 0; color: #d1ccc4; line-height: 1.7; font-size: 14px; }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
  .chip {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 12px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04); color: #d1ccc4; font-size: 13px;
  }
  .chip code { font-family: 'JetBrains Mono', monospace; color: #ffc340; }
  .chat-shell { margin-top: 18px; padding: 18px; }
  .chat-head { display: flex; justify-content: space-between; gap: 12px; align-items: start; }
  .chat-head h3 { margin: 0; font-size: 18px; }
  .chat-head p { margin: 6px 0 0; color: #9d9a94; font-size: 13px; line-height: 1.6; }
  .mode-row, .model-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px; }
  .pill {
    border: 1px solid rgba(255,255,255,0.10);
    background: rgba(255,255,255,0.04);
    color: #d1ccc4;
    border-radius: 999px;
    padding: 7px 12px;
    font: inherit;
    font-size: 12px;
    font-family: 'JetBrains Mono', monospace;
    cursor: pointer;
  }
  .pill.active { background: rgba(240,165,0,0.13); border-color: rgba(240,165,0,0.6); color: #ffc340; }
  .chat-log {
    margin-top: 16px;
    min-height: 280px;
    max-height: 440px;
    overflow-y: auto;
    padding-right: 2px;
    scroll-behavior: smooth;
    display: grid;
    gap: 12px;
  }
  .message { display: grid; gap: 6px; }
  .message.user { justify-items: end; }
  .bubble {
    max-width: 92%;
    padding: 14px 15px;
    border-radius: 18px;
    line-height: 1.7;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  .message.user .bubble {
    background: linear-gradient(135deg, rgba(240,165,0,0.18), rgba(255,195,64,0.08));
    border: 1px solid rgba(240,165,0,0.26);
  }
  .message.assistant .bubble {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
  }
  .meta { font-size: 11px; color: #9d9a94; font-family: 'JetBrains Mono', monospace; }
  .compose { display: grid; grid-template-columns: 1fr auto; gap: 10px; margin-top: 14px; }
  .input {
    width: 100%;
    min-height: 52px;
    resize: vertical;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.10);
    background: rgba(255,255,255,0.04);
    color: #f0ede8;
    padding: 14px 16px;
    font: inherit;
    outline: none;
  }
  .input:focus { border-color: rgba(240,165,0,0.75); box-shadow: 0 0 0 3px rgba(240,165,0,0.12); }
  .send {
    border: 0;
    border-radius: 14px;
    padding: 0 18px;
    min-width: 92px;
    background: linear-gradient(135deg, #f0a500, #ffc340);
    color: #0a0a0b;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }
  .send:disabled { opacity: 0.6; cursor: not-allowed; }
  .statusline { margin-top: 10px; color: #9d9a94; font-size: 12px; }
  .bullets { margin-top: 12px; color: #d1ccc4; font-size: 14px; line-height: 1.8; }
  .bullets code { font-family: 'JetBrains Mono', monospace; color: #ffc340; }
  .models-list { margin: 0; padding-left: 18px; color: #d1ccc4; line-height: 1.8; }
  footer { padding: 18px 0 4px; color: #7f7a73; font-size: 12px; }
  @media (max-width: 920px) {
    .hero, .sections { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>
  <div class="app">
    <header>
      <div class="brand">
        <div class="brand-mark">O</div>
        <div>
          <h1>Ouwibo Agent</h1>
          <p>Public AI assistant · Cloudflare-ready · brand-first</p>
        </div>
      </div>
      <div class="status">online</div>
    </header>

    <section class="hero">
      <div class="card">
        <div class="eyebrow">Brand / Agent / Full stack</div>
        <h2>Ouwibo Agent is your public AI front door.</h2>
        <p class="lead">
          A polished agent website with conversation memory, streaming responses, manual model choice, and automatic rotation.
          The brand stays on the surface, while the backend handles the logic behind the scenes.
        </p>
        <div class="cta-row">
          <a class="button primary" href="#chat">Try the chat</a>
          <a class="button" href="#api">API details</a>
          <a class="button" href="#models">Model routing</a>
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-box">
          <strong>What it does</strong>
          <span>Answers questions, keeps conversation history, and uses a safe system persona so the experience feels consistent.</span>
        </div>
        <div class="meta-box">
          <strong>Auto rotate</strong>
          <span>When auto mode is enabled, the backend rotates models in a predictable round-robin cycle by time window.</span>
        </div>
        <div class="meta-box">
          <strong>Protection</strong>
          <span>Rate limiting, input validation, CORS, and user-friendly error messages are built in.</span>
        </div>
      </div>
    </section>

    <section class="sections">
      <div class="info-card" id="what">
        <h3>What Ouwibo Agent actually is</h3>
        <p>
          It is a branded public AI assistant experience for your own website. Visitors see Ouwibo Agent, not vendor noise.
          The backend keeps memory, chooses the model, and handles delivery cleanly.
        </p>
        <div class="chips">
          <span class="chip"><code>public</code> website</span>
          <span class="chip"><code>memory</code> enabled</span>
          <span class="chip"><code>streaming</code> replies</span>
          <span class="chip"><code>Cloudflare</code> deployment</span>
        </div>
      </div>

      <div class="info-card" id="models">
        <h3>Supported models</h3>
        <ul class="models-list">
          ${modelInfo}
        </ul>
        <div class="bullets">
          <div>• <code>auto</code> mode rotates through the catalog.</div>
          <div>• Manual selection uses the chosen model directly.</div>
          <div>• Invalid model names return a clear <code>400</code> error.</div>
        </div>
      </div>
    </section>

    <section class="chat-shell" id="chat">
      <div class="chat-head">
        <div>
          <h3>Live chat demo</h3>
          <p>Messages are stored per session, streamed on reply, and rendered with markdown.</p>
        </div>
        <div class="meta" id="session-label">session</div>
      </div>

      <div class="mode-row">
        <button class="pill active" data-mode="auto" type="button">Auto rotate</button>
        <button class="pill" data-mode="manual" type="button">Manual select</button>
      </div>

      <div class="model-row" id="model-row">
        ${modelsHtml}
      </div>

      <div class="chat-log" id="chat-log" aria-live="polite"></div>

      <form class="compose" id="chat-form">
        <textarea id="chat-input" class="input" rows="2" maxlength="6000" placeholder="Ask Ouwibo Agent anything..."></textarea>
        <button id="send-btn" class="send" type="submit">Send</button>
      </form>
      <div class="statusline" id="chat-status">Ready.</div>
    </section>

    <section class="sections" id="api">
      <div class="info-card">
        <h3>API surface</h3>
        <p>
          A small, full-stack API keeps the product easy to extend and easy to deploy.
        </p>
        <div class="bullets">
          <div><code>GET /health</code> — service status and models.</div>
          <div><code>GET /api/models</code> — model catalog and auto-rotate docs.</div>
          <div><code>GET /api/history?sessionId=...</code> — load conversation memory.</div>
          <div><code>POST /api/chat</code> — send messages with optional streaming.</div>
          <div><code>DELETE /api/history?sessionId=...</code> — clear one session.</div>
        </div>
      </div>

      <div class="info-card">
        <h3>Why this is full stack</h3>
        <p>
          The public page handles the interface, the Worker handles the API, the KV store handles memory and rate limiting,
          and DashScope handles generation. That is enough to feel like a real production agent, not just a demo page.
        </p>
      </div>
    </section>

    <footer>Ouwibo Agent · Public website for your own brand</footer>
  </div>

  <script>
    (function() {
      const SESSION_KEY = '${SESSION_KEY}';
      const sessionId = localStorage.getItem(SESSION_KEY) || crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, sessionId);

      const chatLog = document.getElementById('chat-log');
      const chatForm = document.getElementById('chat-form');
      const chatInput = document.getElementById('chat-input');
      const chatStatus = document.getElementById('chat-status');
      const sendBtn = document.getElementById('send-btn');
      const sessionLabel = document.getElementById('session-label');
      const modeButtons = Array.from(document.querySelectorAll('[data-mode]'));
      const modelButtons = Array.from(document.querySelectorAll('[data-model]'));
      const modelRow = document.getElementById('model-row');
      const clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.className = 'button';
      clearBtn.textContent = 'Clear chat';
      clearBtn.style.marginTop = '12px';
      document.getElementById('chat').appendChild(clearBtn);

      sessionLabel.textContent = sessionId.slice(0, 8);

      let selectedMode = 'auto';
      let selectedModel = '${defaultModel}';
      let streamingBubble = null;

      function setStatus(text) {
        chatStatus.textContent = text;
      }

      function scrollToBottom() {
        chatLog.scrollTo({ top: chatLog.scrollHeight, behavior: 'smooth' });
      }

      function timeLabel(date = new Date()) {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      }

      function escapeText(text) {
        return text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

      function sanitizeRenderedHtml(html) {
        const template = document.createElement('template');
        template.innerHTML = html;
        template.content.querySelectorAll('script, iframe, object, embed').forEach((node) => node.remove());
        template.content.querySelectorAll('*').forEach((element) => {
          Array.from(element.attributes).forEach((attr) => {
            const name = attr.name.toLowerCase();
            const value = attr.value.toLowerCase();
            if (name.startsWith('on') || value.startsWith('javascript:')) {
              element.removeAttribute(attr.name);
            }
          });
        });
        return template.innerHTML;
      }

      function markdownToHtml(text) {
        if (window.marked) {
          const raw = window.marked.parse(text, { breaks: true, gfm: true });
          return sanitizeRenderedHtml(raw);
        }
        return escapeText(text).replace(/\n/g, '<br>');
      }

      function renderAssistantBubble(bubble, text) {
        bubble.innerHTML = markdownToHtml(text);
      }

      function appendMessage(role, text, timestamp = timeLabel(), isMarkdown = false) {
        const row = document.createElement('div');
        row.className = 'message ' + role;

        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        if (role === 'user') {
          bubble.textContent = text;
        } else if (isMarkdown) {
          renderAssistantBubble(bubble, text);
        } else {
          bubble.textContent = text;
        }

        const meta = document.createElement('div');
        meta.className = 'meta';
        meta.textContent = (role === 'user' ? 'You' : 'Ouwibo Agent') + ' · ' + timestamp;

        row.appendChild(bubble);
        row.appendChild(meta);
        chatLog.appendChild(row);
        scrollToBottom();
        return bubble;
      }

      function setBusy(busy) {
        sendBtn.disabled = busy;
        chatInput.disabled = busy;
        setStatus(busy ? 'Thinking...' : 'Ready.');
      }

      function setMode(mode) {
        selectedMode = mode;
        modeButtons.forEach((button) => {
          button.classList.toggle('active', button.dataset.mode === mode);
        });
        modelRow.style.opacity = mode === 'auto' ? '0.55' : '1';
        modelRow.style.pointerEvents = mode === 'auto' ? 'none' : 'auto';
        setStatus(mode === 'auto' ? 'Auto mode rotates models every minute.' : 'Manual mode uses your selected model.');
      }

      function setModel(model) {
        selectedModel = model;
        modelButtons.forEach((button) => {
          button.classList.toggle('active', button.dataset.model === model);
        });
      }

      async function loadHistory() {
        try {
          const response = await fetch('/api/history?sessionId=' + encodeURIComponent(sessionId), {
            headers: { Accept: 'application/json' },
          });
          const data = await response.json();
          chatLog.innerHTML = '';
          const messages = Array.isArray(data.messages) ? data.messages : [];
          if (messages.length === 0) {
            appendMessage('assistant', 'Hello, I\'m Ouwibo Agent — your public AI assistant. Ask me anything.', timeLabel(), true);
            return;
          }
          messages.forEach((message) => {
            const role = message.role === 'assistant' ? 'assistant' : 'user';
            appendMessage(role, String(message.content || ''), timeLabel(), role === 'assistant');
          });
        } catch (error) {
          chatLog.innerHTML = '';
          appendMessage('assistant', 'Hello, I\'m Ouwibo Agent — your public AI assistant. Ask me anything.', timeLabel(), true);
        }
      }

      async function submitMessage(event) {
        event.preventDefault();
        const message = chatInput.value.trim();
        if (!message) {
          setStatus('Please type a message first.');
          return;
        }
        if (message.length > 6000) {
          setStatus('Message is too long. Keep it under 6000 characters.');
          return;
        }

        appendMessage('user', message, timeLabel());
        chatInput.value = '';
        setBusy(true);

        const assistantBubble = appendMessage('assistant', '', timeLabel());
        assistantBubble.textContent = 'Thinking...';
        streamingBubble = assistantBubble;

        try {
          const body = {
            message,
            sessionId,
            stream: true,
          };

          if (selectedMode === 'auto') {
            body.mode = 'auto';
          } else {
            body.model = selectedModel;
          }

          const response = await fetch('/api/chat?stream=1', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'text/event-stream, application/json',
            },
            body: JSON.stringify(body),
          });

          const contentType = response.headers.get('content-type') || '';
          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            const friendly = data.message || data.error || 'Something went wrong.';
            assistantBubble.innerHTML = '<span style="color:#ffc340">Error:</span> ' + escapeText(String(friendly));
            setStatus('Request failed.');
            return;
          }

          if (contentType.includes('text/event-stream') && response.body) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let text = '';
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split(/\r?\n/);
              buffer = lines.pop() || '';
              for (const line of lines) {
                if (!line.startsWith('data:')) continue;
                const payload = line.slice(5).trim();
                if (!payload || payload === '[DONE]') continue;
                try {
                  const parsed = JSON.parse(payload);
                  const delta = parsed.choices?.[0]?.delta?.content || parsed.choices?.[0]?.message?.content || parsed.output?.text || parsed.text || '';
                  if (typeof delta === 'string' && delta) {
                    text += delta;
                    renderAssistantBubble(assistantBubble, text);
                    scrollToBottom();
                  }
                } catch {
                }
              }
            }
            if (!text) {
              assistantBubble.innerHTML = '<span style="color:#9d9a94">No content returned.</span>';
            }
          } else {
            const data = await response.json();
            const answer = data.answer || data.message || 'No answer returned.';
            renderAssistantBubble(assistantBubble, String(answer));
          }

          setStatus('Response received.');
          await loadHistory();
        } catch (error) {
          assistantBubble.innerHTML = '<span style="color:#ffc340">Error:</span> Network or provider issue. Please try again.';
          setStatus('Network error.');
        } finally {
          setBusy(false);
          chatInput.focus();
          streamingBubble = null;
        }
      }

      async function clearHistory() {
        try {
          await fetch('/api/history?sessionId=' + encodeURIComponent(sessionId), { method: 'DELETE' });
        } catch (error) {}
        chatLog.innerHTML = '';
        appendMessage('assistant', 'Chat cleared. Start a fresh conversation.', timeLabel(), true);
        setStatus('Chat cleared.');
      }

      modeButtons.forEach((button) => {
        button.addEventListener('click', () => setMode(button.dataset.mode));
      });

      modelButtons.forEach((button) => {
        button.addEventListener('click', () => setModel(button.dataset.model));
      });

      chatForm.addEventListener('submit', submitMessage);
      clearBtn.addEventListener('click', clearHistory);
      chatInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          chatForm.requestSubmit();
        }
      });

      setMode('auto');
      setModel('${defaultModel}');
      loadHistory();
      appendMessage('assistant', 'Hello, I\'m Ouwibo Agent — your intelligent assistant.', timeLabel(), true);

      window.addEventListener('beforeunload', () => {
        if (streamingBubble) {
          streamingBubble = null;
        }
      });
    })();
  </script>
</body>
</html>`;
}

async function handleChat(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (!env.DASHSCOPE_API_KEY) {
    return jsonResponse({ error: "Missing configuration", message: "DASHSCOPE_API_KEY is not configured." }, 500);
  }

  const payload = await parseJsonPayload(request);
  if (!payload) {
    return jsonResponse({ error: "Invalid JSON", message: "Request body must be valid JSON." }, 400);
  }

  const userMessage = trimAndValidateMessage(payload.message ?? payload.messages?.at(-1)?.content);
  if (!userMessage) {
    return jsonResponse({ error: "message is required", message: "Please provide a non-empty message under 6000 characters." }, 400);
  }

  const modelResult = resolveChatModel(payload, env);
  if ("error" in modelResult) {
    return jsonResponse({ error: modelResult.error, message: "Choose a valid model or use auto mode." }, modelResult.status);
  }

  const rate = await rateLimit(env, request);
  if (!rate.allowed) {
    return jsonResponse({ error: "Rate limit exceeded", message: "Too many requests from this IP. Please try again in a minute." }, 429);
  }

  const sessionId = getSessionId(payload);
  const wantsStream = payload.stream === true || new URL(request.url).searchParams.get("stream") === "1" || request.headers.get("accept")?.includes("text/event-stream") === true;
  const conversation = await loadConversation(env, sessionId);
  const upstreamMessages = buildUpstreamMessages(conversation.messages, userMessage);

  const upstream = await fetchDashScope(env, modelResult.model, upstreamMessages, wantsStream);
  let upstreamData: unknown = null;

  if (!upstream.ok && !wantsStream) {
    upstreamData = await upstream.json().catch(() => ({}));
    return jsonResponse(
      {
        error: "Upstream request failed",
        message: humanizeUpstreamError(upstream.status, upstreamData),
        status: upstream.status,
      },
      upstream.status,
    );
  }

  if (wantsStream) {
    if (!upstream.body) {
      upstreamData = await upstream.json().catch(() => ({}));
      if (!upstream.ok) {
        return jsonResponse(
          {
            error: "Upstream request failed",
            message: humanizeUpstreamError(upstream.status, upstreamData),
            status: upstream.status,
          },
          upstream.status,
        );
      }
      const text = extractAssistantText(upstreamData);
      const nextMessages = clampHistory([...conversation.messages, { role: "user", content: userMessage }, { role: "assistant", content: text }]);
      const record: ConversationRecord = { sessionId, messages: nextMessages, updatedAt: Date.now() };
      ctx.waitUntil(saveConversation(env, record));
      return jsonResponse({ ok: true, model: modelResult.model, sessionId, answer: text, streamed: false });
    }

    const [clientStream, parserStream] = upstream.body.tee();
    ctx.waitUntil(
      (async () => {
        const assistantText = await collectStreamingText(parserStream);
        const nextMessages = clampHistory([
          ...conversation.messages,
          { role: "user", content: userMessage },
          { role: "assistant", content: assistantText },
        ]);
        await saveConversation(env, { sessionId, messages: nextMessages, updatedAt: Date.now() });
      })(),
    );

    return new Response(clientStream, {
      status: upstream.status,
      headers: withCors({
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      }),
    });
  }

  upstreamData = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    return jsonResponse(
      {
        error: "Upstream request failed",
        message: humanizeUpstreamError(upstream.status, upstreamData),
        status: upstream.status,
      },
      upstream.status,
    );
  }

  const answer = extractAssistantText(upstreamData);
  const nextMessages = clampHistory([
    ...conversation.messages,
    { role: "user", content: userMessage },
    { role: "assistant", content: answer },
  ]);
  await saveConversation(env, { sessionId, messages: nextMessages, updatedAt: Date.now() });

  return jsonResponse({
    ok: true,
    model: modelResult.model,
    sessionId,
    answer,
    streamed: false,
    usage: (upstreamData as { usage?: unknown })?.usage ?? null,
  });
}

async function handleHistory(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("sessionId")?.trim() || crypto.randomUUID();

  if (request.method === "GET") {
    const conversation = await loadConversation(env, sessionId);
    return jsonResponse({ ok: true, sessionId, messages: conversation.messages, updatedAt: conversation.updatedAt });
  }

  if (request.method === "DELETE") {
    await clearConversation(env, sessionId);
    return jsonResponse({ ok: true, sessionId });
  }

  return jsonResponse({ error: "Method not allowed" }, 405);
}

function buildModelsPayload() {
  return {
    ok: true,
    defaultModel,
    autoRotate: {
      mode: "round-robin-by-minute",
      description: "Auto mode rotates through the supported models on a predictable time window.",
    },
    models: modelCatalog.map((model) => ({
      id: model.id,
      label: model.label,
      purpose: model.purpose,
    })),
  };
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: withCors() });
    }

    const url = new URL(request.url);
    const baseUrl = getBaseUrl(request);

    if (url.pathname === "/") {
      return new Response(htmlPage(baseUrl), {
        headers: withCors({ "Content-Type": "text/html; charset=utf-8" }),
      });
    }

    if (url.pathname === "/health") {
      return jsonResponse({
        status: "ok",
        agent: "Ouwibo Agent",
        timestamp: new Date().toISOString(),
        models: modelCatalog.map((model) => model.id),
        systemPrompt: true,
        streaming: true,
        rateLimitPerMinute: RATE_LIMIT_MAX,
        history: true,
      });
    }

    if (url.pathname === "/api/models") {
      return jsonResponse(buildModelsPayload());
    }

    if (url.pathname === "/api/history") {
      return handleHistory(request, env);
    }

    if (url.pathname === "/api/chat" && request.method === "POST") {
      return handleChat(request, env, ctx);
    }

    if (url.pathname === "/robots.txt") {
      return textResponse(buildRobotsTxt(baseUrl));
    }

    if (url.pathname === "/sitemap.xml") {
      return new Response(buildSitemap(baseUrl), {
        headers: withCors({ "Content-Type": "application/xml; charset=utf-8" }),
      });
    }

    if (url.pathname === "/favicon.svg") {
      return svgResponse(buildFaviconSvg());
    }

    if (url.pathname === "/og-image.svg") {
      return svgResponse(buildOgImageSvg(baseUrl));
    }

    return jsonResponse({ error: "Not found" }, 404);
  },
};
