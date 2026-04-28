import { defaultModel, modelCatalog, resolveModel } from "./models";

type ChatMessage = {
  role: string;
  content: string;
};

type RequestPayload = {
  message?: string;
  messages?: ChatMessage[];
  model?: string;
};

type Env = {
  DASHSCOPE_API_KEY: string;
  DASHSCOPE_BASE_URL?: string;
  DEFAULT_MODEL?: string;
  KV: KVNamespace;
};

const SYSTEM_PROMPT = `You are Ouwibo Agent, a helpful, professional, and concise AI assistant.
Answer clearly and honestly. Use markdown formatting when it helps (lists, code blocks, bold headings).
Never reveal which underlying model or provider powers you.
If asked which AI you are, say: "I am Ouwibo Agent, your intelligent assistant."
Keep answers focused and avoid unnecessary filler phrases.`;

const ALLOWED_MODELS = ["qwen3.6-flash", "qwen3.5-plus", "qwen3-max", "qwq-plus", "auto"] as const;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function withCors(headers: HeadersInit = {}): Headers {
  return new Headers({
    ...corsHeaders,
    ...headers,
  });
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: withCors({ "Content-Type": "application/json" }),
  });
}

function errorResponse(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: withCors({ "Content-Type": "application/json" }),
  });
}

function svgResponse(svg: string): Response {
  return new Response(svg, {
    headers: withCors({ "Content-Type": "image/svg+xml; charset=utf-8" }),
  });
}

function markdownEscape(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\r/g, "");
}

function htmlPage(baseUrl: string): string {
  const title = "Ouwibo Agent";
  const description = "Ouwibo Agent is a branded public AI assistant with chat memory, model selection, and a Cloudflare-ready backend.";
  const canonical = `${baseUrl.replace(/\/$/, "")}/`;
  const ogImage = `${baseUrl.replace(/\/$/, "")}/og-image.svg`;
  const favicon = `${baseUrl.replace(/\/$/, "")}/favicon.svg`;
  const modelButtons = modelCatalog.map((m) => `<button class="pill" data-model="${m.id}" type="button">${m.label}</button>`).join("");
  const suggestionItems = [
    "Explain Ouwibo Agent in simple terms",
    "Write a Python web scraper",
    "Summarize the latest AI news",
    "Help me debug my code",
  ]
    .map((item) => `<button class="suggestion" type="button">${item}</button>`)
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
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0a0b;
    --bg2: #111113;
    --bg3: #18181c;
    --bg4: #222228;
    --border: rgba(255,255,255,0.07);
    --border2: rgba(255,255,255,0.12);
    --amber: #f0a500;
    --amber2: #ffc340;
    --amber-dim: rgba(240,165,0,0.12);
    --amber-dim2: rgba(240,165,0,0.06);
    --text: #f0ede8;
    --text2: #9d9a94;
    --text3: #5a5855;
    --font: 'Syne', sans-serif;
    --mono: 'JetBrains Mono', monospace;
    --radius: 12px;
    --radius-sm: 6px;
    --radius-lg: 20px;
  }

  html, body {
    height: 100%;
    background: var(--bg);
    color: var(--text);
    font-family: var(--font);
    font-size: 15px;
    line-height: 1.6;
    overflow: hidden;
  }

  .app {
    display: grid;
    grid-template-rows: auto auto 1fr auto;
    height: 100vh;
    max-width: 860px;
    margin: 0 auto;
    padding: 0 16px;
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 0 16px;
    border-bottom: 0.5px solid var(--border);
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .logo-mark {
    width: 32px;
    height: 32px;
    background: var(--amber);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logo-mark svg {
    width: 18px;
    height: 18px;
    fill: #0a0a0b;
  }

  .logo-text {
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  .logo-text span {
    color: var(--amber);
  }

  .status-dot {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--text3);
  }

  .status-dot::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #3ecf6e;
    box-shadow: 0 0 6px #3ecf6e;
  }

  .model-bar {
    display: flex;
    gap: 6px;
    padding: 12px 0;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .model-bar::-webkit-scrollbar { display: none; }

  .pill {
    flex-shrink: 0;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    font-family: var(--mono);
    cursor: pointer;
    border: 0.5px solid var(--border2);
    background: var(--bg3);
    color: var(--text2);
    transition: all 0.15s ease;
    letter-spacing: 0.01em;
  }

  .pill:hover {
    border-color: var(--amber);
    color: var(--amber);
  }

  .pill.active {
    background: var(--amber-dim);
    border-color: var(--amber);
    color: var(--amber);
  }

  .chat-wrap {
    overflow-y: auto;
    padding: 8px 0 16px;
    scrollbar-width: thin;
    scrollbar-color: var(--bg4) transparent;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .chat-wrap::-webkit-scrollbar { width: 4px; }
  .chat-wrap::-webkit-scrollbar-track { background: transparent; }
  .chat-wrap::-webkit-scrollbar-thumb { background: var(--bg4); border-radius: 2px; }

  .welcome {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    gap: 12px;
    padding: 40px 0;
    text-align: center;
    opacity: 1;
    transition: opacity 0.3s ease;
  }

  .welcome.hidden { display: none; }

  .welcome-icon {
    width: 56px;
    height: 56px;
    background: var(--amber-dim);
    border: 0.5px solid var(--amber);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }

  .welcome h1 {
    font-size: 22px;
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  .welcome h1 span { color: var(--amber); }

  .welcome p {
    font-size: 14px;
    color: var(--text2);
    max-width: 340px;
    line-height: 1.7;
  }

  .suggestions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
    margin-top: 8px;
    max-width: 500px;
  }

  .suggestion {
    padding: 8px 14px;
    background: var(--bg3);
    border: 0.5px solid var(--border2);
    border-radius: var(--radius);
    font-size: 13px;
    color: var(--text2);
    cursor: pointer;
    transition: all 0.15s ease;
    font-family: var(--font);
  }

  .suggestion:hover {
    border-color: var(--amber);
    color: var(--text);
    background: var(--amber-dim2);
  }

  .msg {
    display: flex;
    gap: 10px;
    animation: fadeUp 0.25s ease;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .msg.user { flex-direction: row-reverse; }

  .avatar {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
    margin-top: 2px;
  }

  .msg.user .avatar {
    background: var(--amber-dim);
    border: 0.5px solid var(--amber);
    color: var(--amber);
  }

  .msg.assistant .avatar {
    background: var(--bg4);
    border: 0.5px solid var(--border2);
    color: var(--text2);
  }

  .bubble-wrap {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-width: min(76%, 560px);
  }

  .msg.user .bubble-wrap { align-items: flex-end; }

  .bubble {
    padding: 10px 14px;
    border-radius: var(--radius);
    font-size: 14px;
    line-height: 1.7;
    word-break: break-word;
  }

  .msg.user .bubble {
    background: var(--amber-dim);
    border: 0.5px solid var(--amber);
    color: var(--text);
    border-bottom-right-radius: 4px;
  }

  .msg.assistant .bubble {
    background: var(--bg3);
    border: 0.5px solid var(--border);
    color: var(--text);
    border-bottom-left-radius: 4px;
  }

  .msg.error .bubble {
    background: rgba(220,50,50,0.08);
    border-color: rgba(220,50,50,0.3);
    color: #f07070;
  }

  .meta {
    font-size: 11px;
    color: var(--text3);
    font-family: var(--mono);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .meta-model {
    background: var(--bg4);
    padding: 1px 6px;
    border-radius: 4px;
    color: var(--text3);
  }

  .bubble p { margin-bottom: 0.5em; }
  .bubble p:last-child { margin-bottom: 0; }
  .bubble strong { font-weight: 600; color: var(--amber2); }
  .bubble em { color: var(--text2); font-style: italic; }
  .bubble h1, .bubble h2, .bubble h3 {
    font-size: 14px;
    font-weight: 600;
    margin: 0.8em 0 0.3em;
    color: var(--text);
  }
  .bubble ul, .bubble ol { padding-left: 1.2em; margin: 0.4em 0; }
  .bubble li { margin: 0.2em 0; }
  .bubble code {
    font-family: var(--mono);
    font-size: 12px;
    background: var(--bg4);
    border: 0.5px solid var(--border2);
    padding: 1px 5px;
    border-radius: 4px;
    color: var(--amber2);
  }
  .bubble pre {
    background: var(--bg);
    border: 0.5px solid var(--border2);
    border-radius: var(--radius-sm);
    padding: 10px 12px;
    overflow-x: auto;
    margin: 0.5em 0;
  }
  .bubble pre code {
    background: none;
    border: none;
    padding: 0;
    font-size: 12px;
    color: var(--text2);
  }
  .bubble a { color: var(--amber); text-decoration: none; border-bottom: 0.5px solid var(--amber); }
  .bubble blockquote {
    border-left: 2px solid var(--amber);
    padding-left: 10px;
    color: var(--text2);
    margin: 0.5em 0;
  }
  .bubble hr { border: none; border-top: 0.5px solid var(--border); margin: 0.8em 0; }
  .bubble table { width: 100%; border-collapse: collapse; font-size: 13px; margin: 0.5em 0; }
  .bubble th, .bubble td { padding: 5px 8px; border: 0.5px solid var(--border2); text-align: left; }
  .bubble th { background: var(--bg4); font-weight: 600; }

  .typing-dots {
    display: flex;
    gap: 4px;
    align-items: center;
    padding: 4px 0;
  }

  .typing-dots span {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--text3);
    animation: bounce 1.2s infinite ease-in-out;
  }

  .typing-dots span:nth-child(2) { animation-delay: 0.15s; }
  .typing-dots span:nth-child(3) { animation-delay: 0.3s; }

  @keyframes bounce {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30% { transform: translateY(-4px); opacity: 1; }
  }

  .input-area {
    padding: 12px 0 20px;
    border-top: 0.5px solid var(--border);
  }

  .input-row {
    display: flex;
    gap: 8px;
    align-items: flex-end;
    background: var(--bg3);
    border: 0.5px solid var(--border2);
    border-radius: var(--radius-lg);
    padding: 8px 8px 8px 16px;
    transition: border-color 0.15s ease;
  }

  .input-row:focus-within {
    border-color: var(--amber);
  }

  textarea {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--text);
    font-family: var(--font);
    font-size: 14px;
    line-height: 1.6;
    resize: none;
    min-height: 22px;
    max-height: 160px;
    overflow-y: auto;
    scrollbar-width: thin;
  }

  textarea::placeholder { color: var(--text3); }

  .send-btn {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: var(--amber);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.15s ease;
  }

  .send-btn:hover { background: var(--amber2); transform: scale(1.05); }
  .send-btn:active { transform: scale(0.96); }
  .send-btn:disabled { background: var(--bg4); cursor: not-allowed; transform: none; }

  .send-btn svg {
    width: 15px;
    height: 15px;
    fill: #0a0a0b;
  }

  .send-btn:disabled svg { fill: var(--text3); }

  .input-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 4px 0;
  }

  .char-count {
    font-size: 11px;
    font-family: var(--mono);
    color: var(--text3);
  }

  .char-count.warn { color: #f07070; }

  .clear-btn {
    font-size: 11px;
    color: var(--text3);
    background: none;
    border: none;
    cursor: pointer;
    font-family: var(--font);
    padding: 2px 4px;
    border-radius: 4px;
    transition: color 0.15s ease;
  }

  .clear-btn:hover { color: var(--amber); }

  @media (max-width: 600px) {
    .app { padding: 0 12px; }
    .bubble-wrap { max-width: 85%; }
    .welcome h1 { font-size: 18px; }
    .suggestions { gap: 6px; }
  }
</style>
</head>
<body>
  <div class="app">
    <header>
      <div class="logo">
        <div class="logo-mark">
          <svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><path d="M9 1L16 5V13L9 17L2 13V5L9 1Z"/></svg>
        </div>
        <div class="logo-text">Ouwibo <span>Agent</span></div>
      </div>
      <div class="status-dot">online</div>
    </header>

    <div class="model-bar" id="modelBar">
      <button class="pill active" data-model="auto" type="button">⚡ Auto</button>
      ${modelButtons}
    </div>

    <div class="chat-wrap" id="chatWrap">
      <div class="welcome" id="welcome">
        <div class="welcome-icon">◈</div>
        <h1>Hello, I'm <span>Ouwibo Agent</span></h1>
        <p>Your intelligent assistant. Ask me anything — from analysis and coding to creative writing and research.</p>
        <div class="suggestions" id="suggestions">${suggestionItems}</div>
      </div>
    </div>

    <div class="input-area">
      <div class="input-row">
        <textarea id="input" placeholder="Ask anything..." rows="1" maxlength="6000"></textarea>
        <button class="send-btn" id="sendBtn" disabled type="button">
          <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M8 2L14 8L8 14M2 8H14" stroke="#0a0a0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
        </button>
      </div>
      <div class="input-footer">
        <span class="char-count" id="charCount">0 / 6000</span>
        <button class="clear-btn" id="clearBtn" type="button">Clear chat</button>
      </div>
    </div>
  </div>

  <script>
    let history = [];
    let selectedModel = 'auto';
    let isLoading = false;

    const chatWrap = document.getElementById('chatWrap');
    const welcome = document.getElementById('welcome');
    const input = document.getElementById('input');
    const sendBtn = document.getElementById('sendBtn');
    const charCount = document.getElementById('charCount');
    const modelBar = document.getElementById('modelBar');
    const clearBtn = document.getElementById('clearBtn');
    const suggestions = document.getElementById('suggestions');

    if (window.marked) {
      marked.setOptions({ breaks: true, gfm: true });
    }

    function escapeHtml(str) {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }

    function renderMarkdown(text) {
      if (!window.marked) return escapeHtml(text).replace(/\n/g, '<br>');
      try {
        return marked.parse(text);
      } catch {
        return escapeHtml(text);
      }
    }

    function now() {
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function scrollBottom() {
      chatWrap.scrollTo({ top: chatWrap.scrollHeight, behavior: 'smooth' });
    }

    function updateInputState() {
      const len = input.value.length;
      charCount.textContent = len + ' / 6000';
      charCount.classList.toggle('warn', len > 5000);
      sendBtn.disabled = !input.value.trim() || isLoading;
    }

    function appendMsg(role, content, modelUsed) {
      welcome.classList.add('hidden');
      const div = document.createElement('div');
      div.className = 'msg ' + role;
      const initials = role === 'user' ? 'U' : 'OA';
      const timestamp = now();
      let metaHtml = '';
      if (role === 'assistant' && modelUsed) {
        metaHtml = '<div class="meta"><span>' + timestamp + '</span><span class="meta-model">' + modelUsed + '</span></div>';
      } else {
        metaHtml = '<div class="meta">' + timestamp + '</div>';
      }
      const bubbleContent = role === 'assistant' ? renderMarkdown(content) : escapeHtml(content).replace(/\n/g, '<br>');
      div.innerHTML = '<div class="avatar">' + initials + '</div><div class="bubble-wrap"><div class="bubble">' + bubbleContent + '</div>' + metaHtml + '</div>';
      chatWrap.appendChild(div);
      scrollBottom();
      return div;
    }

    function showTyping() {
      const div = document.createElement('div');
      div.className = 'msg assistant';
      div.id = 'typing';
      div.innerHTML = '<div class="avatar">OA</div><div class="bubble-wrap"><div class="bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div></div>';
      chatWrap.appendChild(div);
      scrollBottom();
    }

    function hideTyping() {
      const t = document.getElementById('typing');
      if (t) t.remove();
    }

    async function sendMessage() {
      const text = input.value.trim();
      if (!text || isLoading) return;

      isLoading = true;
      sendBtn.disabled = true;
      history.push({ role: 'user', content: text });
      appendMsg('user', text);

      input.value = '';
      input.style.height = 'auto';
      updateInputState();
      showTyping();

      try {
        const payload = selectedModel === 'auto'
          ? { messages: history, model: 'auto' }
          : { messages: history, model: selectedModel };

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        hideTyping();

        if (!res.ok) {
          appendMsg('error', data.error || 'Request failed (' + res.status + ')');
        } else {
          history.push({ role: 'assistant', content: data.reply });
          appendMsg('assistant', data.reply, data.model);
        }
      } catch (err) {
        hideTyping();
        appendMsg('error', 'Network error. Please try again.');
      } finally {
        isLoading = false;
        updateInputState();
        input.focus();
      }
    }

    modelBar.addEventListener('click', (e) => {
      const pill = e.target.closest('.pill');
      if (!pill) return;
      document.querySelectorAll('.pill').forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      selectedModel = pill.dataset.model;
    });

    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 160) + 'px';
      updateInputState();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    sendBtn.addEventListener('click', sendMessage);

    suggestions.addEventListener('click', (e) => {
      const s = e.target.closest('.suggestion');
      if (!s) return;
      input.value = s.textContent;
      input.dispatchEvent(new Event('input'));
      sendMessage();
    });

    clearBtn.addEventListener('click', () => {
      history = [];
      chatWrap.querySelectorAll('.msg').forEach((m) => m.remove());
      welcome.classList.remove('hidden');
      input.value = '';
      input.style.height = 'auto';
      updateInputState();
      input.focus();
    });

    appendMsg('assistant', 'Hello. I am Ouwibo Agent — a branded public AI assistant for your website. Ask me anything.', 'auto');
  </script>
</body>
</html>`;
}

function ogImageSvg(title: string, description: string): string {
  const safeTitle = markdownEscape(title);
  const safeDescription = markdownEscape(description);
  return `
  <svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
        <stop stop-color="#050816"/>
        <stop offset="1" stop-color="#0F172A"/>
      </linearGradient>
      <radialGradient id="r" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(210 110) rotate(35) scale(420 300)">
        <stop stop-color="#38BDF8" stop-opacity="0.28"/>
        <stop offset="1" stop-color="#38BDF8" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#g)"/>
    <rect width="1200" height="630" fill="url(#r)"/>
    <circle cx="1020" cy="120" r="150" fill="#2563EB" fill-opacity="0.16"/>
    <circle cx="980" cy="520" r="190" fill="#06B6D4" fill-opacity="0.14"/>
    <text x="84" y="200" fill="#E2E8F0" font-family="Inter, Arial, sans-serif" font-size="72" font-weight="700">${safeTitle}</text>
    <text x="84" y="272" fill="#93C5FD" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="600">Public AI Agent / Cloudflare Ready</text>
    <text x="84" y="344" fill="#CBD5E1" font-family="Inter, Arial, sans-serif" font-size="30">${safeDescription}</text>
    <rect x="84" y="412" width="360" height="56" rx="28" fill="#2563EB"/>
    <text x="126" y="449" fill="#FFFFFF" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="600">Ouwibo Agent</text>
  </svg>`;
}

function faviconSvg(): string {
  return `
  <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none">
    <rect width="64" height="64" rx="18" fill="#050816"/>
    <path d="M14 42C20 20 44 16 50 24C55 31 47 46 32 48C24 49 17 47 14 42Z" fill="#38BDF8" fill-opacity="0.18"/>
    <path d="M18 40C22 27 33 20 45 22" stroke="#38BDF8" stroke-width="4" stroke-linecap="round"/>
    <path d="M20 44C30 40 39 41 46 46" stroke="#E2E8F0" stroke-width="4" stroke-linecap="round"/>
  </svg>`;
}

function buildSitemap(baseUrl: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${baseUrl}/</loc></url>
  <url><loc>${baseUrl}/health</loc></url>
  <url><loc>${baseUrl}/api/models</loc></url>
</urlset>`;
}

async function checkRateLimit(env: Env, request: Request): Promise<Response | null> {
  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  const rlKey = `rl:${ip}`;
  const currentCount = parseInt((await env.KV.get(rlKey)) ?? "0", 10);
  if (currentCount >= 30) {
    return errorResponse("Rate limit exceeded. Max 30 requests per minute.", 429);
  }
  await env.KV.put(rlKey, String(currentCount + 1), { expirationTtl: 60 });
  return null;
}

async function handleChat(request: Request, env: Env): Promise<Response> {
  const rateLimitResponse = await checkRateLimit(env, request);
  if (rateLimitResponse) return rateLimitResponse;

  if (!env.DASHSCOPE_API_KEY) {
    return errorResponse("Missing DASHSCOPE_API_KEY", 500);
  }

  const body = (await request.json().catch(() => ({}))) as RequestPayload;
  const userMessages = body.messages ?? [{ role: "user", content: body.message ?? "" }];

  if (!userMessages.length || !userMessages[userMessages.length - 1]?.content?.trim()) {
    return errorResponse("Message is required.", 400);
  }

  const lastContent = userMessages[userMessages.length - 1].content;
  if (lastContent.length > 6000) {
    return errorResponse("Message too long. Maximum 6000 characters.", 400);
  }

  const requestedModel = body.model ?? "auto";
  if (!ALLOWED_MODELS.includes(requestedModel as typeof ALLOWED_MODELS[number])) {
    return errorResponse("Invalid model. Allowed: " + ALLOWED_MODELS.join(", "), 400);
  }

  const resolvedModel = requestedModel === "auto"
    ? (env.DEFAULT_MODEL ?? "qwen3.5-plus")
    : requestedModel;

  const fullMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...userMessages,
  ];

  const baseUrl = (env.DASHSCOPE_BASE_URL || "https://dashscope-intl.aliyuncs.com/compatible-mode/v1").replace(/\/$/, "");

  const upstream = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.DASHSCOPE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: resolvedModel,
      messages: fullMessages,
    }),
  });

  const payload = (await upstream.json().catch(() => ({}))) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: unknown;
  };

  if (!upstream.ok) {
    return errorResponse("Upstream request failed.", upstream.status);
  }

  const assistantMessage = payload.choices?.[0]?.message?.content ?? "";
  const usageData = payload.usage ?? null;

  return new Response(JSON.stringify({
    reply: assistantMessage,
    model: resolvedModel,
    usage: usageData,
  }), {
    status: 200,
    headers: withCors({ "Content-Type": "application/json" }),
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: withCors(),
      });
    }

    const url = new URL(request.url);
    const baseUrl = url.origin;

    if (url.pathname === "/") {
      return new Response(htmlPage(baseUrl), {
        headers: withCors({ "Content-Type": "text/html; charset=utf-8" }),
      });
    }

    if (url.pathname === "/health") {
      return new Response(JSON.stringify({
        status: "ok",
        agent: "Ouwibo Agent",
        timestamp: new Date().toISOString(),
        models: ["qwen3.6-flash", "qwen3.5-plus", "qwen3-max", "qwq-plus"],
      }), {
        headers: withCors({ "Content-Type": "application/json" }),
      });
    }

    if (url.pathname === "/api/models") {
      return jsonResponse({
        defaultModel: env.DEFAULT_MODEL ?? defaultModel,
        models: ["qwen3.6-flash", "qwen3.5-plus", "qwen3-max", "qwq-plus"],
      });
    }

    if (url.pathname === "/api/chat" && request.method === "POST") {
      return handleChat(request, env);
    }

    if (url.pathname === "/og-image.svg") {
      return svgResponse(ogImageSvg("Ouwibo Agent", "Public AI Agent / Cloudflare Ready"));
    }

    if (url.pathname === "/favicon.svg") {
      return svgResponse(faviconSvg());
    }

    if (url.pathname === "/robots.txt") {
      return new Response("User-agent: *\nAllow: /\nSitemap: /sitemap.xml", {
        headers: withCors({ "Content-Type": "text/plain" }),
      });
    }

    if (url.pathname === "/sitemap.xml") {
      return new Response(buildSitemap(baseUrl), {
        headers: withCors({ "Content-Type": "application/xml" }),
      });
    }

    return errorResponse("Not found", 404);
  },
};
