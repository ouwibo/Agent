import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Send, Plus, Trash2, ChevronRight, Bot, User, Menu, X, ArrowLeft, Settings } from "lucide-react";
import { MatrixBackground } from "@/components/matrix-background";

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

const ZO_API = "https://api.zo.computer/zo/ask";
const MODEL = "vercel:minimax/minimax-m2.7";

function getZoHeaders() {
  const token = import.meta.env.VITE_ZO_API_KEY || import.meta.env.VITE_ZO_TOKEN || "";
  return {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Test connection on mount
  useEffect(() => {
    testConnection();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  async function testConnection() {
    try {
      const res = await fetch(ZO_API, {
        method: "POST",
        headers: getZoHeaders(),
        body: JSON.stringify({ input: "OK", model_name: MODEL }),
      });
      const data = await res.json();
      setIsConnected(res.ok && !!data.output);
      if (data.conversation_id) setConversationId(data.conversation_id);
    } catch {
      setIsConnected(false);
    }
  }

  async function sendMessage() {
    if (!input.trim() || streaming) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    const userInput = input;
    setInput("");
    setStreaming(true);
    setStreamingContent("");

    try {
      const payload: Record<string, string> = {
        input: userInput,
        model_name: MODEL,
      };
      if (conversationId) payload["conversation_id"] = conversationId;

      const res = await fetch(ZO_API, {
        method: "POST",
        headers: getZoHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);

      const data = await res.json();
      if (data.conversation_id && !conversationId) {
        setConversationId(data.conversation_id);
      }

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: (data.output || "").trim(),
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "[ERROR] Connection to OUWIBO failed. Check your API token.",
        createdAt: new Date().toISOString(),
      }]);
    } finally {
      setStreaming(false);
      setStreamingContent("");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function clearChat() {
    setMessages([]);
    setConversationId(null);
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden relative">
      <MatrixBackground />
      <div className="scanline" />

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`
          fixed md:relative inset-y-0 left-0 z-30
          w-72 flex flex-col border-r border-primary/20 bg-black/95 backdrop-blur-xl
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="p-5 border-b border-primary/20 flex items-center justify-between">
          <Link href="/dashboard" className="group flex items-center gap-2 text-primary/60 hover:text-primary transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-bold text-lg text-white tracking-widest">OUWIBO<span className="text-primary animate-pulse">_</span></span>
          </Link>
          <button className="md:hidden text-primary/60 hover:text-primary" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status */}
        <div className="p-4 border-b border-primary/10">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-primary animate-pulse" : "bg-red-500"}`} />
            <span className="text-xs font-mono text-primary/60">
              {isConnected ? "ZO API CONNECTED" : "NOT CONNECTED"}
            </span>
          </div>
          {conversationId && (
            <div className="mt-2 text-[10px] font-mono text-white/30 truncate">
              Session: {conversationId.slice(0, 20)}...
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-3 space-y-2">
          <button
            onClick={clearChat}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all duration-200 font-medium text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Clear Chat
          </button>
        </div>

        {/* Quick prompts */}
        <div className="flex-1 overflow-y-auto p-3">
          <p className="text-xs text-primary/40 px-3 py-1 tracking-widest font-mono mb-2">QUICK PROMPTS</p>
          <div className="space-y-2">
            {[
              { label: "What can you do?", prompt: "What can you help me with?" },
              { label: "Crypto analysis", prompt: "Analyze the current Ethereum market trends" },
              { label: "Code help", prompt: "Help me write a smart contract in Solidity" },
              { label: "Plan project", prompt: "Help me plan a new project" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => { setInput(item.prompt); textareaRef.current?.focus(); }}
                className="w-full text-left px-3 py-2.5 rounded-xl border border-primary/20 bg-primary/5 text-xs text-white/60 hover:text-white hover:bg-primary/10 hover:border-primary/40 transition-all duration-200 font-mono"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </motion.aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 md:px-6 h-16 border-b border-primary/20 bg-black/70 backdrop-blur-md shrink-0">
          <button
            className="md:hidden text-primary/60 hover:text-primary transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-primary animate-pulse" : "bg-red-500"}`} />
            <span className="font-mono text-sm text-primary/80 tracking-wide">OUWIBO // ZO AI</span>
          </div>
          <Link href="/dashboard" className="ml-auto text-xs text-primary/40 hover:text-primary transition-colors font-mono hidden md:block">
            ← DASHBOARD
          </Link>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.length === 0 && !streaming && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center gap-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-1">OUWIBO AI Agent</h2>
                <p className="text-sm text-white/40 font-mono">Connected to Zo AI · Ask anything</p>
              </div>
              {!isConnected && (
                <div className="px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-mono max-w-md">
                  ⚠️ Not connected. Set VITE_ZO_API_KEY in your environment.
                </div>
              )}
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed font-sans ${
                    msg.role === "user"
                      ? "bg-primary text-black font-medium rounded-br-sm"
                      : "bg-white/5 border border-white/10 text-white/90 rounded-bl-sm"
                  }`}
                >
                  <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-white/60" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {streaming && streamingContent && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 justify-start"
            >
              <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-2xl rounded-bl-sm text-sm leading-relaxed bg-white/5 border border-white/10 text-white/90">
                <pre className="whitespace-pre-wrap font-sans">{streamingContent}</pre>
                <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1 align-bottom" />
              </div>
            </motion.div>
          )}

          {streaming && !streamingContent && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white/5 border border-white/10 flex gap-1 items-center">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-3 md:p-4 border-t border-primary/20 bg-black/70 backdrop-blur-md shrink-0">
          <div className="flex gap-2 items-end max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={streaming}
                placeholder="Ask OUWIBO anything..."
                rows={1}
                className="w-full resize-none bg-white/5 border border-primary/20 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/60 transition-colors font-mono disabled:opacity-50"
                style={{ maxHeight: "120px", overflowY: "auto" }}
                onInput={(e) => {
                  const t = e.target as HTMLTextAreaElement;
                  t.style.height = "auto";
                  t.style.height = Math.min(t.scrollHeight, 120) + "px";
                }}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || streaming}
              className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center text-black disabled:opacity-40 hover:scale-105 active:scale-95 transition-all duration-200 shadow-[0_0_16px_rgba(0,255,65,0.3)] hover:shadow-[0_0_24px_rgba(0,255,65,0.5)] shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-center text-xs text-white/20 mt-2 font-mono">ENTER to send · SHIFT+ENTER for new line</p>
        </div>
      </div>
    </div>
  );
}