"use client";

import { Bot } from "lucide-react";
import { ChatMessage } from "@/types";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-white"
            : "bg-white/5 border border-white/10 text-gray-100"
        }`}
      >
        <div className="flex items-start gap-2">
          {!isUser && (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
              <Bot className="h-3 w-3" />
            </div>
          )}
          <div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
            {message.model && (
              <p className="mt-2 text-xs text-gray-500">Model: {message.model}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
