type ZoStreamEvent = {
  type: "text" | "thinking" | "done" | "error";
  content?: string;
  message?: string;
};

const DEFAULT_MODEL = "zo:openai/gpt-5.4-mini";
const PUBLIC_MODEL_PATTERNS = [/\/gpt-5\.4-mini$/i, /\/glm-5$/i];
const SYSTEM_PROMPT = [
  "You are OUWIBO Agent, the public AI assistant for the OuwiboAgent website.",
  "Stay consistent with the website brand and speak as the site's own agent.",
  "Do not mention Zo cloud, Zo account storage, or internal platform details unless the user explicitly asks about them.",
  "Keep replies concise, practical, and confident.",
  "When code is requested, use clear markdown code blocks.",
].join(" ");

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

function cleanContent(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function buildHistoryBlock(history: unknown) {
  if (!Array.isArray(history) || history.length === 0) return "No prior messages.";

  return history
    .slice(-16)
    .map((entry) => {
      const role = entry?.role === "assistant" ? "Assistant" : "User";
      const content = cleanContent(entry?.content);
      return content ? `${role}: ${content}` : "";
    })
    .filter(Boolean)
    .join("\n");
}

function buildPrompt(body: any, prompt: string) {
  return [
    SYSTEM_PROMPT,
    "",
    "Conversation history:",
    buildHistoryBlock(body?.history),
    "",
    "Current user request:",
    prompt,
  ].join("\n");
}

function isStreamEnd(parsed: any, currentEvent: string) {
  return currentEvent === "End" || parsed?.kind === "end" || parsed?.kind === "done";
}

function collectOutput(parsed: any) {
  const direct = cleanContent(parsed?.data?.output ?? parsed?.output ?? parsed?.result);
  return direct;
}

function splitForLiveWriting(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return [] as string[];
  if (trimmed.length <= 48) return [trimmed];

  const chunks: string[] = [];
  const tokens = trimmed.split(/(\s+)/);
  let buffer = "";

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
    writeEvent(res, { type: "text", content: chunks[i] });
    const delay = Math.min(35, Math.max(8, Math.round(chunks[i].length / 3)));
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.ZO_API_KEY;
  if (!apiKey) return res.status(401).json({ error: "ZO_API_KEY is not configured on the server" });

  const body = extractBody(req);
  const input = extractInput(body);
  if (!input) return res.status(400).json({ error: "Message is required" });

  const modelName = normalizeModelName(body?.model_name ?? body?.model);

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
      body: JSON.stringify({
        input: buildPrompt(body, input),
        model_name: modelName,
        stream: true,
      }),
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
  let sentAnyText = false;

  const finish = () => {
    clearTimeout(timeout);
    try {
      writeEvent(res, { type: "done" });
    } catch {}
    try {
      res.end();
    } catch {}
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

        if (parsed?.kind === "request") continue;

        if (parsed?.kind === "error" || currentEvent === "Error") {
          writeEvent(res, { type: "error", message: parsed?.message || parsed?.error || "Zo returned an error" });
          finish();
          return;
        }

        if (parsed?.kind === "response" && Array.isArray(parsed.parts)) {
          for (const part of parsed.parts) {
            const content = cleanContent(part?.content);
            if (!content) continue;
            if (part?.part_kind === "thinking" || part?.part_delta_kind === "thinking") {
              writeEvent(res, { type: "thinking", content });
            } else if (part?.part_kind === "text" || part?.part_delta_kind === "text") {
              writeEvent(res, { type: "text", content });
              sentAnyText = true;
            }
          }
          continue;
        }

        if (parsed?.part_delta_kind === "thinking" || parsed?.kind === "thinking") {
          const content = cleanContent(parsed?.content ?? parsed?.delta);
          if (content) writeEvent(res, { type: "thinking", content });
          continue;
        }

        if (parsed?.part_delta_kind === "text") {
          const content = cleanContent(parsed?.content ?? parsed?.delta);
          if (content) {
            writeEvent(res, { type: "text", content });
            sentAnyText = true;
          }
          continue;
        }

        const output = collectOutput(parsed);
        if (isStreamEnd(parsed, currentEvent) && output) {
          if (!sentAnyText) {
            await streamTextGradually(res, output);
          } else {
            writeEvent(res, { type: "text", content: output });
          }
          finish();
          return;
        }

        const content = cleanContent(parsed?.content);
        if (content) {
          const type = parsed?.part_kind === "thinking" ? "thinking" : "text";
          writeEvent(res, { type, content });
          if (type === "text") sentAnyText = true;
        }
      }
    }

    finish();
  } catch (error: any) {
    clearTimeout(timeout);
    writeEvent(res, { type: "error", message: error?.message || "Streaming failed" });
    finish();
  }
}
