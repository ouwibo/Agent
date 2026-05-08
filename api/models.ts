export const config = { runtime: 'edge' };

const AVAILABLE_MODELS = [
  { model_name: "gemma3:4b", label: "Gemma 3 4B", vendor: "Google", type: "free", context_window: 128000, is_byok: false, description: "Fast and efficient" },
  { model_name: "gemma3:12b", label: "Gemma 3 12B", vendor: "Google", type: "free", context_window: 128000, is_byok: false, description: "Balanced performance" },
  { model_name: "gemma3:27b", label: "Gemma 3 27B", vendor: "Google", type: "free", context_window: 128000, is_byok: false, description: "High quality responses" },
  { model_name: "gemma4:31b", label: "Gemma 4 31B", vendor: "Google", type: "free", context_window: 128000, is_byok: false, description: "Latest Gemma, excellent reasoning" },
  { model_name: "gpt-oss:20b", label: "GPT-OSS 20B", vendor: "Open Source", type: "free", context_window: 128000, is_byok: false, description: "General purpose" },
  { model_name: "qwen3-coder-next", label: "Qwen3 Coder", vendor: "Alibaba", type: "free", context_window: 128000, is_byok: false, description: "Best for code" },
];

export default async function handler(req: Request) {
  return new Response(JSON.stringify({
    ok: true,
    models: AVAILABLE_MODELS,
    recommendedModel: "gemma3:4b",
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
