export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  model?: string;
}

export interface ChatRequest {
  message: string;
  model: "qwen3.6-flash" | "qwen3.5-plus" | "qwen3-max" | "qwq-plus";
}

export interface ChatResponse {
  model: string;
  answer: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface ApiError {
  error: string;
  status: number;
}

export const MODELS = [
  {
    id: "qwen3.6-flash",
    name: "Qwen 3.6 Flash",
    description: "Fast chat responses, perfect for quick interactions",
    badge: "⚡ Fast",
  },
  {
    id: "qwen3.5-plus",
    name: "Qwen 3.5 Plus",
    description: "Balanced default model for most use cases",
    badge: "⚖️ Balanced",
  },
  {
    id: "qwen3-max",
    name: "Qwen 3 Max",
    description: "Advanced reasoning and detailed analysis",
    badge: "🧠 Advanced",
  },
  {
    id: "qwq-plus",
    name: "QwQ Plus",
    description: "Experimental reasoning model for complex tasks",
    badge: "🔬 Experimental",
  },
];
