type ZoModel = {
  model_name: string;
  label: string;
  vendor: string;
  description?: string | null;
  type?: string | null;
  context_window?: number | null;
  is_byok?: boolean;
};

const DEFAULT_MODEL = "zo:openai/gpt-5.4-mini";

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
  if (/^glm-/i.test(prettyName)) return prettyName.replace(/^glm-/i, "GLM ").replace(/-/g, " ");
  if (/^kimi/i.test(prettyName)) return prettyName.replace(/^kimi/i, "Kimi ").replace(/-/g, " ");
  return titleCase(prettyName);
}

function isPublicModel(modelName: string) {
  const normalized = modelName.toLowerCase();
  return (
    normalized === DEFAULT_MODEL.toLowerCase() ||
    /\/gpt-5\.4-mini$/i.test(modelName) ||
    /\/glm-5$/i.test(modelName) ||
    /kimi/i.test(modelName)
  );
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
  if (req.method !== "GET") {
    return json(res, 405, { error: "Method not allowed" });
  }

  const apiKey = process.env.ZO_API_KEY;
  if (!apiKey) {
    return json(res, 401, { error: "ZO_API_KEY is not configured on the server" });
  }

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
    const cleanedModels = models.map(toDisplayModel).filter((model) => model.type === "free" && isPublicModel(model.model_name));

    return json(res, 200, {
      ok: true,
      models: cleanedModels,
      recommendedModel:
        cleanedModels.find((m) => m.model_name === DEFAULT_MODEL)?.model_name ||
        cleanedModels.find((m) => /\/glm-5$/i.test(m.model_name))?.model_name ||
        cleanedModels.find((m) => /kimi/i.test(m.model_name))?.model_name ||
        cleanedModels[0]?.model_name ||
        DEFAULT_MODEL,
    });
  } catch (error: any) {
    return json(res, 500, {
      error: error?.message || "Failed to fetch models",
    });
  }
}
