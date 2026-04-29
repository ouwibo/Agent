import type { Context } from "hono";

type Channel = "managed" | "direct" | "fallback" | "none";

function resolveHealth() {
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
      configured: true,
      ready: true,
    };
  }

  if (directKey) {
    return {
      channel: "direct" as Channel,
      model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
      baseUrl: process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1",
      configured: true,
      ready: true,
    };
  }

  if (fallbackKey) {
    return {
      channel: "fallback" as Channel,
      model: "fallback",
      baseUrl: "https://api.zo.computer/zo/ask",
      configured: true,
      ready: true,
    };
  }

  return {
    channel: "none" as Channel,
    model: "",
    baseUrl: "",
    configured: false,
    ready: false,
  };
}

export default function health(c: Context) {
  return c.json({ ok: true, ...resolveHealth() });
}
