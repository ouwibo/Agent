import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  Globe,
  Loader2,
  Send,
  Settings,
  Trash2,
  X,
  Copy,
  Check,
  Bitcoin,
  TrendingUp,
  BarChart3,
  Newspaper,
  Zap,
} from "lucide-react";
import { MatrixBackground } from "@/components/matrix-background";
import { marked } from "marked";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import rust from "highlight.js/lib/languages/rust";
import go from "highlight.js/lib/languages/go";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import sql from "highlight.js/lib/languages/sql";

// Register languages
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("rust", rust);
hljs.registerLanguage("go", go);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("json", json);
hljs.registerLanguage("sql", sql);

// Import highlight.js styles
import "highlight.js/styles/github-dark.css";

const UI = {
  page: "bg-[#050608]",
  panel: "bg-zinc-950/94",
  border: "border-white/10",
  borderStrong: "border-white/15",
  accent: "text-primary",
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface HealthData {
  ok: boolean;
  serverKeys?: { ai?: boolean };
  defaultModel?: string;
}

interface AIModel {
  model_name: string;
  label: string;
  vendor: string;
  description?: string | null;
  type?: string | null;
  context_window?: number | null;
}

interface ModelsResponse {
  ok: boolean;
  models: AIModel[];
  recommendedModel?: string;
}

const BACKEND = "/api";
const MODEL_STORAGE_KEY = "ouwibo_crypto_model";
const CONVERSATION_STORAGE_KEY = "ouwibo_crypto_conversation";

const FALLBACK_MODELS: AIModel[] = [
  { model_name: "gemma3:4b", label: "Gemma 3 4B", vendor: "Google", type: "free", context_window: 128000, description: "Fast and efficient" },
  { model_name: "gemma3:12b", label: "Gemma 3 12B", vendor: "Google", type: "free", context_window: 128000, description: "Balanced performance" },
  { model_name: "gemma3:27b", label: "Gemma 3 27B", vendor: "Google", type: "free", context_window: 128000, description: "High quality responses" },
  { model_name: "gemma4:31b", label: "Gemma 4 31B", vendor: "Google", type: "free", context_window: 128000, description: "Latest model, best reasoning" },
  { model_name: "gpt-oss:20b", label: "GPT-OSS 20B", vendor: "Open Source", type: "free", context_window: 128000, description: "General purpose" },
  { model_name: "qwen3-coder-next", label: "Qwen3 Coder", vendor: "Alibaba", type: "free", context_window: 128000, description: "Code specialist" },
];

const CRYPTO_PROMPTS = [
  "Analyze BTC current trend",
  "What's the ETH price outlook?",
  "Compare SOL vs BNB performance",
  "Market sentiment analysis today",
  "Top crypto gainers this week",
  "DeFi protocol analysis",
];

function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlighted = language ? hljs.highlight(code, { language }).value : hljs.highlightAuto(code).value;

  return (
    <div className="relative group my-3 rounded-lg overflow-hidden bg-zinc-900 border border-white/10">
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-800/50 border-b border-white/10">
        <span className="text-xs text-white/50 font-mono">{language || "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-white/50 hover:text-white transition-colors"
        >
          {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-sm">
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </div>
  );
}

function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
          className="w-2 h-2 rounded-full bg-primary"
        />
      ))}
    </div>
  );
}

function StreamingMessage({ text }: { text: string }) {
  const rendered = useMemo(() => {
    // Parse markdown and render
    let html = marked(text) as string;
    return html;
  }, [text]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[85%] md:max-w-[75%]"
    >
      <div className="rounded-2xl rounded-bl-sm border border-white/15 bg-white/[0.06] px-4 py-3 text-sm leading-relaxed text-white/95 backdrop-blur-sm">
        <div 
          className="prose prose-invert prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: rendered }}
        />
        <motion.span
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="inline-block w-1.5 h-4 bg-primary ml-0.5 rounded-sm"
        />
      </div>
    </motion.div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  
  const rendered = useMemo(() => {
    if (isUser) return message.content;
    return marked(message.content) as string;
  }, [message.content, isUser]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
          <Bitcoin className="w-4 h-4 text-primary" />
        </div>
      )}
      <div className={`max-w-[85%] md:max-w-[75%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed backdrop-blur-sm ${
            isUser
              ? "rounded-br-sm bg-primary text-black font-medium"
              : "rounded-bl-sm border border-white/15 bg-white/[0.06] text-white/95"
          }`}
        >
          {isUser ? (
            <span className="whitespace-pre-wrap">{message.content}</span>
          ) : (
            <div 
              className="prose prose-invert prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: rendered }}
            />
          )}
        </div>
        <span className="px-1 text-[10px] text-white/30 font-mono">
          {new Date(message.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-xs font-semibold text-white/60">U</span>
        </div>
      )}
    </motion.div>
  );
}

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [models, setModels] = useState<AIModel[]>(FALLBACK_MODELS);
  const [model, setModel] = useState(() => localStorage.getItem(MODEL_STORAGE_KEY) || "gemma3:4b");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  useEffect(() => {
    fetch(`${BACKEND}/health`)
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch(() => setHealth({ ok: false, serverKeys: { ai: false } }));

    fetch(`${BACKEND}/models`)
      .then(async (res) => {
        const data = await res.json().catch(() => null) as ModelsResponse | null;
        if (!res.ok || !data?.models?.length) throw new Error("No models");
        setModels(data.models);
        const nextModel = data.recommendedModel || data.models[0]?.model_name;
        setModel((prev) => (data.models.some((m) => m.model_name === prev) ? prev : nextModel || "gemma3:4b"));
      })
      .catch(() => setModels(FALLBACK_MODELS));
  }, []);

  useEffect(() => {
    localStorage.setItem(MODEL_STORAGE_KEY, model);
  }, [model]);

  const serverHasAiKey = !!health?.serverKeys?.ai;
  const canSend = serverHasAiKey && !!model && !loading;
  const selectedModel = useMemo(() => models.find((m) => m.model_name === model) || models[0], [model, models]);

  const sendMessage = useCallback(async (text?: string) => {
    const prompt = (text || input).trim();
    if (!prompt || loading || !canSend) return;

    const userMessage: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: prompt,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setStreamingText("");

    try {
      const response = await fetch(`${BACKEND}/agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ input: prompt, model_name: model }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(err.error || "Server error");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "";
      let finalText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;

          try {
            const evt = JSON.parse(raw);
            if (evt?.type === "text" && evt.content) {
              finalText += evt.content;
              setStreamingText(finalText);
            }
            if (evt?.type === "error") throw new Error(evt.message);
            if (evt?.type === "done") break;
          } catch (e) {
            if (e instanceof SyntaxError) continue;
            throw e;
          }
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: finalText.trim() || "(No response)",
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      setMessages((prev) => [
        ...prev,
        { id: `e-${Date.now()}`, role: "assistant", content: `⚠️ ${msg}`, createdAt: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
      setStreamingText("");
    }
  }, [canSend, input, loading, model]);

  const handleKey = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const modelLabel = selectedModel?.label || model;

  return (
    <div className={`relative flex h-screen overflow-hidden ${UI.page} text-white selection:bg-primary/20`}>
      <MatrixBackground />

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={(e) => e.target === e.currentTarget && setShowSettings(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg rounded-2xl border border-white/15 bg-zinc-950 p-5 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Model Selection</h2>
                <button onClick={() => setShowSettings(false)} className="text-white/50 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid gap-2 max-h-[50vh] overflow-y-auto">
                {models.map((item) => {
                  const active = item.model_name === model;
                  return (
                    <button
                      key={item.model_name}
                      onClick={() => { setModel(item.model_name); setShowSettings(false); }}
                      className={`p-3 rounded-xl text-left transition-all ${
                        active
                          ? "bg-primary/15 border-primary/50"
                          : "bg-white/5 hover:bg-white/10 border-white/10"
                      } border`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{item.label}</span>
                        {active && <CheckCircle2 className="w-4 h-4 text-primary" />}
                      </div>
                      <div className="text-xs text-white/50">{item.vendor} · {item.description}</div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setShowSettings(false)}
                className="mt-4 w-full py-2.5 bg-primary text-black rounded-xl font-medium hover:opacity-90"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="p-4 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-bold">OUWIBO<span className="text-primary">_</span></span>
          </Link>
        </div>

        <div className="p-4 space-y-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${health?.ok ? "bg-primary" : "bg-red-500"}`} />
            <span className="text-white/60">{health?.ok ? "Server Online" : "Server Offline"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${serverHasAiKey ? "bg-primary" : "bg-yellow-500"}`} />
            <span className="text-white/60">{serverHasAiKey ? "AI Active" : "AI Offline"}</span>
          </div>
        </div>

        <div className="p-4 space-y-2">
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-colors"
          >
            <Settings className="w-4 h-4" />
            Model: {modelLabel}
          </button>
          <button
            onClick={() => setMessages([])}
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Crypto Prompts</div>
          <div className="space-y-1.5">
            {CRYPTO_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                disabled={!canSend}
                className="w-full px-3 py-2 rounded-lg bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/30 text-left text-xs text-white/60 hover:text-white transition-all disabled:opacity-30"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="flex h-14 items-center gap-3 border-b border-white/10 bg-black/50 px-4 backdrop-blur-xl">
          <Link href="/dashboard" className="md:hidden text-white/60 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${loading ? "bg-yellow-400" : "bg-primary"} animate-pulse`} />
            <span className="text-sm font-medium">
              {loading ? "Analyzing..." : "OUWIBO Crypto Agent"}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setShowSettings(true)} className="md:hidden text-white/60 hover:text-white">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 md:px-6">
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.length === 0 && !streamingText && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center min-h-[50vh] text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <Bitcoin className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold mb-2">OUWIBO Crypto Agent</h1>
                <p className="text-white/50 max-w-md mb-6">
                  AI-powered cryptocurrency analysis. Ask about market trends, price analysis, trading signals, and more.
                </p>
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium">
                    {modelLabel}
                  </span>
                  {serverHasAiKey ? (
                    <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-medium">
                      AI Active
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-xs font-medium">
                      AI Offline
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                  {CRYPTO_PROMPTS.slice(0, 4).map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      disabled={!canSend}
                      className="px-3 py-2.5 rounded-lg bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/30 text-left text-xs text-white/60 hover:text-white transition-all disabled:opacity-30"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)}
            </AnimatePresence>

            {streamingText && <StreamingMessage text={streamingText} />}
            {loading && !streamingText && (
              <div className="flex items-center gap-2 text-white/60">
                <LoadingDots />
                <span className="text-sm">Processing...</span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-white/10 bg-black/50 p-4 backdrop-blur-xl">
          <div className="mx-auto max-w-3xl flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={!canSend || loading}
              placeholder={serverHasAiKey ? "Ask about crypto markets..." : "AI offline..."}
              rows={1}
              className="flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 disabled:opacity-40"
              style={{ maxHeight: 120, overflowY: "auto" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = Math.min(target.scrollHeight, 120) + "px";
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || !canSend || loading}
              className="w-12 h-12 shrink-0 rounded-xl bg-primary text-black flex items-center justify-center hover:opacity-90 disabled:opacity-30 transition-opacity"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] text-white/30">
            Enter to send · Shift+Enter for new line · Model: {modelLabel}
          </p>
        </div>
      </main>
    </div>
  );
}
