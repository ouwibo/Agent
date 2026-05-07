type ZoStreamEvent = {
  type: "text" | "done" | "error";
  content?: string;
  message?: string;
};

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

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ZO_API_KEY;
  if (!apiKey) {
    return res.status(401).json({ error: "ZO_API_KEY is not configured on the server" });
  }

  const body = extractBody(req);
  const input = extractInput(body);
  if (!input) {
    return res.status(400).json({ error: "Message is required" });
  }

  const modelName =
    typeof body?.model_name === "string" && body.model_name.trim()
      ? body.model_name.trim()
      : typeof body?.model === "string" && body.model.trim()
        ? body.model.trim()
        : "zo:openai/gpt-5.4-mini";

  const conversationId =
    typeof body?.conversation_id === "string" && body.conversation_id.trim()
      ? body.conversation_id.trim()
      : typeof body?.conversationId === "string" && body.conversationId.trim()
        ? body.conversationId.trim()
        : undefined;

  const upstream = await fetch("https://api.zo.computer/zo/ask", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      input,
      conversation_id: conversationId,
      model_name: modelName,
      stream: true,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const errorBody = await upstream.text().catch(() => "");
    return res.status(upstream.status).json({
      error: errorBody || `Zo request failed (${upstream.status})`,
    });
  }

  const conversationHeader = upstream.headers.get("x-conversation-id");
  if (conversationHeader) {
    res.setHeader("x-conversation-id", conversationHeader);
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

  const finish = () => {
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

        if (!line.startsWith("data: ")) {
          continue;
        }

        const raw = line.slice(6).trim();
        if (!raw) {
          continue;
        }

        let parsed: any = null;
        try {
          parsed = JSON.parse(raw);
        } catch {
          continue;
        }

        if (currentEvent === "Error") {
          writeEvent(res, {
            type: "error",
            message: parsed?.message || "Zo returned an error",
          });
          finish();
          return;
        }

        if (currentEvent === "End") {
          finish();
          return;
        }

        const content = typeof parsed?.content === "string" ? parsed.content : "";
        if (content) {
          writeEvent(res, { type: "text", content });
        }
      }
    }

    finish();
  } catch (error: any) {
    writeEvent(res, { type: "error", message: error?.message || "Streaming failed" });
    finish();
  }
}
