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
  stream?: boolean;
};

type Env = {
  DASHSCOPE_API_KEY: string;
  DASHSCOPE_BASE_URL?: string;
  DEFAULT_MODEL?: string;
};

const MAX_MESSAGE_LENGTH = 6000;
const ALLOWED_MODEL_SET = new Set(modelCatalog.map((m) => m.id));

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

function withCors(headers: HeadersInit = {}): Headers {
  return new Headers({ ...CORS_HEADERS, ...headers });
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: withCors({ "Content-Type": "application/json" }),
  });
}

function getBaseUrl(request: Request): string {
  return new URL(request.url).origin.replace(/\/$/, "");
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function trimMessage(message: unknown): string | null {
  if (typeof message !== "string") return null;
  const normalized = message.trim();
  if (!normalized || normalized.length > MAX_MESSAGE_LENGTH) return null;
  return normalized;
}

function getDefaultModel(env: Env): string {
  const configured = env.DEFAULT_MODEL?.trim();
  if (configured && ALLOWED_MODEL_SET.has(configured as (typeof modelCatalog)[number]["id"])) return configured;
  return defaultModel;
}

function resolveChatModel(payload: RequestPayload, env: Env): string {
  const mode = payload.mode?.trim().toLowerCase();
  const requested = payload.model?.trim();

  if (mode === "auto" || requested === "auto") return getModelRotation();
  if (requested && isModelId(requested)) return requested;
  return getDefaultModel(env);
}

async function fetchDashScope(env: Env, model: string, messages: ChatMessage[], stream: boolean): Promise<Response> {
  const baseUrl = (env.DASHSCOPE_BASE_URL || "https://dashscope-intl.aliyuncs.com/compatible-mode/v1").replace(/\/$/, "");
  
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    return await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.DASHSCOPE_API_KEY}`,
        "Content-Type": "application/json",
        Accept: stream ? "text/event-stream" : "application/json",
      },
      body: JSON.stringify({ model, messages, stream }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function extractText(data: unknown): string {
  const d = data as { choices?: Array<{ message?: { content?: string }; delta?: { content?: string } }> };
  return d.choices?.[0]?.message?.content || d.choices?.[0]?.delta?.content || "";
}

function humanizeError(status: number): string {
  if (status === 401) return "Authentication failed. Check API key.";
  if (status === 404) return "Model unavailable.";
  if (status === 429) return "Rate limited. Try again later.";
  if (status >= 500) return "Provider temporarily unavailable.";
  return "Request failed.";
}

async function collectStream(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let result = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const parsed = JSON.parse(payload);
        const delta = parsed.choices?.[0]?.delta?.content || "";
        if (delta) result += delta;
      } catch {}
    }
  }
  return result;
}

function buildFavicon(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#0a0a0b"/><circle cx="32" cy="32" r="16" fill="#f0a500"/><path d="M27 25l10 7-10 7V25z" fill="#0a0a0b"/></svg>`;
}

function buildOgImage(baseUrl: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#0a0a0b"/><text x="112" y="184" fill="#f0ede8" font-size="72" font-weight="700">Ouwibo Agent</text><text x="112" y="246" fill="#9d9a94" font-size="28">AI Assistant</text><text x="112" y="324" fill="#f0a500" font-size="22">${escapeHtml(baseUrl)}</text></svg>`;
}

function htmlPage(baseUrl: string): string {
  const models = modelCatalog.map(m => `<button class="pill" data-model="${m.id}">${m.label}</button>`).join("");
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ouwibo Agent</title>
<meta name="description" content="AI Assistant">
<link rel="icon" href="${baseUrl}/favicon.svg" type="image/svg+xml">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:linear-gradient(180deg,#0a0a0b,#101013);color:#f0ede8;font-family:Inter,system-ui,sans-serif;min-height:100vh}
.app{max-width:800px;margin:0 auto;padding:24px}
header{display:flex;align-items:center;gap:12px;padding:20px 0;border-bottom:1px solid rgba(255,255,255,0.08)}
.logo{width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#f0a500,#ffc340);display:grid;place-items:center;font-weight:800;color:#0a0a0b}
h1{font-size:18px}
.chat{margin-top:20px;padding:20px;border:1px solid rgba(255,255,255,0.08);border-radius:20px;background:rgba(17,17,19,0.8)}
.pills{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}
.pill{padding:8px 14px;border-radius:999px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:#d1ccc4;cursor:pointer;font-size:13px;font-family:inherit}
.pill:hover{border-color:#f0a500;color:#f0a500}
.pill.active{background:rgba(240,165,0,0.15);border-color:#f0a500;color:#f0a500}
#log{min-height:300px;max-height:400px;overflow-y:auto;display:grid;gap:12px;padding:12px 0}
.msg{display:grid;gap:4px}
.msg.user{text-align:right}
.bubble{display:inline-block;padding:12px 16px;border-radius:16px;max-width:85%;text-align:left;white-space:pre-wrap;line-height:1.6}
.msg.user .bubble{background:linear-gradient(135deg,rgba(240,165,0,0.2),rgba(255,195,64,0.1));border:1px solid rgba(240,165,0,0.3)}
.msg.assistant .bubble{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08)}
.meta{font-size:11px;color:#9d9a94}
.form{display:grid;grid-template-columns:1fr auto;gap:10px;margin-top:16px}
input{width:100%;padding:14px;border-radius:14px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:#f0ede8;font-size:15px;outline:none}
input:focus{border-color:#f0a500}
button.send{padding:0 20px;border-radius:14px;border:0;background:linear-gradient(135deg,#f0a500,#ffc340);color:#0a0a0b;font-weight:700;cursor:pointer}
button.send:disabled{opacity:0.6}
.status{margin-top:12px;font-size:12px;color:#9d9a94}
</style>
</head>
<body>
<div class="app">
<header><div class="logo">O</div><h1>Ouwibo Agent</h1></header>
<div class="chat">
<div class="pills"><button class="pill active" data-mode="auto">Auto</button>${models}</div>
<div id="log"></div>
<form class="form" id="form">
<input id="input" placeholder="Type a message..." maxlength="6000">
<button class="send" id="send">Send</button>
</form>
<div class="status" id="status">Ready</div>
</div>
</div>
<script>
const log=document.getElementById('log');
const form=document.getElementById('form');
const input=document.getElementById('input');
const send=document.getElementById('send');
const status=document.getElementById('status');
const pills=document.querySelectorAll('.pill');

let model='auto';

function add(role,text){
 const m=document.createElement('div');
 m.className='msg '+role;
 const b=document.createElement('div');
 b.className='bubble';
 b.textContent=text;
 const meta=document.createElement('div');
 meta.className='meta';
 meta.textContent=role==='user'?'You':'Agent';
 m.appendChild(b);
 m.appendChild(meta);
 log.appendChild(m);
 log.scrollTop=log.scrollHeight;
 return b;
}

function setBusy(b){
 send.disabled=b;
 input.disabled=b;
 status.textContent=b?'Thinking...':'Ready';
}

pills.forEach(p=>p.onclick=()=>{pills.forEach(x=>x.classList.remove('active'));p.classList.add('active');model=p.dataset.model||'auto'});

form.onsubmit=async e=>{
 e.preventDefault();
 const msg=input.value.trim();
 if(!msg)return;
 add('user',msg);
 input.value='';
 setBusy(true);
 const bubble=add('assistant','...');
 try{
  const body=model==='auto'?{message:msg,mode:'auto'}:{message:msg,model};
  const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  const d=await r.json();
  bubble.textContent=d.answer||d.error||'No response';
 }catch(err){bubble.textContent='Error: '+err.message}
 setBusy(false);
};

add('assistant','Hello! I am Ouwibo Agent. How can I help you?');
</script>
</body>
</html>`;
}

async function handleChat(request: Request, env: Env): Promise<Response> {
  if (!env.DASHSCOPE_API_KEY) {
    return jsonResponse({ error: "Missing API key" }, 500);
  }

  let payload: RequestPayload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const message = trimMessage(payload.message || payload.messages?.[payload.messages.length - 1]?.content);
  if (!message) {
    return jsonResponse({ error: "message required" }, 400);
  }

  const model = resolveChatModel(payload, env);
  const wantsStream = payload.stream === true || request.headers.get("accept")?.includes("text/event-stream") || false;

  const upstream = await fetchDashScope(env, model, [{ role: "user", content: message }], wantsStream);

  if (!upstream.ok) {
    const data = await upstream.json().catch(() => ({}));
    return jsonResponse({ error: humanizeError(upstream.status), details: data }, upstream.status);
  }

  if (wantsStream && upstream.body) {
    const [client, parser] = upstream.body.tee();
    return new Response(client, {
      headers: withCors({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      }),
    });
  }

  const data = await upstream.json();
  const answer = extractText(data);

  return jsonResponse({ ok: true, model, answer, usage: (data as any).usage || null });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: withCors() });
    }

    const url = new URL(request.url);
    const baseUrl = getBaseUrl(request);

    if (url.pathname === "/") {
      return new Response(htmlPage(baseUrl), { headers: withCors({ "Content-Type": "text/html" }) });
    }

    if (url.pathname === "/health") {
      return jsonResponse({ status: "ok", models: modelCatalog.map(m => m.id) });
    }

    if (url.pathname === "/api/models") {
      return jsonResponse({ models: modelCatalog, default: defaultModel });
    }

    if (url.pathname === "/api/chat" && request.method === "POST") {
      return handleChat(request, env);
    }

    if (url.pathname === "/favicon.svg") {
      return new Response(buildFavicon(), { headers: withCors({ "Content-Type": "image/svg+xml" }) });
    }

    if (url.pathname === "/og-image.svg") {
      return new Response(buildOgImage(baseUrl), { headers: withCors({ "Content-Type": "image/svg+xml" }) });
    }

    return jsonResponse({ error: "Not found" }, 404);
  },
};
