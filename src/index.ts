import { defaultModel, modelCatalog, resolveModel, getModelRotation, isModelId } from "./models";

// ============== TYPES ==============
type ChatMessage = {
  role: string;
  content: string;
};

type ToolCall = {
  name: string;
  input: Record<string, unknown>;
  output?: string;
  status: "pending" | "running" | "success" | "error";
  latency?: number;
};

type AgentStep = {
  thought: string;
  action: string;
  tool?: ToolCall;
  result?: string;
};

type AgentState = {
  steps: AgentStep[];
  status: "thinking" | "executing" | "complete" | "error";
  finalAnswer?: string;
};

type RequestPayload = {
  message?: string;
  messages?: ChatMessage[];
  model?: string;
  mode?: string;
  sessionId?: string;
  stream?: boolean;
  agentMode?: boolean;
};

type Env = {
  DASHSCOPE_API_KEY: string;
  DASHSCOPE_BASE_URL?: string;
  DEFAULT_MODEL?: string;
};

// ============== CONSTANTS ==============
const SESSION_KEY = "ouwibo_session_id";
const MAX_MESSAGE_LENGTH = 10000;
const ALLOWED_MODEL_SET = new Set(modelCatalog.map((m) => m.id));

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

// ============== HELPERS ==============
function withCors(headers: HeadersInit = {}): Headers {
  return new Headers({ ...CORS_HEADERS, ...headers });
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: withCors({ "Content-Type": "application/json; charset=utf-8" }),
  });
}

function svgResponse(svg: string): Response {
  return new Response(svg, {
    headers: withCors({ "Content-Type": "image/svg+xml; charset=utf-8" }),
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function trimMessage(message: unknown): string | null {
  if (typeof message !== "string") return null;
  const normalized = message.replace(/\u0000/g, "").trim();
  if (!normalized) return null;
  if (normalized.length > MAX_MESSAGE_LENGTH) return null;
  return normalized;
}

function resolveChatModel(payload: RequestPayload, env: Env): string {
  const mode = payload.mode?.trim().toLowerCase();
  if (mode === "auto") return getModelRotation();
  if (payload.model && isModelId(payload.model)) return payload.model;
  const configured = env.DEFAULT_MODEL?.trim();
  if (configured && ALLOWED_MODEL_SET.has(configured as typeof modelCatalog[number]["id"])) return configured;
  return defaultModel;
}

// ============== DASHSCOPE API ==============
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

function humanizeError(status: number): string {
  if (status === 401) return "Authentication failed. Check API key.";
  if (status === 404) return "Model unavailable or not enabled.";
  if (status === 429) return "Rate limited. Try again shortly.";
  if (status >= 500) return "Provider temporarily unavailable.";
  return "Request could not be completed.";
}

// ============== AGENT SIMULATION ==============
async function simulateAgentThinking(message: string, model: string, env: Env): Promise<AgentState> {
  const steps: AgentStep[] = [];
  const startTime = Date.now();

  // Step 1: Analyze
  steps.push({
    thought: "Understanding the user request...",
    action: "analyze_input",
  });

  // Step 2: Plan
  steps.push({
    thought: "Breaking down into subtasks...",
    action: "plan_execution",
    tool: {
      name: "task_planner",
      input: { query: message },
      status: "success",
      latency: 45,
    },
  });

  // Step 3: Execute
  steps.push({
    thought: "Executing primary task...",
    action: "execute",
    tool: {
      name: "api_call",
      input: { endpoint: "/generate", params: { prompt: message } },
      status: "running",
    },
  });

  // Get actual response from DashScope
  const upstream = await fetchDashScope(env, model, [{ role: "user", content: message }], false);
  
  let finalAnswer = "Unable to generate response.";
  
  if (upstream.ok) {
    const data = await upstream.json() as { choices?: Array<{ message?: { content?: string } }> };
    finalAnswer = data.choices?.[0]?.message?.content || finalAnswer;
  } else {
    finalAnswer = `Error: ${humanizeError(upstream.status)}`;
  }

  // Update tool status
  steps[2].tool!.status = "success";
  steps[2].tool!.latency = Date.now() - startTime;
  steps[2].result = finalAnswer;

  // Step 4: Finalize
  steps.push({
    thought: "Synthesizing final answer...",
    action: "complete",
    result: finalAnswer,
  });

  return {
    steps,
    status: "complete",
    finalAnswer,
  };
}

// ============== SVG ASSETS ==============
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
      <text x="112" y="246" fill="#9d9a94" font-family="Inter, Arial, sans-serif" font-size="28">Super Premium AI Agent Dashboard</text>
      <text x="112" y="324" fill="#f0a500" font-family="JetBrains Mono, monospace" font-size="22">${escapeHtml(baseUrl)}</text>
      <rect x="112" y="372" width="976" height="120" rx="22" fill="#18181c" stroke="#2a2a31"/>
      <text x="146" y="425" fill="#f0ede8" font-family="JetBrains Mono, monospace" font-size="24">Multi-panel workspace · Live streaming · Debug inspector</text>
      <text x="146" y="462" fill="#9d9a94" font-family="JetBrains Mono, monospace" font-size="20">Production-grade AI Agent System</text>
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

// ============== SUPER PREMIUM UI ==============
function superPremiumUI(baseUrl: string): string {
  const title = "Ouwibo Agent";
  const description = "Super Premium AI Agent Dashboard - Multi-panel workspace with live streaming reasoning and debug inspector.";
  const canonical = `${baseUrl}/`;
  const ogImage = `${baseUrl}/og-image.svg`;
  const favicon = `${baseUrl}/favicon.svg`;
  const modelOptions = modelCatalog.map((m) => `<option value="${escapeHtml(m.id)}">${escapeHtml(m.label)}</option>`).join("");

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
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }
  
  :root {
    --bg: #0a0a0b;
    --bg2: #111113;
    --bg3: #18181c;
    --border: rgba(255,255,255,0.08);
    --border2: rgba(255,255,255,0.12);
    --text: #f0ede8;
    --text2: #9d9a94;
    --text3: #5a5855;
    --amber: #f0a500;
    --amber2: #ffc340;
    --green: #3ecf6e;
    --red: #ef4444;
    --blue: #3b82f6;
    --radius: 16px;
    --radius-sm: 8px;
    --radius-lg: 24px;
  }

  html, body { height: 100%; background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; font-size: 14px; }

  .app { display: grid; grid-template-columns: 280px 1fr; height: 100vh; overflow: hidden; }

  /* SIDEBAR */
  .sidebar {
    background: rgba(255,255,255,0.03);
    backdrop-filter: blur(24px);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column; padding: 20px;
  }

  .brand { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
  .brand-mark {
    width: 40px; height: 40px; border-radius: 12px;
    background: linear-gradient(135deg, var(--amber), var(--amber2));
    display: grid; place-items: center; color: var(--bg); font-weight: 800; font-size: 18px;
  }
  .brand-text h1 { font-size: 16px; font-weight: 600; letter-spacing: -0.02em; }
  .brand-text p { font-size: 11px; color: var(--text2); margin-top: 2px; }

  .new-task-btn {
    width: 100%; padding: 12px; border-radius: var(--radius);
    background: rgba(255,255,255,0.08); border: 1px solid var(--border);
    color: var(--text); font-size: 13px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all 0.15s ease;
  }
  .new-task-btn:hover { background: rgba(255,255,255,0.12); border-color: var(--border2); }

  .tasks-list { flex: 1; margin-top: 16px; overflow-y: auto; }
  .task-item {
    padding: 12px; border-radius: var(--radius); cursor: pointer;
    margin-bottom: 4px; transition: all 0.15s ease;
    border: 1px solid transparent;
  }
  .task-item:hover { background: rgba(255,255,255,0.05); }
  .task-item.active { background: rgba(255,255,255,0.1); border-color: var(--border2); }
  .task-title { font-size: 13px; font-weight: 500; }
  .task-meta { font-size: 11px; color: var(--text2); margin-top: 4px; }

  .sidebar-footer { padding-top: 16px; border-top: 1px solid var(--border); margin-top: 16px; }
  .sidebar-btn {
    width: 100%; padding: 10px; border-radius: var(--radius-sm);
    background: transparent; border: none; color: var(--text2);
    font-size: 12px; cursor: pointer; text-align: left;
    transition: all 0.15s ease;
  }
  .sidebar-btn:hover { background: rgba(255,255,255,0.05); color: var(--text); }

  /* MAIN */
  .main { display: flex; flex-direction: column; overflow: hidden; }

  /* TOP BAR */
  .topbar {
    display: flex; justify-content: space-between; align-items: center;
    padding: 12px 20px; border-bottom: 1px solid var(--border);
    background: rgba(255,255,255,0.02);
  }

  .mode-tabs { display: flex; gap: 4px; background: rgba(255,255,255,0.05); padding: 4px; border-radius: var(--radius); }
  .mode-tab {
    padding: 8px 16px; border-radius: var(--radius-sm); border: none;
    background: transparent; color: var(--text2); font-size: 12px; cursor: pointer;
    transition: all 0.15s ease;
  }
  .mode-tab:hover { color: var(--text); }
  .mode-tab.active { background: rgba(255,255,255,0.15); color: var(--text); }

  .topbar-right { display: flex; align-items: center; gap: 16px; }
  .status-badge {
    display: flex; align-items: center; gap: 6px;
    font-size: 11px; color: var(--green);
  }
  .status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); box-shadow: 0 0 8px var(--green); }
  .cmd-hint {
    padding: 6px 12px; border-radius: var(--radius-sm);
    background: rgba(255,255,255,0.05); font-size: 11px; color: var(--text2);
    font-family: 'JetBrains Mono', monospace;
  }

  /* WORKSPACE */
  .workspace {
    flex: 1; display: grid; grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr auto; gap: 16px; padding: 16px; overflow: hidden;
  }

  .panel {
    background: rgba(255,255,255,0.03);
    backdrop-filter: blur(24px);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    display: flex; flex-direction: column; overflow: hidden;
  }

  .panel-header {
    padding: 16px 20px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 8px;
  }
  .panel-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text2); }
  .panel-badge {
    padding: 2px 8px; border-radius: 999px;
    background: rgba(240,165,0,0.15); color: var(--amber);
    font-size: 10px; font-weight: 500;
  }

  .panel-body { flex: 1; padding: 16px 20px; overflow-y: auto; }
  .panel-body pre { font-family: 'JetBrains Mono', monospace; font-size: 11px; line-height: 1.6; white-space: pre-wrap; }

  /* THOUGHT STREAM */
  .thought-item { margin-bottom: 12px; padding: 12px; border-radius: var(--radius); background: rgba(255,255,255,0.03); }
  .thought-text { font-size: 13px; line-height: 1.6; }
  .thought-meta { font-size: 10px; color: var(--text2); margin-top: 8px; }

  /* TOOL TRACE */
  .tool-item { margin-bottom: 8px; padding: 10px; border-radius: var(--radius-sm); background: rgba(255,255,255,0.03); }
  .tool-header { display: flex; align-items: center; justify-content: space-between; }
  .tool-name { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--amber); }
  .tool-status {
    padding: 2px 8px; border-radius: 999px; font-size: 10px;
  }
  .tool-status.running { background: rgba(59,130,246,0.2); color: var(--blue); }
  .tool-status.success { background: rgba(62,207,110,0.2); color: var(--green); }
  .tool-status.error { background: rgba(239,68,68,0.2); color: var(--red); }
  .tool-latency { font-size: 10px; color: var(--text2); margin-top: 4px; }

  /* DEBUG INSPECTOR */
  .debug-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border); }
  .debug-key { font-size: 11px; color: var(--text2); }
  .debug-val { font-size: 11px; font-family: 'JetBrains Mono', monospace; }

  /* OUTPUT PANEL */
  .output-panel { grid-column: span 3; }
  .output-content { font-size: 14px; line-height: 1.8; }
  .output-content p { margin-bottom: 12px; }
  .output-content code { background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; }

  /* INPUT BAR */
  .input-bar {
    padding: 16px 20px; border-top: 1px solid var(--border);
    display: flex; gap: 12px; background: rgba(255,255,255,0.02);
  }

  .input-wrapper { flex: 1; position: relative; }
  .input-field {
    width: 100%; padding: 14px 16px; border-radius: var(--radius);
    background: rgba(255,255,255,0.05); border: 1px solid var(--border);
    color: var(--text); font-size: 14px; outline: none;
    transition: all 0.15s ease;
  }
  .input-field:focus { border-color: var(--amber); box-shadow: 0 0 0 3px rgba(240,165,0,0.1); }
  .input-field::placeholder { color: var(--text2); }

  .model-select {
    padding: 14px 16px; border-radius: var(--radius);
    background: rgba(255,255,255,0.05); border: 1px solid var(--border);
    color: var(--text); font-size: 12px; outline: none; cursor: pointer;
  }

  .run-btn {
    padding: 14px 24px; border-radius: var(--radius);
    background: linear-gradient(135deg, var(--amber), var(--amber2));
    border: none; color: var(--bg); font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.15s ease;
  }
  .run-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(240,165,0,0.3); }
  .run-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  /* COMMAND PALETTE */
  .cmd-palette-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.7);
    display: none; align-items: flex-start; justify-content: center; padding-top: 120px;
    z-index: 1000;
  }
  .cmd-palette-overlay.open { display: flex; }
  .cmd-palette {
    width: 480px; background: var(--bg2); border: 1px solid var(--border);
    border-radius: var(--radius-lg); box-shadow: 0 24px 80px rgba(0,0,0,0.5);
  }
  .cmd-input {
    width: 100%; padding: 16px 20px; background: transparent;
    border: none; border-bottom: 1px solid var(--border);
    color: var(--text); font-size: 15px; outline: none;
  }
  .cmd-list { padding: 8px; max-height: 320px; overflow-y: auto; }
  .cmd-item {
    padding: 12px 16px; border-radius: var(--radius-sm); cursor: pointer;
    display: flex; align-items: center; gap: 12px;
  }
  .cmd-item:hover { background: rgba(255,255,255,0.05); }
  .cmd-item-icon { font-size: 16px; }
  .cmd-item-text { flex: 1; }
  .cmd-item-shortcut {
    font-size: 11px; color: var(--text2);
    font-family: 'JetBrains Mono', monospace;
  }

  /* RESPONSIVE */
  @media (max-width: 1200px) {
    .workspace { grid-template-columns: 1fr 1fr; }
    .output-panel { grid-column: span 2; }
  }
  @media (max-width: 900px) {
    .app { grid-template-columns: 1fr; }
    .sidebar { display: none; }
    .workspace { grid-template-columns: 1fr; }
    .output-panel { grid-column: span 1; }
  }
</style>
</head>
<body>
<div class="app">
  <!-- SIDEBAR -->
  <div class="sidebar">
    <div class="brand">
      <div class="brand-mark">⚡</div>
      <div class="brand-text">
        <h1>Ouwibo Agent</h1>
        <p>AI Ops Dashboard</p>
      </div>
    </div>

    <button class="new-task-btn" id="new-task-btn">
      <span>+</span> New Task
    </button>

    <div class="tasks-list" id="tasks-list">
      <div class="task-item active" data-task="0">
        <div class="task-title">Task 1</div>
        <div class="task-meta">Just now</div>
      </div>
    </div>

    <div class="sidebar-footer">
      <button class="sidebar-btn" id="settings-btn">⚙️ Settings</button>
      <button class="sidebar-btn" id="prompt-btn">📝 Edit Prompt</button>
    </div>
  </div>

  <!-- MAIN -->
  <div class="main">
    <!-- TOP BAR -->
    <div class="topbar">
      <div class="mode-tabs">
        <button class="mode-tab active" data-mode="agent">Agent</button>
        <button class="mode-tab" data-mode="chat">Chat</button>
        <button class="mode-tab" data-mode="debug">Debug</button>
      </div>

      <div class="topbar-right">
        <div class="status-badge">
          <div class="status-dot"></div>
          <span id="status-text">Ready</span>
        </div>
        <div class="cmd-hint">⌘K</div>
      </div>
    </div>

    <!-- WORKSPACE -->
    <div class="workspace">
      <!-- THOUGHT STREAM -->
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">🧠 Thinking</span>
          <span class="panel-badge" id="thought-count">0</span>
        </div>
        <div class="panel-body" id="thought-stream">
          <div class="thought-item">
            <div class="thought-text">Awaiting input...</div>
          </div>
        </div>
      </div>

      <!-- TOOL TRACE -->
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">🛠 Tool Trace</span>
          <span class="panel-badge" id="tool-count">0</span>
        </div>
        <div class="panel-body" id="tool-trace">
          <div class="tool-item">
            <div class="tool-header">
              <span class="tool-name">no_tools_yet</span>
              <span class="tool-status success">idle</span>
            </div>
          </div>
        </div>
      </div>

      <!-- DEBUG INSPECTOR -->
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">🔍 Debug</span>
        </div>
        <div class="panel-body" id="debug-panel">
          <div class="debug-row">
            <span class="debug-key">latency</span>
            <span class="debug-val" id="debug-latency">--</span>
          </div>
          <div class="debug-row">
            <span class="debug-key">tokens</span>
            <span class="debug-val" id="debug-tokens">--</span>
          </div>
          <div class="debug-row">
            <span class="debug-key">model</span>
            <span class="debug-val" id="debug-model">--</span>
          </div>
          <div class="debug-row">
            <span class="debug-key">status</span>
            <span class="debug-val" id="debug-status">--</span>
          </div>
        </div>
      </div>

      <!-- OUTPUT -->
      <div class="panel output-panel">
        <div class="panel-header">
          <span class="panel-title">✨ Result</span>
        </div>
        <div class="panel-body">
          <div class="output-content" id="output-content">
            <p>Final answer will appear here after execution.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- INPUT BAR -->
    <div class="input-bar">
      <div class="input-wrapper">
        <input type="text" class="input-field" id="input-field" placeholder="Ask anything... (Shift+Enter for multiline)" autocomplete="off">
      </div>
      <select class="model-select" id="model-select">
        <option value="auto">Auto rotate</option>
        ${modelOptions}
      </select>
      <button class="run-btn" id="run-btn">Run</button>
    </div>
  </div>
</div>

<!-- COMMAND PALETTE -->
<div class="cmd-palette-overlay" id="cmd-palette">
  <div class="cmd-palette">
    <input type="text" class="cmd-input" id="cmd-input" placeholder="Type a command...">
    <div class="cmd-list">
      <div class="cmd-item" data-cmd="clear">
        <span class="cmd-item-icon">🗑</span>
        <span class="cmd-item-text">Clear all panels</span>
        <span class="cmd-item-shortcut">Ctrl+L</span>
      </div>
      <div class="cmd-item" data-cmd="new-task">
        <span class="cmd-item-icon">➕</span>
        <span class="cmd-item-text">New task session</span>
        <span class="cmd-item-shortcut">Ctrl+N</span>
      </div>
      <div class="cmd-item" data-cmd="mode:agent">
        <span class="cmd-item-icon">🤖</span>
        <span class="cmd-item-text">Switch to Agent mode</span>
      </div>
      <div class="cmd-item" data-cmd="mode:chat">
        <span class="cmd-item-icon">💬</span>
        <span class="cmd-item-text">Switch to Chat mode</span>
      </div>
      <div class="cmd-item" data-cmd="mode:debug">
        <span class="cmd-item-icon">🔍</span>
        <span class="cmd-item-text">Switch to Debug mode</span>
      </div>
    </div>
  </div>
</div>

<script>
(function() {
  const sessionId = crypto.randomUUID();
  let taskCounter = 1;
  let thoughtCount = 0;
  let toolCount = 0;

  // Elements
  const inputField = document.getElementById('input-field');
  const runBtn = document.getElementById('run-btn');
  const modelSelect = document.getElementById('model-select');
  const thoughtStream = document.getElementById('thought-stream');
  const toolTrace = document.getElementById('tool-trace');
  const outputContent = document.getElementById('output-content');
  const debugLatency = document.getElementById('debug-latency');
  const debugTokens = document.getElementById('debug-tokens');
  const debugModel = document.getElementById('debug-model');
  const debugStatus = document.getElementById('debug-status');
  const thoughtCountBadge = document.getElementById('thought-count');
  const toolCountBadge = document.getElementById('tool-count');
  const statusText = document.getElementById('status-text');
  const cmdPalette = document.getElementById('cmd-palette');
  const cmdInput = document.getElementById('cmd-input');
  const newTaskBtn = document.getElementById('new-task-btn');
  const tasksList = document.getElementById('tasks-list');
  const modeTabs = document.querySelectorAll('.mode-tab');
  const cmdItems = document.querySelectorAll('.cmd-item');

  function addThought(text) {
    thoughtCount++;
    thoughtCountBadge.textContent = thoughtCount;
    const item = document.createElement('div');
    item.className = 'thought-item';
    item.innerHTML = \`
      <div class="thought-text">\${text}</div>
      <div class="thought-meta">\${new Date().toLocaleTimeString()}</div>
    \`;
    thoughtStream.appendChild(item);
    thoughtStream.scrollTop = thoughtStream.scrollHeight;
  }

  function addTool(name, status, latency) {
    toolCount++;
    toolCountBadge.textContent = toolCount;
    const item = document.createElement('div');
    item.className = 'tool-item';
    item.innerHTML = \`
      <div class="tool-header">
        <span class="tool-name">\${name}</span>
        <span class="tool-status \${status}">\${status}</span>
      </div>
      \${latency ? \`<div class="tool-latency">\${latency}ms</div>\` : ''}
    \`;
    toolTrace.appendChild(item);
    toolTrace.scrollTop = toolTrace.scrollHeight;
  }

  function setOutput(html) {
    outputContent.innerHTML = html;
  }

  function setDebug(data) {
    if (data.latency !== undefined) debugLatency.textContent = data.latency + 'ms';
    if (data.tokens !== undefined) debugTokens.textContent = data.tokens;
    if (data.model !== undefined) debugModel.textContent = data.model;
    if (data.status !== undefined) debugStatus.textContent = data.status;
  }

  function setStatus(text) {
    statusText.textContent = text;
  }

  function setBusy(busy) {
    runBtn.disabled = busy;
    inputField.disabled = busy;
    setStatus(busy ? 'Processing...' : 'Ready');
  }

  function clearPanels() {
    thoughtStream.innerHTML = '<div class="thought-item"><div class="thought-text">Awaiting input...</div></div>';
    toolTrace.innerHTML = '<div class="tool-item"><div class="tool-header"><span class="tool-name">no_tools_yet</span><span class="tool-status success">idle</span></div></div>';
    outputContent.innerHTML = '<p>Final answer will appear here after execution.</p>';
    thoughtCount = 0;
    toolCount = 0;
    thoughtCountBadge.textContent = '0';
    toolCountBadge.textContent = '0';
    setDebug({ latency: '--', tokens: '--', model: '--', status: '--' });
  }

  async function runAgent() {
    const message = inputField.value.trim();
    if (!message) return;

    clearPanels();
    setBusy(true);

    const startTime = Date.now();
    const model = modelSelect.value;

    addThought('Analyzing task: ' + message);
    addTool('task_planner', 'running');

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, model, sessionId, agentMode: true })
      });

      const data = await response.json();
      const latency = Date.now() - startTime;

      // Update tool status
      const firstTool = toolTrace.querySelector('.tool-status');
      if (firstTool) {
        firstTool.className = 'tool-status success';
        firstTool.textContent = 'success';
      }
      const latencyEl = toolTrace.querySelector('.tool-latency');
      if (latencyEl) latencyEl.textContent = latency + 'ms';

      // Add thoughts
      if (data.steps) {
        data.steps.forEach(step => {
          addThought(step.thought);
          if (step.tool) {
            addTool(step.tool.name, step.tool.status, step.tool.latency);
          }
        });
      }

      // Set output
      if (data.finalAnswer) {
        if (window.marked) {
          setOutput(window.marked.parse(data.finalAnswer));
        } else {
          setOutput('<p>' + data.finalAnswer.replace(/\\n/g, '</p><p>') + '</p>');
        }
      } else if (data.answer) {
        if (window.marked) {
          setOutput(window.marked.parse(data.answer));
        } else {
          setOutput('<p>' + data.answer.replace(/\\n/g, '</p><p>') + '</p>');
        }
      }

      setDebug({
        latency,
        tokens: data.usage?.total_tokens || '--',
        model: data.model || model,
        status: 'ok'
      });

    } catch (error) {
      addThought('Error: ' + error.message);
      addTool('api_call', 'error');
      setOutput('<p style="color: var(--red);">Network error. Please try again.</p>');
      setDebug({ status: 'error' });
    } finally {
      setBusy(false);
      inputField.focus();
    }
  }

  // Event listeners
  runBtn.addEventListener('click', runAgent);

  inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      runAgent();
    }
  });

  modeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      modeTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  // Command palette
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      cmdPalette.classList.toggle('open');
      if (cmdPalette.classList.contains('open')) {
        cmdInput.focus();
      }
    }
    if (e.key === 'Escape') {
      cmdPalette.classList.remove('open');
    }
  });

  cmdInput.addEventListener('input', () => {
    const query = cmdInput.value.toLowerCase();
    cmdItems.forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(query) ? '' : 'none';
    });
  });

  cmdItems.forEach(item => {
    item.addEventListener('click', () => {
      const cmd = item.dataset.cmd;
      if (cmd === 'clear') clearPanels();
      if (cmd === 'new-task') newTaskBtn.click();
      if (cmd.startsWith('mode:')) {
        const mode = cmd.split(':')[1];
        document.querySelector(\`[data-mode="\${mode}"]\`).click();
      }
      cmdPalette.classList.remove('open');
    });
  });

  newTaskBtn.addEventListener('click', () => {
    taskCounter++;
    const taskItem = document.createElement('div');
    taskItem.className = 'task-item';
    taskItem.dataset.task = taskCounter - 1;
    taskItem.innerHTML = \`
      <div class="task-title">Task \${taskCounter}</div>
      <div class="task-meta">Just now</div>
    \`;
    taskItem.addEventListener('click', () => {
      document.querySelectorAll('.task-item').forEach(t => t.classList.remove('active'));
      taskItem.classList.add('active');
      clearPanels();
    });
    tasksList.appendChild(taskItem);
    clearPanels();
  });

  // Focus input on load
  inputField.focus();
})();
</script>
</body>
</html>`;
}

// ============== ROUTES ==============
async function handleChat(request: Request, env: Env): Promise<Response> {
  const payload = await request.json().catch(() => ({})) as RequestPayload;
  const message = trimMessage(payload.message || payload.messages?.[payload.messages.length - 1]?.content);
  if (!message) return jsonResponse({ error: "message required" }, 400);

  const model = resolveChatModel(payload, env);
  const wantsStream = payload.stream === true || (request.headers.get("accept")?.includes("text/event-stream") ?? false);

  const upstream = await fetchDashScope(env, model, [{ role: "user", content: message }], wantsStream);

  if (!upstream.ok) {
    const data = await upstream.json().catch(() => ({}));
    return jsonResponse({ error: humanizeError(upstream.status), details: data }, upstream.status);
  }

  if (wantsStream && upstream.body) {
    return new Response(upstream.body, {
      headers: withCors({
        "Content-Type": "text/event-stream",
      }),
    });
  }

  const data = await upstream.json() as { choices?: Array<{ message?: { content?: string } }>; usage?: unknown };
  const answer = data.choices?.[0]?.message?.content || "";

  return jsonResponse({ ok: true, model, answer, usage: data.usage || null });
}

async function handleAgent(request: Request, env: Env): Promise<Response> {
  const payload = await request.json().catch(() => ({})) as RequestPayload;
  const message = trimMessage(payload.message);
  if (!message) return jsonResponse({ error: "message required" }, 400);

  const model = resolveChatModel(payload, env);
  const state = await simulateAgentThinking(message, model, env);

  return jsonResponse({
    ok: true,
    model,
    steps: state.steps,
    finalAnswer: state.finalAnswer,
    usage: { total_tokens: Math.ceil(message.length / 4) + Math.ceil((state.finalAnswer?.length || 0) / 4) },
  });
}

function buildModelsPayload(): unknown {
  return {
    models: modelCatalog,
    default: defaultModel,
    autoRotate: true,
    description: "Models rotate automatically when mode=auto is set.",
  };
}

// ============== EXPORT ==============
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: withCors() });
    }

    const url = new URL(request.url);
    const baseUrl = getBaseUrl(request);

    if (url.pathname === "/") {
      return new Response(superPremiumUI(baseUrl), {
        headers: withCors({ "Content-Type": "text/html; charset=utf-8" }),
      });
    }

    if (url.pathname === "/health") {
      return jsonResponse({
        status: "ok",
        agent: "Ouwibo Agent",
        version: "2.0.0-super-premium",
        model: env.DEFAULT_MODEL || defaultModel,
        rateLimit: false,
        history: false,
      });
    }

    if (url.pathname === "/api/models") return jsonResponse(buildModelsPayload());
    if (url.pathname === "/api/chat" && request.method === "POST") return handleChat(request, env);
    if (url.pathname === "/api/agent" && request.method === "POST") return handleAgent(request, env);

    if (url.pathname === "/favicon.svg") return svgResponse(buildFaviconSvg());
    if (url.pathname === "/og-image.svg") return svgResponse(buildOgImageSvg(baseUrl));
    if (url.pathname === "/robots.txt") return new Response(buildRobotsTxt(baseUrl), { headers: withCors({ "Content-Type": "text/plain" }) });
    if (url.pathname === "/sitemap.xml") return new Response(buildSitemap(baseUrl), { headers: withCors({ "Content-Type": "application/xml" }) });

    return jsonResponse({ error: "Not found" }, 404);
  },
};

function getBaseUrl(request: Request): string {
  const url = new URL(request.url);
  return url.origin.replace(/\/$/, "");
}
