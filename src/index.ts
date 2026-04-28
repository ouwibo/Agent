import { defaultModel, modelCatalog, resolveModel } from "./models";

type Env = {
  DASHSCOPE_API_KEY: string;
  DASHSCOPE_BASE_URL?: string;
  DEFAULT_MODEL?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function html(body: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      ...corsHeaders,
    },
  });
}

function homePage(): string {
  const modelOptions = modelCatalog
    .map(
      (model) => `<option value="${model.id}">${model.label}</option>`,
    )
    .join("");

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Ouwibo Agent</title>
        <style>
          :root { color-scheme: dark; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
            background:
              radial-gradient(circle at top, rgba(56, 189, 248, 0.14), transparent 28%),
              radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.12), transparent 22%),
              linear-gradient(180deg, #050816 0%, #09090b 48%, #040404 100%);
            color: #f4f4f5;
          }
          main { max-width: 1160px; margin: 0 auto; padding: 80px 24px 64px; }
          .hero { display: grid; grid-template-columns: 1.3fr .9fr; gap: 24px; align-items: stretch; }
          .eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            text-transform: uppercase;
            letter-spacing: .2em;
            color: #a1a1aa;
            font-size: 11px;
          }
          .eyebrow::before {
            content: '';
            width: 42px;
            height: 1px;
            background: linear-gradient(90deg, #38bdf8, transparent);
          }
          h1 {
            margin: 14px 0 16px;
            font-size: clamp(44px, 8vw, 82px);
            line-height: .92;
            letter-spacing: -0.05em;
            max-width: 10ch;
          }
          .lead {
            max-width: 760px;
            color: #d4d4d8;
            font-size: 18px;
            line-height: 1.75;
            margin: 0;
          }
          .actions {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 28px;
          }
          .button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 12px 18px;
            border-radius: 999px;
            text-decoration: none;
            font-weight: 700;
            font-size: 14px;
            border: 1px solid rgba(255,255,255,.12);
            transition: transform .2s ease, border-color .2s ease, background .2s ease;
          }
          .button:hover { transform: translateY(-1px); }
          .button--primary { background: linear-gradient(135deg, #2563eb, #06b6d4); color: white; }
          .button--secondary { background: rgba(255,255,255,.04); color: #f4f4f5; }
          .statcard, .panel, .feature {
            border: 1px solid rgba(255,255,255,.08);
            background: rgba(15, 23, 42, .58);
            backdrop-filter: blur(16px);
            border-radius: 24px;
            box-shadow: 0 24px 80px rgba(0,0,0,.32);
          }
          .statcard { padding: 22px; display: grid; gap: 14px; }
          .statgrid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
          .stat {
            padding: 16px;
            border-radius: 18px;
            background: rgba(255,255,255,.04);
            border: 1px solid rgba(255,255,255,.06);
          }
          .stat strong { display: block; font-size: 22px; margin-bottom: 6px; }
          .stat span { color: #a1a1aa; font-size: 13px; line-height: 1.5; }
          .panel { margin-top: 24px; padding: 20px 22px; }
          .panel h2, .section h2 {
            margin: 0 0 10px;
            font-size: 22px;
            letter-spacing: -0.02em;
          }
          .panel p, .section p { color: #d4d4d8; line-height: 1.7; margin: 0; }
          .section { margin-top: 28px; }
          .features {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 16px;
            margin-top: 16px;
          }
          .feature { padding: 18px; min-height: 160px; }
          .feature h3 { margin: 0 0 10px; font-size: 16px; }
          .feature p { margin: 0; color: #d4d4d8; line-height: 1.65; font-size: 14px; }
          .api {
            margin-top: 20px;
            padding: 18px 20px;
            border-radius: 20px;
            background: rgba(255,255,255,.04);
            border: 1px solid rgba(255,255,255,.08);
          }
          .api code, .chip code {
            background: rgba(255,255,255,.08);
            padding: 2px 8px;
            border-radius: 8px;
          }
          .chiprow { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
          .chip {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            border-radius: 999px;
            border: 1px solid rgba(255,255,255,.08);
            background: rgba(255,255,255,.04);
            padding: 8px 12px;
            color: #e4e4e7;
            font-size: 13px;
          }
          .chat-shell {
            margin-top: 24px;
            padding: 18px;
            border-radius: 24px;
            border: 1px solid rgba(255,255,255,.08);
            background: rgba(15, 23, 42, .72);
            box-shadow: 0 24px 80px rgba(0,0,0,.32);
          }
          .chat-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
          .chat-title { margin: 0; font-size: 18px; }
          .chat-subtitle { margin: 6px 0 0; color: #a1a1aa; font-size: 13px; line-height: 1.5; }
          .chat-controls { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 16px; }
          .chat-controls select, .chat-controls button, .chat-input {
            border-radius: 14px;
            border: 1px solid rgba(255,255,255,.12);
            background: rgba(255,255,255,.05);
            color: #f4f4f5;
            font: inherit;
          }
          .chat-controls select { padding: 10px 12px; }
          .chat-controls button { padding: 10px 14px; cursor: pointer; }
          .chat-log { margin-top: 16px; display: grid; gap: 12px; max-height: 380px; overflow: auto; padding-right: 2px; }
          .bubble {
            padding: 14px 16px;
            border-radius: 18px;
            line-height: 1.65;
            white-space: pre-wrap;
          }
          .bubble--user { background: linear-gradient(135deg, rgba(37,99,235,.26), rgba(6,182,212,.18)); border: 1px solid rgba(96,165,250,.28); justify-self: end; max-width: 92%; }
          .bubble--assistant { background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.08); max-width: 92%; }
          .chat-compose { display: grid; grid-template-columns: 1fr auto; gap: 10px; margin-top: 16px; }
          .chat-input { padding: 12px 14px; min-height: 48px; }
          .chat-input::placeholder { color: #71717a; }
          .chat-status { margin-top: 10px; color: #a1a1aa; font-size: 12px; }
          .muted { color: #a1a1aa; }
          @media (max-width: 960px) {
            .hero { grid-template-columns: 1fr; }
            .features { grid-template-columns: 1fr; }
          }
        </style>
      </head>
      <body>
        <main>
          <section class="hero">
            <div>
              <div class="eyebrow">Public AI Agent / Cloudflare Ready</div>
              <h1>Ouwibo Agent</h1>
              <p class="lead">
                Ouwibo Agent is a public AI experience for your own brand: a polished website, a chat-ready API,
                and a flexible backend that can adapt to multiple models without exposing the plumbing on the homepage.
              </p>
              <div class="actions">
                <a class="button button--primary" href="#what">What it is</a>
                <a class="button button--secondary" href="#api">API access</a>
              </div>
            </div>

            <aside class="statcard">
              <div class="statgrid">
                <div class="stat">
                  <strong>Public</strong>
                  <span>A clean, shareable website for visitors.</span>
                </div>
                <div class="stat">
                  <strong>Flexible</strong>
                  <span>Manual model choice or automatic rotation.</span>
                </div>
                <div class="stat">
                  <strong>Cloudflare</strong>
                  <span>Deployable as a fast, global Worker.</span>
                </div>
                <div class="stat">
                  <strong>Brand-first</strong>
                  <span>Shows Ouwibo Agent, not backend vendor details.</span>
                </div>
              </div>
            </aside>
          </section>

          <section class="panel section" id="what">
            <h2>What Ouwibo Agent actually is</h2>
            <p>
              It is a branded agent platform for public use: a professional front door for your AI assistant,
              designed to feel like a real product rather than a demo. Visitors see your brand, your message,
              and a clean interface while the model routing stays behind the scenes.
            </p>
            <div class="chiprow">
              <div class="chip"><code>AI assistant</code> for public visitors</div>
              <div class="chip"><code>API-backed</code> for apps and integrations</div>
              <div class="chip"><code>Model-agnostic</code> behind the scenes</div>
              <div class="chip"><code>Cloudflare-friendly</code> deployment</div>
            </div>
          </section>

          <section class="section">
            <div class="features">
              <div class="feature">
                <h3>Professional public brand</h3>
                <p>
                  The homepage introduces Ouwibo Agent as a real product, with a premium visual style and clear positioning.
                </p>
              </div>
              <div class="feature">
                <h3>Manual or automatic routing</h3>
                <p>
                  The backend can accept a model choice from the client, or rotate automatically when you want a hands-off mode.
                </p>
              </div>
              <div class="feature">
                <h3>Simple integration surface</h3>
                <p>
                  A small set of routes keeps the system easy to extend: homepage, health check, and chat API.
                </p>
              </div>
            </div>
          </section>

          <section class="panel section" id="chat">
            <div class="chat-head">
              <div>
                <h2 class="chat-title">Live chat demo</h2>
                <p class="chat-subtitle">Try the public experience. You can choose a model or leave it on auto.</p>
              </div>
              <span class="muted">Powered by the backend API</span>
            </div>

            <div class="chat-controls">
              <select id="model-select" aria-label="Model selection">
                <option value="auto">Auto rotate</option>
                ${modelOptions}
              </select>
              <button id="clear-chat" type="button">Clear chat</button>
            </div>

            <div id="chat-log" class="chat-log" aria-live="polite"></div>

            <form id="chat-form" class="chat-compose">
              <input id="chat-input" class="chat-input" type="text" placeholder="Say hello to Ouwibo Agent..." autocomplete="off" />
              <button id="send-btn" type="submit">Send</button>
            </form>
            <div id="chat-status" class="chat-status">Ready.</div>
          </section>

          <section class="panel section" id="api">
            <h2>API access</h2>
            <p>
              Public frontend, private secret, and a clean API shape for your apps.
            </p>
            <div class="api" style="margin-top:14px;">
              <div><strong>GET</strong> <code>/health</code></div>
              <div style="margin-top:10px;"><strong>POST</strong> <code>/api/chat</code></div>
              <div style="margin-top:10px;color:#d4d4d8;line-height:1.7;">
                Example body: <code>{"message":"Hello","mode":"auto"}</code> or <code>{"message":"Hello","model":"qwen3-max"}</code>
              </div>
            </div>
          </section>
        </main>

        <script>
          const form = document.getElementById('chat-form');
          const input = document.getElementById('chat-input');
          const log = document.getElementById('chat-log');
          const status = document.getElementById('chat-status');
          const select = document.getElementById('model-select');
          const clearBtn = document.getElementById('clear-chat');
          const sendBtn = document.getElementById('send-btn');

          const addBubble = (kind, text) => {
            const div = document.createElement('div');
            div.className = 'bubble bubble--' + kind;
            div.textContent = text;
            log.appendChild(div);
            log.scrollTop = log.scrollHeight;
          };

          const setBusy = (busy) => {
            sendBtn.disabled = busy;
            input.disabled = busy;
            status.textContent = busy ? 'Thinking...' : 'Ready.';
          };

          clearBtn.addEventListener('click', () => {
            log.innerHTML = '';
            status.textContent = 'Chat cleared.';
            input.focus();
          });

          addBubble('assistant', 'Hello. I am Ouwibo Agent — a branded public AI assistant for your website. Ask me anything.');

          form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const message = input.value.trim();
            if (!message) return;

            addBubble('user', message);
            input.value = '';
            setBusy(true);

            try {
              const modelValue = select.value;
              const body = modelValue === 'auto'
                ? { message, mode: 'auto' }
                : { message, model: modelValue };

              const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(body),
              });

              const data = await response.json();
              if (!response.ok) {
                addBubble('assistant', data.error || 'Something went wrong.');
              } else {
                addBubble('assistant', data.answer || 'No answer returned.');
              }
            } catch (error) {
              addBubble('assistant', 'Network error. Please try again.');
            } finally {
              setBusy(false);
              input.focus();
            }
          });
        </script>
      </body>
    </html>
  `;
}

async function handleChat(request: Request, env: Env): Promise<Response> {
  if (!env.DASHSCOPE_API_KEY) {
    return json(
      {
        error: "Missing DASHSCOPE_API_KEY",
        message: "Set the secret before using chat.",
      },
      500,
    );
  }

  const payload = await request.json().catch(() => ({} as Record<string, unknown>));
  const message = typeof payload.message === "string" ? payload.message : typeof payload.prompt === "string" ? payload.prompt : "";

  if (!message.trim()) {
    return json({ error: "message is required" }, 400);
  }

  const model = payload.mode === "auto"
    ? defaultModel
    : resolveModel(payload.model ?? env.DEFAULT_MODEL ?? defaultModel);
  const baseUrl = (env.DASHSCOPE_BASE_URL || "https://dashscope-intl.aliyuncs.com/compatible-mode/v1").replace(/\/$/, "");

  const upstream = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.DASHSCOPE_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    }),
  });

  const data = await upstream.json().catch(() => ({}));

  if (!upstream.ok) {
    return json(
      {
        error: "Upstream request failed",
        status: upstream.status,
        details: data,
      },
      upstream.status,
    );
  }

  const answer =
    typeof (data as { choices?: Array<{ message?: { content?: string } }> }).choices?.[0]?.message?.content === "string"
      ? (data as { choices: Array<{ message: { content: string } }> }).choices[0].message.content
      : "";

  return json({
    model,
    answer,
    usage: (data as { usage?: unknown }).usage ?? null,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);

    if (url.pathname === "/") {
      return html(homePage());
    }

    if (url.pathname === "/health") {
      return json({
        ok: true,
        name: "Ouwibo Agent",
        model: env.DEFAULT_MODEL || defaultModel,
      });
    }

    if (url.pathname === "/api/chat" && request.method === "POST") {
      return handleChat(request, env);
    }

    return json({ error: "Not found" }, 404);
  },
};
