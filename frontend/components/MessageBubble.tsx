"use client";

import { ChatMessage } from "@/types";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface MessageBubbleProps {
  message: ChatMessage;
  onCopy: (text: string) => void;
}

export function MessageBubble({ message, onCopy }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`group max-w-2xl rounded-lg px-4 py-3 ${
          isUser
            ? "bg-gradient-premium text-white"
            : "bg-dark-800 border border-gray-700 text-gray-100"
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>

        {!isUser && (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {message.model || "Qwen 3.5 Plus"}
            </span>
            <button
              onClick={handleCopy}
              className="opacity-0 transition group-hover:opacity-100"
              title="Copy message"
            >
              {copied ? (
                <Check size={16} className="text-green-400" />
              ) : (
                <Copy size={16} className="text-gray-400 hover:text-gray-300" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
