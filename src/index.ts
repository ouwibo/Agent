import { defaultModel, modelCatalog, resolveModel, getModelRotation } from "./models";

type Env = {
  DASHSCOPE_API_KEY: string;
  DASHSCOPE_BASE_URL?: string;
  DEFAULT_MODEL?: string;
};

type RequestPayload = {
  message?: string;
  prompt?: string;
  mode?: string;
  model?: string;
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

function svgResponse(svg: string): Response {
  return new Response(svg, {
    headers: { "Content-Type": "image/svg+xml; charset=utf-8" },
  });
}

function homePage(baseUrl: string): string {
  const modelOptions = modelCatalog
    .map(
      (model) => `<option value="${model.id}">${model.label}</option>`,
    )
    .join("");

  const title = "Ouwibo Agent";
  const description =
    "Ouwibo Agent is a public AI experience for your own brand: a polished website, a chat-ready API, and a flexible backend that can adapt to multiple models without exposing the plumbing on the homepage.";
  const canonical = `${baseUrl.replace(/\/$/, "")}/`;
  const ogImage = `${baseUrl.replace(/\/$/, "")}/og-image.svg`;
  const favicon = `${baseUrl.replace(/\/$/, "")}/favicon.svg`;

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="${description}" />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href="${canonical}" />
        <link rel="icon" href="${favicon}" type="image/svg+xml" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="${title}" />
        <meta property="og:description" content="${description}" />
        <meta property="og:url" content="${canonical}" />
        <meta property="og:image" content="${ogImage}" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${title}" />
        <meta name="twitter:description" content="${description}" />
        <meta name="twitter:image" content="${ogImage}" />
        <meta name="theme-color" content="#050816" />
        <title>${title}</title>
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Ouwibo Agent",
          "description": "${description}",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Cloudflare Workers",
          "url": "${canonical}",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          }
        }
        </script>
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

          <section class="panel section chat-shell" id="chat">
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
              <div style="margin-top:10px;"><strong>GET</strong> <code>/api/models</code></div>
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

  const payload = (await request.json().catch(() => ({}))) as RequestPayload;
  const message = typeof payload.message === "string" ? payload.message : typeof payload.prompt === "string" ? payload.prompt : "";

  if (!message.trim()) {
    return json({ error: "message is required" }, 400);
  }

  const model = payload.mode === "auto"
    ? getModelRotation()
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

function ogImageSvg(title: string, description: string): string {
  const safeTitle = title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const safeDescription = description.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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
    </svg>
  `;
}

function faviconSvg(): string {
  return `
    <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none">
      <rect width="64" height="64" rx="18" fill="#050816"/>
      <path d="M14 42C20 20 44 16 50 24C55 31 47 46 32 48C24 49 17 47 14 42Z" fill="#38BDF8" fill-opacity="0.18"/>
      <path d="M18 40C22 27 33 20 45 22" stroke="#38BDF8" stroke-width="4" stroke-linecap="round"/>
      <path d="M20 44C30 40 39 41 46 46" stroke="#E2E8F0" stroke-width="4" stroke-linecap="round"/>
    </svg>
  `;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);
    const baseUrl = url.origin;

    if (url.pathname === "/") {
      return html(homePage(baseUrl));
    }

    if (url.pathname === "/health") {
      return json({
        ok: true,
        name: "Ouwibo Agent",
        model: env.DEFAULT_MODEL || defaultModel,
      });
    }

    if (url.pathname === "/api/models") {
      return json({
        defaultModel: env.DEFAULT_MODEL || defaultModel,
        mode: "manual-or-auto-rotate",
        models: modelCatalog,
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
        headers: { "Content-Type": "text/plain" },
      });
    }

    if (url.pathname === "/sitemap.xml") {
      return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
  </url>
</urlset>`, {
        headers: { "Content-Type": "application/xml" },
      });
    }

    return json({ error: "Not found" }, 404);
  },
};
