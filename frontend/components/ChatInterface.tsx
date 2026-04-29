"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader } from "lucide-react";
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

    // Add user message
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setTimeout(() => {}, 2000);
  };

  return (
    <div className="flex h-screen flex-col bg-gradient-to-b from-dark-900 to-dark-800">
      {/* Header */}
      <div className="border-b border-gray-800 bg-dark-900/50 backdrop-blur px-4 py-4">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-2 text-2xl font-bold text-white">Ouwibo AI Agent</h1>
          <p className="text-sm text-gray-400">Choose your model and start chatting</p>
        </div>
      </div>

      {/* Model Selector */}
      <div className="border-b border-gray-800 bg-dark-900/50 px-4 py-3">
        <div className="mx-auto max-w-4xl">
          <ModelSelector />
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-4xl space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 h-16 w-16 rounded-full bg-gradient-premium" />
              <h2 className="mb-2 text-2xl font-bold text-white">Ready to chat?</h2>
              <p className="max-w-md text-gray-400">
                Start a conversation with Ouwibo Agent powered by advanced AI models.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} onCopy={copyToClipboard} />
          ))}

          {isLoading && (
            <div className="flex justify-center">
              <div className="flex items-center gap-2 rounded-lg bg-dark-800 px-4 py-3">
                <Loader className="h-5 w-5 animate-spin text-blue-500" />
                <span className="text-gray-300">Thinking...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-400">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-800 bg-dark-900/50 backdrop-blur px-4 py-4">
        <form onSubmit={handleSendMessage} className="mx-auto max-w-4xl">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here..."
              disabled={isLoading}
              className="flex-1 rounded-lg bg-dark-800 px-4 py-3 text-white placeholder-gray-500 border border-gray-700 focus:border-blue-500 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded-lg bg-gradient-premium px-6 py-3 text-white hover:shadow-lg hover:shadow-blue-500/50 transition disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
