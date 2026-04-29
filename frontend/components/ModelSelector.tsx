"use client";

import { useChatStore } from "@/lib/store";
import { MODELS } from "@/types";

export function ModelSelector() {
  const { selectedModel, setSelectedModel } = useChatStore();

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {MODELS.map((model) => (
        <button
          key={model.id}
          onClick={() => setSelectedModel(model.id as any)}
          className={`flex-shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition whitespace-nowrap ${
            selectedModel === model.id
              ? "bg-gradient-premium text-white shadow-lg shadow-blue-500/50"
              : "bg-dark-800 text-gray-300 border border-gray-700 hover:border-blue-500"
          }`}
          title={model.description}
        >
          <span>{model.badge}</span> {model.name}
        </button>
      ))}
    </div>
  );
}
