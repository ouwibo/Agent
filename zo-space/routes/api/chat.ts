import type { Context } from "hono";

type ChatMessage = { role?: unknown; content?: unknown };
type Channel = "managed" | "direct" | "fallback" | "none";

type NormalizedMessage = { role: "user" | "assistant"; content: string };

function normalizeMessages(value: unknown): NormalizedMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const role = (item as { role?: unknown }).role === "assistant" ? "assistant" : "user";
      const content = (item as { content?: unknown }).content;
      if (typeof content !== "string" || !content.trim()) return null;
      return { role, content: content.trim() };
    })
    .filter((item): item is NormalizedMessage => item !== null);
}

function resolveBackend() {
  const managedKey = process.env.DASHSCOPE_API_KEY?.trim();
  const directKey = process.env.OPENAI_API_KEY?.trim() || process.env.AI_API_KEY?.trim();
  const fallbackKey = process.env.ZO_CLIENT_IDENTITY_TOKEN?.trim();

  if (managedKey) {
    return {
      channel: "managed" as Channel,
      model: process.env.DASHSCOPE_MODEL?.trim() || "qwen3.5-plus",
      baseUrl:
        process.env.DASHSCOPE_BASE_URL?.trim() ||
        "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
      apiKey: managedKey,
    };
  }

  if (directKey) {
    return {
      channel: "direct" as Channel,
      model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
      baseUrl: process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1",
      apiKey: directKey,
    };
  }

  if (fallbackKey) {
    return {
      channel: "fallback" as Channel,
      model: "fallback",
      baseUrl: "https://api.zo.computer/zo/ask",
      apiKey: fallbackKey,
    };
  }

  return { channel: "none" as Channel };
}

async function callChat(input: string, conversationId?: string | null) {
  const backend = resolveBackend();
  if (backend.channel === "none") {
    return {
      reply: "Add an API key in Settings > Advanced to enable live chat.",
      channel: backend.channel,
      conversationId: conversationId ?? null,
      configured: false,
    };
  }

  if (backend.channel === "fallback") {
    const response = await fetch(backend.baseUrl, {
      method: "POST",
      headers: {
        authorization: backend.apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        input,
        conversation_id: conversationId ?? undefined,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = (await response.json()) as { output?: unknown; conversation_id?: string };
    return {
      reply: typeof data.output === "string" ? data.output : "No response",
      channel: backend.channel,
      conversationId: data.conversation_id ?? conversationId ?? null,
      configured: true,
    };
  }

  const response = await fetch(`${backend.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${backend.apiKey}`,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      model: backend.model,
      messages: [
        {
          role: "system",
          content:
            "You are Ouwibo AI. Keep replies concise, professional, and in the user's language.",
        },
        { role: "user", content: input },
      ],
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };

  return {
    reply: data.choices?.[0]?.message?.content?.trim() || "No response",
    channel: backend.channel,
    conversationId: conversationId ?? null,
    configured: true,
  };
}

export default async function chat(c: Context) {
  const body = (await c.req.json().catch(() => null)) as
    | {
        message?: unknown;
        conversationId?: unknown;
        mode?: unknown;
        messages?: unknown;
      }
    | null;

  if (!body || typeof body.message !== "string") {
    return c.json({ error: "Invalid request" }, 400);
  }

  const message = body.message.trim();
  if (!message) {
    return c.json({ error: "Message cannot be empty" }, 400);
  }

  const conversationId = typeof body.conversationId === "string" ? body.conversationId : null;
  const messageCount = normalizeMessages(body.messages).length;

  try {
    const result = await callChat(message, conversationId);
    return c.json({
      reply: result.reply,
      follow_up: "",
      conversationId: result.conversationId,
      tools_used: [],
      suggested_actions: [],
      crypto_brief: "",
      configured: result.configured,
      channel: result.channel,
      messageCount,
    });
  } catch {
    return c.json({
      reply: "The API is configured, but the request failed. Check your key and model settings.",
      follow_up: "",
      conversationId,
      tools_used: [],
      suggested_actions: [],
      crypto_brief: "",
      configured: true,
      channel: resolveBackend().channel,
      messageCount,
    });
  }
}
