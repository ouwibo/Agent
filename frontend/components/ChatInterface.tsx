"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles, Bot, Zap, Shield } from "lucide-react";
import { useChatStore } from "@/lib/store";
import { agentAPI } from "@/lib/api";
import { MessageBubble } from "./MessageBubble";
import { ModelSelector } from "./ModelSelector";

export function ChatInterface() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, selectedModel, isLoading, error, addMessage, setIsLoading, setError } =
    useChatStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");

    addMessage({
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    });

    setIsLoading(true);
    setError(null);

    try {
      const response = await agentAPI.chat({
        message: userMessage,
        model: selectedModel,
      });

      addMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.answer,
        timestamp: new Date(),
        model: response.model,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const starterPrompts = [
    "What is the current ETH price?",
    "Write a short product description",
    "Help me plan a landing page",
  ];

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      {/* Background Effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-[-10rem] h-[28rem] bg-[radial-gradient(circle_at_top,_rgba(240,165,0,0.15),_transparent_42%)]" />
        <div className="absolute right-[-8rem] top-[12rem] h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(circle,_rgba(59,130,246,0.1),_transparent_66%)] blur-3xl" />
        <div className="absolute left-[-8rem] bottom-[8rem] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,_rgba(34,197,94,0.08),_transparent_66%)] blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-black font-bold text-lg">
                O
              </div>
              <div>
                <h1 className="text-lg font-semibold">Ouwibo Agent</h1>
                <p className="text-xs text-gray-500">Professional AI Studio</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <ModelSelector />
              <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <main className="relative mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Messages */}
          <div className="flex flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto rounded-3xl border border-white/5 bg-black/20 p-6 min-h-[500px] max-h-[600px]">
              {messages.length === 0 && !isLoading && (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500">
                    <Sparkles className="h-8 w-8 text-black" />
                  </div>
                  <h2 className="mb-2 text-2xl font-bold">Ready to chat?</h2>
                  <p className="max-w-md text-gray-500">
                    Start a conversation with Ouwibo Agent powered by advanced AI models.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {starterPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => setInput(prompt)}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-400 transition hover:bg-white/10 hover:text-white"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                    <span className="text-sm text-gray-400">Thinking...</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="mt-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask for strategy, insights, or guidance..."
                  disabled={isLoading}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-white placeholder-gray-500 outline-none transition focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 font-semibold text-black transition hover:shadow-lg hover:shadow-amber-500/30 disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6">
              <div className="mb-4 flex items-center gap-2 text-gray-500">
                <Zap className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wider">Features</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Fast & Focused</h3>
              <p className="text-sm text-gray-500">
                Short turns, clear structure, and a conversation flow that stays easy to scan.
              </p>
            </div>

            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6">
              <div className="mb-4 flex items-center gap-2 text-gray-500">
                <Shield className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wider">Security</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Enterprise Ready</h3>
              <p className="text-sm text-gray-500">
                Built with security best practices and edge deployment on Cloudflare.
              </p>
            </div>

            <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6">
              <div className="mb-4 flex items-center gap-2 text-gray-500">
                <Bot className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wider">AI Status</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Connected</h3>
              <p className="text-sm text-gray-500">
                Powered by Qwen models with real-time responses.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
