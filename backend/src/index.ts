import { defaultModel, modelCatalog, resolveModel, getModelRotation, isModelId } from "./models";

// ============== TYPES ==============
type ChatMessage = { role: string; content: string };
type Env = {
  DASHSCOPE_API_KEY: string;
  DASHSCOPE_BASE_URL?: string;
  DEFAULT_MODEL?: string;
};

// ============== CONSTANTS ==============
const MAX_MESSAGE_LENGTH = 10000;
const ALLOWED_MODELS = new Set(modelCatalog.map(m => m.id));

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

// ============== HELPERS ==============
const cors = (h: Record<string, string> = {}) => new Headers({ ...CORS, ...h });
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: cors({ "Content-Type": "application/json" }) });
const text = (s: string, ct = "text/plain") => new Response(s, { headers: cors({ "Content-Type": ct }) });
const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const trim = (m: unknown): string | null => typeof m === "string" && m.trim() && m.length <= MAX_MESSAGE_LENGTH ? m.trim() : null;

// ============== DASHSCOPE API ==============
async function callDashScope(env: Env, model: string, messages: ChatMessage[], stream = false): Promise<Response> {
  const base = (env.DASHSCOPE_BASE_URL || "https://dashscope-intl.aliyuncs.com/compatible-mode/v1").replace(/\/$/, "");
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 90000);
  
  try {
    return await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.DASHSCOPE_API_KEY}`,
        "Content-Type": "application/json",
        Accept: stream ? "text/event-stream" : "application/json",
      },
      body: JSON.stringify({ model, messages, stream }),
      signal: ctrl.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function humanizeError(status: number): string {
  if (status === 401) return "API key invalid. Check configuration.";
  if (status === 404) return "Model not available.";
  if (status === 429) return "Rate limited. Try again later.";
  if (status >= 500) return "Provider error. Try again.";
  return "Request failed.";
}

// ============== ASSETS ==============
const favicon = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#0a0a0b"/><circle cx="32" cy="32" r="16" fill="#f0a500"/><path d="M27 25l10 7-10 7V25z" fill="#0a0a0b"/></svg>`;

// ============== UI ==============
function buildUI(baseUrl: string): string {
  const title = "Ouwibo Agent";
  const description = "Production AI Agent - Multi-model chat with real-time responses.";
  const modelOptions = modelCatalog.map(m => `<option value="${m.id}">${m.label}</option>`).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="robots" content="index,follow">
<link rel="canonical" href="${baseUrl}/">
<link rel="icon" href="${baseUrl}/favicon.svg" type="image/svg+xml">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${baseUrl}/">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="theme-color" content="#0a0a0b">
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }

:root {
  --bg: #0a0a0b;
  --bg2: #111113;
  --bg3: #18181c;
  --border: rgba(255,255,255,0.08);
  --text: #f0ede8;
  --text2: #9d9a94;
  --amber: #f0a500;
  --amber2: #ffc340;
  --green: #3ecf6e;
  --radius: 16px;
}

html, body { height: 100%; background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; font-size: 14px; }

.app { display: flex; flex-direction: column; height: 100vh; max-width: 1200px; margin: 0 auto; padding: 20px; }

/* Header */
.header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; border-bottom: 1px solid var(--border); }
.brand { display: flex; align-items: center; gap: 12px; }
.brand-mark { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, var(--amber), var(--amber2)); display: grid; place-items: center; color: var(--bg); font-weight: 800; font-size: 18px; }
.brand-text h1 { font-size: 18px; font-weight: 600; }
.brand-text p { font-size: 12px; color: var(--text2); }
.status-badge { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text2); }
.status-badge::before { content: ''; width: 8px; height: 8px; border-radius: 50%; background: var(--green); box-shadow: 0 0 8px var(--green); }

/* Chat Area */
.chat-container { flex: 1; display: flex; flex-direction: column; margin-top: 20px; overflow: hidden; }
.chat-log { flex: 1; overflow-y: auto; padding: 20px; background: var(--bg2); border-radius: var(--radius); border: 1px solid var(--border); }
.message { margin-bottom: 16px; }
.message.user { text-align: right; }
.bubble { display: inline-block; max-width: 80%; padding: 14px 18px; border-radius: 20px; text-align: left; line-height: 1.6; white-space: pre-wrap; }
.message.user .bubble { background: linear-gradient(135deg, rgba(240,165,0,0.2), rgba(255,195,64,0.1)); border: 1px solid rgba(240,165,0,0.3); }
.message.assistant .bubble { background: var(--bg3); border: 1px solid var(--border); }
.message-meta { font-size: 11px; color: var(--text2); margin-top: 4px; font-family: 'JetBrains Mono', monospace; }

/* Input Area */
.input-area { margin-top: 16px; display: flex; gap: 12px; }
.input-wrapper { flex: 1; }
.input-field { width: 100%; padding: 16px; border-radius: var(--radius); background: var(--bg2); border: 1px solid var(--border); color: var(--text); font-size: 14px; outline: none; resize: none; min-height: 56px; }
.input-field:focus { border-color: var(--amber); box-shadow: 0 0 0 3px rgba(240,165,0,0.1); }
.input-field::placeholder { color: var(--text2); }
.model-select { padding: 16px; border-radius: var(--radius); background: var(--bg2); border: 1px solid var(--border); color: var(--text); font-size: 13px; cursor: pointer; }
.send-btn { padding: 16px 32px; border-radius: var(--radius); background: linear-gradient(135deg, var(--amber), var(--amber2)); border: none; color: var(--bg); font-size: 14px; font-weight: 600; cursor: pointer; transition: transform 0.15s; }
.send-btn:hover { transform: translateY(-1px); }
.send-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

/* Footer */
.footer { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); text-align: center; font-size: 12px; color: var(--text2); }
.footer a { color: var(--amber); text-decoration: none; }

/* Responsive */
@media (max-width: 768px) {
  .app { padding: 16px; }
  .input-area { flex-direction: column; }
  .send-btn { width: 100%; }
}

/* Markdown Styles */
.bubble h1, .bubble h2, .bubble h3 { margin: 16px 0 8px; }
.bubble p { margin: 8px 0; }
.bubble ul, .bubble ol { margin: 8px 0; padding-left: 24px; }
.bubble code { background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; }
.bubble pre { background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; overflow-x: auto; margin: 8px 0; }
.bubble pre code { background: none; padding: 0; }
</style>
</head>
<body>
<div class="app">
  <header class="header">
    <div class="brand">
      <div class="brand-mark">O</div>
      <div class="brand-text">
        <h1>Ouwibo Agent</h1>
        <p>Production AI Assistant</p>
      </div>
    </div>
    <div class="status-badge">Online</div>
  </header>

  <div class="chat-container">
    <div class="chat-log" id="chat-log"></div>
    
    <div class="input-area">
      <div class="input-wrapper">
        <textarea id="input" class="input-field" placeholder="Type your message..." rows="2"></textarea>
      </div>
      <select id="model" class="model-select">${modelOptions}</select>
      <button id="send" class="send-btn">Send</button>
    </div>
  </div>

  <footer class="footer">
    Ouwibo Agent · Powered by Qwen · <a href="https://github.com/ouwibo/Agent" target="_blank">GitHub</a>
  </footer>
</div>

<script>
(function() {
  const chatLog = document.getElementById('chat-log');
  const input = document.getElementById('input');
  const sendBtn = document.getElementById('send');
  const modelSelect = document.getElementById('model');

  function time() {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  function escapeText(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function renderMarkdown(text) {
    if (window.marked) {
      return marked.parse(text, { breaks: true, gfm: true });
    }
    return escapeText(text).replace(/\\n/g, '<br>');
  }

  function addMessage(role, content, isMarkdown = false) {
    const div = document.createElement('div');
    div.className = 'message ' + role;
    
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerHTML = isMarkdown && role === 'assistant' ? renderMarkdown(content) : escapeText(content);
    
    const meta = document.createElement('div');
    meta.className = 'message-meta';
    meta.textContent = (role === 'user' ? 'You' : 'Ouwibo Agent') + ' · ' + time();
    
    div.appendChild(bubble);
    div.appendChild(meta);
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
    
    return bubble;
  }

  function setBusy(busy) {
    sendBtn.disabled = busy;
    input.disabled = busy;
    sendBtn.textContent = busy ? 'Sending...' : 'Send';
  }

  async function send() {
    const message = input.value.trim();
    if (!message) return;

    addMessage('user', message);
    input.value = '';
    setBusy(true);

    const bubble = addMessage('assistant', 'Thinking...', false);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, model: modelSelect.value })
      });

      const data = await res.json();
      
      if (!res.ok) {
        bubble.textContent = data.error || 'Request failed';
      } else {
        bubble.innerHTML = renderMarkdown(data.answer || 'No response');
      }
    } catch (err) {
      bubble.textContent = 'Network error. Try again.';
    } finally {
      setBusy(false);
      input.focus();
    }
  }

  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });

  // Welcome message
  addMessage('assistant', 'Hello! I am Ouwibo Agent, your AI assistant. How can I help you today?', false);
  input.focus();
})();
</script>
</body>
</html>`;
}

// ============== CHAT HANDLER ==============
async function handleChat(request: Request, env: Env): Promise<Response> {
  const body = await request.json().catch(() => ({})) as { message?: string; model?: string };
  const message = trim(body.message);
  if (!message) return json({ error: "Message required" }, 400);

  const model = body.model && ALLOWED_MODELS.has(body.model as typeof modelCatalog[number]["id"]) ? body.model : env.DEFAULT_MODEL || defaultModel;

  const upstream = await callDashScope(env, model, [{ role: "user", content: message }], false);

  if (!upstream.ok) {
    const data = await upstream.json().catch(() => ({}));
    return json({ error: humanizeError(upstream.status), details: data }, upstream.status);
  }

  const data = await upstream.json() as { choices?: Array<{ message?: { content?: string } }>; usage?: unknown };
  const answer = data.choices?.[0]?.message?.content || "";

  return json({ ok: true, model, answer, usage: data.usage || null });
}

// ============== ROUTER ==============
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors() });

    const url = new URL(request.url);
    const base = url.origin;

    // Redirect root to agent-ui for frontend
    if (url.pathname === "/") {
      return Response.redirect("https://agent-ui.ouwibo.workers.dev", 302);
    }
    if (url.pathname === "/favicon.svg") return new Response(favicon(), { headers: cors({ "Content-Type": "image/svg+xml" }) });
    if (url.pathname === "/robots.txt") return text("User-agent: *\nAllow: /\nSitemap: " + base + "/sitemap.xml");
    if (url.pathname === "/sitemap.xml") return text('<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>' + base + '/</loc></url></urlset>', "application/xml");

    // API routes
    if (url.pathname === "/health") return json({ status: "ok", agent: "Ouwibo Agent", version: "3.0.0", model: env.DEFAULT_MODEL || defaultModel });
    if (url.pathname === "/api/models") return json({ models: modelCatalog, default: defaultModel });
    if (url.pathname === "/api/chat" && request.method === "POST") return handleChat(request, env);

    return json({ error: "Not found" }, 404);
  },
};
