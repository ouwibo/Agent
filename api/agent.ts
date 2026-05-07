type ZoStreamEvent = {
  type: "text" | "done" | "error";
  content?: string;
  message?: string;
};

const DEFAULT_MODEL = "zo:openai/gpt-5.4-mini";
const PUBLIC_MODEL_PATTERNS = [/\/gpt-5\.4-mini$/i, /\/glm-5$/i, /kimi/i];

function writeEvent(res: any, event: ZoStreamEvent) {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

function extractBody(req: any) {
  const body = req.body ?? {};
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
}

function extractInput(body: any) {
  const input = body?.input ?? body?.message ?? body?.q ?? "";
  return typeof input === "string" ? input.trim() : "";
}

function normalizeModelName(modelName: unknown) {
  if (typeof modelName !== "string") return DEFAULT_MODEL;
  const trimmed = modelName.trim();
  if (!trimmed) return DEFAULT_MODEL;
  return PUBLIC_MODEL_PATTERNS.some((pattern) => pattern.test(trimmed)) ? trimmed : DEFAULT_MODEL;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.ZO_API_KEY;
  if (!apiKey) return res.status(401).json({ error: "ZO_API_KEY is not configured on the server" });

  const body = extractBody(req);
  const input = extractInput(body);
  if (!input) return res.status(400).json({ error: "Message is required" });

  const modelName = normalizeModelName(body?.model_name ?? body?.model);
  const conversationId =
    typeof body?.conversation_id === "string" && body.conversation_id.trim()
      ? body.conversation_id.trim()
      : typeof body?.conversationId === "string" && body.conversationId.trim()
        ? body.conversationId.trim()
        : undefined;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  let upstream: Response;
  try {
    upstream = await fetch("https://api.zo.computer/zo/ask", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      signal: controller.signal,
      body: JSON.stringify({ input, conversation_id: conversationId, model_name: modelName, stream: true }),
    });
  } catch (error: any) {
    clearTimeout(timeout);
    return res.status(500).json({ error: error?.name === "AbortError" ? "Zo request timed out" : error?.message || "Zo request failed" });
  }

  if (!upstream.ok || !upstream.body) {
    clearTimeout(timeout);
    const errorBody = await upstream.text().catch(() => "");
    return res.status(upstream.status).json({ error: errorBody || `Zo request failed (${upstream.status})` });
  }

  const conversationHeader = upstream.headers.get("x-conversation-id");
  if (conversationHeader) res.setHeader("x-conversation-id", conversationHeader);

  res.status(200);
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let currentEvent = "";

  const finish = () => {
    clearTimeout(timeout);
    try { writeEvent(res, { type: "done" }); } catch {}
    try { res.end(); } catch {}
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("event: ")) {
          currentEvent = line.slice(7).trim();
          continue;
        }

        if (!line.startsWith("data: ")) continue;
        const raw = line.slice(6).trim();
        if (!raw) continue;

        let parsed: any = null;
        try {
          parsed = JSON.parse(raw);
        } catch {
          continue;
        }

        if (currentEvent === "Error") {
          writeEvent(res, { type: "error", message: parsed?.message || "Zo returned an error" });
          finish();
          return;
        }

        if (currentEvent === "End") {
          finish();
          return;
        }

        const content = typeof parsed?.content === "string" ? parsed.content : "";
        if (content) writeEvent(res, { type: "text", content });
      }
    }

    finish();
  } catch (error: any) {
    clearTimeout(timeout);
    writeEvent(res, { type: "error", message: error?.message || "Streaming failed" });
    finish();
  }
}
