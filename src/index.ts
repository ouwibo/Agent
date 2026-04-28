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
  const models = modelCatalog
    .map(
      (model) => `
        <div class="card">
          <div class="card__title">${model.label}</div>
          <div class="card__id">${model.id}</div>
          <div class="card__body">${model.purpose}</div>
        </div>
      `,
    )
    .join("");

  return `
    <!doctype html>
    <html lang="id">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Ouwibo Agent</title>
        <style>
          :root { color-scheme: dark; }
          body {
            margin: 0;
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
            background: radial-gradient(circle at top, #1f2937 0, #09090b 50%);
            color: #f4f4f5;
          }
          main { max-width: 1080px; margin: 0 auto; padding: 72px 24px 56px; }
          .eyebrow { text-transform: uppercase; letter-spacing: .18em; color: #a1a1aa; font-size: 12px; }
          h1 { margin: 12px 0 16px; font-size: clamp(40px, 7vw, 72px); line-height: .95; }
          .lead { max-width: 720px; color: #d4d4d8; font-size: 18px; line-height: 1.7; }
          .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-top: 36px; }
          .card {
            border: 1px solid rgba(255,255,255,.08);
            background: rgba(24,24,27,.72);
            border-radius: 20px;
            padding: 18px;
            box-shadow: 0 24px 80px rgba(0,0,0,.24);
          }
          .card__title { font-weight: 700; font-size: 17px; }
          .card__id { margin-top: 8px; color: #60a5fa; font-size: 13px; }
          .card__body { margin-top: 10px; color: #d4d4d8; line-height: 1.6; font-size: 14px; }
          .panel { margin-top: 30px; padding: 18px 20px; border-radius: 18px; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); }
          code { background: rgba(255,255,255,.08); padding: 2px 6px; border-radius: 8px; }
        </style>
      </head>
      <body>
        <main>
          <div class="eyebrow">Agent Repo / Cloudflare Ready</div>
          <h1>Ouwibo Agent</h1>
          <p class="lead">
            A clean, professional AI agent foundation for Cloudflare deployment.
            Built for manual model selection, Qwen/DashScope integration, and a polished public identity.
          </p>

          <div class="panel">
            Default model: <code>${defaultModel}</code> ·
            API route: <code>/api/chat</code> ·
            Health check: <code>/health</code>
          </div>

          <div class="grid">${models}</div>
        </main>
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

  const model = resolveModel(payload.model ?? env.DEFAULT_MODEL ?? defaultModel);
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
