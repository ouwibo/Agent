export const modelCatalog = [
  {
    id: "qwen3.6-flash",
    label: "Qwen 3.6 Flash",
    purpose: "Respons cepat untuk chat ringan.",
  },
  {
    id: "qwen3.5-plus",
    label: "Qwen 3.5 Plus",
    purpose: "Default seimbang untuk pemakaian umum.",
  },
  {
    id: "qwen3-max",
    label: "Qwen 3 Max",
    purpose: "Analisis kompleks, reasoning, dan tugas berat.",
  },
  {
    id: "qwq-plus",
    label: "QWQ Plus",
    purpose: "Mode reasoning eksperimental.",
  },
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
