export const config = { runtime: 'edge' };

const AI_API_URL = "https://ollama.com/api";
const AI_API_KEY = process.env.AI_API_KEY || "";

const AVAILABLE_MODELS = [
  { model_name: "gpt-oss:20b", label: "GPT-OSS 20B", vendor: "Open Source", type: "free", context_window: 128000, is_byok: false, description: "General purpose, fast and capable" },
  { model_name: "gemma4:31b", label: "Gemma 4 31B", vendor: "Google", type: "free", context_window: 128000, is_byok: false, description: "Latest Gemma, excellent reasoning" },
  { model_name: "gemma3:27b", label: "Gemma 3 27B", vendor: "Google", type: "free", context_window: 128000, is_byok: false, description: "Balanced performance" },
  { model_name: "gemma3:12b", label: "Gemma 3 12B", vendor: "Google", type: "free", context_window: 128000, is_byok: false, description: "Lightweight, fast responses" },
  { model_name: "gemma3:4b", label: "Gemma 3 4B", vendor: "Google", type: "free", context_window: 128000, is_byok: false, description: "Ultra lightweight" },
  { model_name: "qwen3-coder-next", label: "Qwen3 Coder", vendor: "Alibaba", type: "free", context_window: 128000, is_byok: false, description: "Specialized for code tasks" },
  { model_name: "nemotron-3-nano:30b", label: "Nemotron 3 Nano", vendor: "NVIDIA", type: "free", context_window: 128000, is_byok: false, description: "Efficient and accurate" },
  { model_name: "devstral-small-2:24b", label: "Devstral 2", vendor: "Mistral", type: "free", context_window: 128000, is_byok: false, description: "Code-focused model" },
];

async function getCloudModels(): Promise<{ name: string }[]> {
  if (!AI_API_KEY) return [];
  
  try {
    const res = await fetch(`${AI_API_URL}/tags`, {
      headers: { 'Authorization': `Bearer ${AI_API_KEY}` }
    });
    if (!res.ok) return [];
    const data = await res.json() as { models?: { name: string }[] };
    return data.models || [];
  } catch {
    return [];
  }
}

export default async function handler(req: Request) {
  const cloudModels = await getCloudModels();
  const cloudModelNames = cloudModels.map(m => m.name);
  
  // Filter to only show models available in cloud
  const models = AVAILABLE_MODELS.filter(m => 
    cloudModelNames.includes(m.model_name) || cloudModelNames.length === 0
  );
  
  return new Response(JSON.stringify({
    ok: true,
    models,
    recommendedModel: models[0]?.model_name || "gpt-oss:20b",
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
