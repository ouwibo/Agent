type ZoModel = {
  model_name: string;
  label: string;
  vendor: string;
  description?: string | null;
  type?: string | null;
  context_window?: number | null;
  is_byok?: boolean;
};

const PUBLIC_MODEL_PATTERNS = [/\/gpt-5\.4-mini$/i, /\/glm-5$/i, /kimi/i];

function cleanLabel(label: string) {
  return label.replace(/^Zo[\s·:-]+/i, "").trim();
}

function titleCase(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function fallbackLabel(modelName: string) {
  const withoutPrefix = modelName.replace(/^zo:/i, "");
  const [vendor, rawName = ""] = withoutPrefix.split("/");
  const prettyName = rawName || vendor;

  if (/^gpt-/i.test(prettyName)) return prettyName.replace(/^gpt-/i, "GPT-").replace(/-/g, " ");
  if (/^claude-/i.test(prettyName)) return prettyName.replace(/^claude-/i, "Claude ").replace(/-/g, " ");
  if (/^gemini-/i.test(prettyName)) return prettyName.replace(/^gemini-/i, "Gemini ").replace(/-/g, " ");
  if (/^glm-/i.test(prettyName)) return prettyName.replace(/^glm-/i, "GLM ").replace(/-/g, " ");
  if (/^minimax-/i.test(prettyName)) return prettyName.replace(/^minimax-/i, "MiniMax ").replace(/-/g, " ");
  return titleCase(prettyName);
}

function toDisplayModel(model: ZoModel) {
  return {
    ...model,
    label: cleanLabel(model.label || fallbackLabel(model.model_name)),
  };
}

function json(res: any, status: number, body: unknown) {
  res.status(status).json(body);
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  const apiKey = process.env.ZO_API_KEY;
  if (!apiKey) return json(res, 401, { error: "ZO_API_KEY is not configured on the server" });

  try {
    const upstream = await fetch("https://api.zo.computer/models/available", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    });

    const data = await upstream.json().catch(() => null);
    if (!upstream.ok) {
      return json(res, upstream.status, {
        error: data?.error || data?.message || `Failed to fetch models (${upstream.status})`,
      });
    }

    const models = Array.isArray(data?.models) ? (data.models as ZoModel[]) : [];
    const publicModels = models.filter((model) => PUBLIC_MODEL_PATTERNS.some((pattern) => pattern.test(model.model_name)));
    const cleanedModels = publicModels.map(toDisplayModel);

    return json(res, 200, {
      ok: true,
      models: cleanedModels,
      recommendedModel:
        publicModels.find((m) => m.model_name === "zo:openai/gpt-5.4-mini")?.model_name ||
        publicModels.find((m) => m.model_name === "zo:zai/glm-5")?.model_name ||
        publicModels[0]?.model_name ||
        "zo:openai/gpt-5.4-mini",
    });
  } catch (error: any) {
    return json(res, 500, {
      error: error?.message || "Failed to fetch models",
    });
  }
}
