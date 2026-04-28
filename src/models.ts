export const modelCatalog = [
  {
    id: "qwen3.6-flash",
    label: "Qwen 3.6 Flash",
    purpose: "Fast responses for lightweight chat."
  },
  {
    id: "qwen3.5-plus",
    label: "Qwen 3.5 Plus",
    purpose: "Balanced default for general use."
  },
  {
    id: "qwen3-max",
    label: "Qwen 3 Max",
    purpose: "Complex analysis, reasoning, and heavy tasks."
  }
] as const;

export type ModelId = (typeof modelCatalog)[number]["id"];

export const defaultModel: ModelId = "qwen3.5-plus";

export function isModelId(value: string): value is ModelId {
  return modelCatalog.some((model) => model.id === value);
}

export function resolveModel(value: unknown): ModelId {
  if (typeof value === "string" && isModelId(value)) return value;
  return defaultModel;
}

export function getModelRotation(seed?: number): ModelId {
  if (typeof seed === "number" && Number.isFinite(seed)) {
    return modelCatalog[Math.abs(Math.floor(seed)) % modelCatalog.length].id;
  }

  return modelCatalog[Math.floor(Date.now() / 60_000) % modelCatalog.length].id;
}
