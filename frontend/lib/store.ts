import { create } from "zustand";
import { ChatMessage } from "@/types";

interface ChatStore {
  messages: ChatMessage[];
  selectedModel: "qwen3.6-flash" | "qwen3.5-plus" | "qwen3-max" | "qwq-plus";
  isLoading: boolean;
  error: string | null;

  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  setSelectedModel: (model: "qwen3.6-flash" | "qwen3.5-plus" | "qwen3-max" | "qwq-plus") => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  selectedModel: "qwen3.5-plus",
  isLoading: false,
  error: null,

  addMessage: (message: ChatMessage) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  clearMessages: () => set({ messages: [] }),

  setSelectedModel: (model) =>
    set({
      selectedModel: model,
    }),

  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
