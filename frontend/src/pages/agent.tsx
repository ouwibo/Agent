import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  Globe,
  LayoutDashboard,
  Loader2,
  Send,
  Settings,
  Trash2,
  X,
  Copy,
  Check,
  Code,
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
import html from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import sql from "highlight.js/lib/languages/sql";

// Register languages
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("rust", rust);
hljs.registerLanguage("go", go);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("json", json);
hljs.registerLanguage("html", html);
hljs.registerLanguage("css", css);
hljs.registerLanguage("sql", sql);

// Import highlight.js styles
import "highlight.js/styles/github-dark.css";

const UI = {
  page: "bg-[#050608]",
  panel: "bg-zinc-950/94",
  panelSoft: "bg-white/[0.045]",
  border: "border-white/10",
  borderStrong: "border-white/15",
  accent: "text-primary",
  accentBg: "bg-primary/16",
  accentRing: "shadow-[0_0_24px_rgba(0,255,65,0.18)]",
};

type ChatMode = "long";

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
  is_byok?: boolean;
}

interface ModelsResponse {
  ok: boolean;
  models: AIModel[];
  recommendedModel?: string;
}

const BACKEND = "/api";
const MODEL_STORAGE_KEY = "ouwibo_model";
const CONVERSATION_STORAGE_KEY = "ouwibo_conversation";

const FALLBACK_MODELS: AIModel[] = [
  { model_name: "gpt-oss:20b", label: "GPT-OSS 20B", vendor: "Open Source", type: "free", context_window: 128000, is_byok: false, description: "General purpose, fast and capable" },
  { model_name: "gemma4:31b", label: "Gemma 4 31B", vendor: "Google", type: "free", context_window: 128000, is_byok: false, description: "Latest Gemma, excellent reasoning" },
  { model_name: "gemma3:27b", label: "Gemma 3 27B", vendor: "Google", type: "free", context_window: 128000, is_byok: false, description: "Balanced performance" },
  { model_name: "gemma3:12b", label: "Gemma 3 12B", vendor: "Google", type: "free", context_window: 128000, is_byok: false, description: "Lightweight, fast responses" },
  { model_name: "gemma3:4b", label: "Gemma 3 4B", vendor: "Google", type: "free", context_window: 128000, is_byok: false, description: "Ultra lightweight" },
  { model_name: "qwen3-coder-next", label: "Qwen3 Coder", vendor: "Alibaba", type: "free", context_window: 128000, is_byok: false, description: "Specialized for code tasks" },
  { model_name: "nemotron-3-nano:30b", label: "Nemotron 3 Nano", vendor: "NVIDIA", type: "free", context_window: 128000, is_byok: false, description: "Efficient and accurate" },
  { model_name: "devstral-small-2:24b", label: "Devstral 2", vendor: "Mistral", type: "free", context_window: 128000, is_byok: false, description: "Code-focused model" },
];

const QUICK_PROMPTS = [
  "Research the latest AI trends and write a summary report",
  "Build me a Python web scraper for product prices",
  "Create a 30-day learning plan for machine learning",
  "Find the top 5 competitors of Tesla and analyze them",
  "Write a REST API in Node.js with authentication",
  "Explain how transformer models work with code examples",
];

function formatTokens(value?: number | null) {
  if (!value) return "-";
  return value >= 1000000 ? `${Math.round(value / 100000) / 10}M` : `${Math.round(value / 1000)}k`;
}

function Badge({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "green" | "blue" | "amber" }) {
  const cls =
    tone === "green"
      ? "bg-emerald-500/16 text-emerald-300 border-emerald-400/20"
      : tone === "blue"
        ? "bg-cyan-500/14 text-cyan-300 border-cyan-400/20"
        : tone === "amber"
          ? "bg-amber-500/16 text-amber-300 border-amber-400/20"
          : "bg-white/6 text-white/60 border-white/10";

  return <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-mono tracking-wide ${cls}`}>{children}</span>;
}

// Loading dots animation
function LoadingDots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
          className="h-1.5 w-1.5 rounded-full bg-primary"
        />
      ))}
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-sm"
    >
      <LoadingDots />
      <span className="text-sm text-white/60">Thinking...</span>
    </motion.div>
  );
}

function WritingIndicator({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[85%]"
    >
      <div className="rounded-2xl rounded-bl-md border border-white/15 bg-gradient-to-b from-white/[0.08] to-white/[0.04] px-4 py-3 shadow-lg">
        <div className="prose prose-invert prose-sm max-w-none">
          <div dangerouslySetInnerHTML={{ __html: parseMarkdown(text) }} />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <LoadingDots />
          <span className="text-[10px] text-primary/60">Writing...</span>
        </div>
      </div>
    </motion.div>
  );
}

// Configure marked
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch {}
    }
    return hljs.highlightAuto(code).value;
  },
  breaks: true,
  gfm: true,
});

function parseMarkdown(text: string): string {
  return marked.parse(text) as string;
}

// Code block component with copy button
function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlighted = language && hljs.getLanguage(language)
    ? hljs.highlight(code, { language }).value
    : hljs.highlightAuto(code).value;

  return (
    <div className="relative group my-3">
      <div className="flex items-center justify-between bg-zinc-900/80 rounded-t-lg border border-white/10 px-3 py-1.5">
        <span className="text-[10px] font-mono text-white/50 uppercase">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] text-white/50 hover:text-white transition-colors"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="bg-zinc-950 border border-t-0 border-white/10 rounded-b-lg p-4 overflow-x-auto">
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </div>
  );
}

function isFileMentionToken(token: string) {
  return /^`file\s+['"][^'"]+['"]`$/.test(token.trim());
}

function extractFileMentionPath(token: string) {
  const match = token.trim().match(/^`file\s+['"]([^'"]+)['"]`$/);
  return match?.[1] || "";
}

function isUrlToken(token: string) {
  return /^https?:\/\//i.test(token.trim());
}

function renderMessageContent(content: string) {
  // Parse markdown
  const html = parseMarkdown(content);
  return <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/15 bg-black/50 shadow-lg">
          <img src="/logo.png" alt="OUWIBO" className="h-full w-full object-cover" style={{ objectPosition: "center 15%" }} />
        </div>
      )}
      <div className={`max-w-[85%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div
          className={`rounded-2xl px-4 py-3 backdrop-blur-sm ${
            isUser
              ? "rounded-br-md bg-primary text-black font-medium shadow-[0_0_20px_rgba(0,255,65,0.2)]"
              : "rounded-bl-md border border-white/15 bg-white/[0.06] text-white/95"
          }`}
        >
          {isUser ? <span className="whitespace-pre-wrap">{message.content}</span> : renderMessageContent(message.content)}
        </div>
        <span className="px-2 text-[10px] font-mono text-white/30">
          {new Date(message.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
      {isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10">
          <span className="text-xs font-semibold text-white/70">U</span>
        </div>
      )}
    </motion.div>
  );
}

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [models, setModels] = useState<AIModel[]>(FALLBACK_MODELS);
  const [conversationId, setConversationId] = useState<string | null>(() => localStorage.getItem(CONVERSATION_STORAGE_KEY));
  const [streamConversationId, setStreamConversationId] = useState<string | null>(null);
  const [model, setModel] = useState(() => localStorage.getItem(MODEL_STORAGE_KEY) || "gpt-oss:20b");
  const [mode, setMode] = useState<ChatMode>(() => (localStorage.getItem("ouwibo_chat_mode") as ChatMode) || "long");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  useEffect(() => {
    fetch(`${BACKEND}/health`, { headers: { Accept: "application/json" } })
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch(() => setHealth({ ok: false, serverKeys: { ai: false } }));

    fetch(`${BACKEND}/models`, { headers: { Accept: "application/json" } })
      .then(async (res) => {
        const data = (await res.json().catch(() => null)) as ModelsResponse | null;
        if (!res.ok || !data?.models?.length) throw new Error("no models");
        setModels(data.models);
        const nextModel = data.recommendedModel || data.models.find((m) => m.type === "free")?.model_name || data.models[0].model_name;
        setModel((prev) => (data.models.some((m) => m.model_name === prev) ? prev : nextModel));
      })
      .catch(() => setModels(FALLBACK_MODELS));
  }, []);

  useEffect(() => {
    localStorage.setItem(MODEL_STORAGE_KEY, model);
  }, [model]);

  useEffect(() => {
    localStorage.setItem("ouwibo_chat_mode", mode);
  }, [mode]);

  useEffect(() => {
    if (conversationId) localStorage.setItem(CONVERSATION_STORAGE_KEY, conversationId);
    else localStorage.removeItem(CONVERSATION_STORAGE_KEY);
  }, [conversationId]);

  const serverHasAiKey = !!health?.serverKeys?.ai;
  const canSend = serverHasAiKey && !!model && !loading;
  const selectedModel = useMemo(() => models.find((item) => item.model_name === model) || models[0], [model, models]);

  const sendMessage = useCallback(async (text?: string) => {
    const prompt = (text || input).trim();
    if (!prompt || loading || !canSend) return;

    const userMessage: Message = { id: `u-${Date.now()}`, role: "user", content: prompt, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setThinking(true);
    setStreamingText("");

    try {
      const response = await fetch(`${BACKEND}/agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ input: prompt, conversation_id: conversationId, model_name: model, mode }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(err.error || "Server error");
      }

      const nextConversationId = response.headers.get("x-conversation-id");
      if (nextConversationId) setStreamConversationId(nextConversationId);

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Streaming response unavailable");

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

          let evt: { type?: string; content?: string; message?: string } | null = null;
          try {
            evt = JSON.parse(raw);
          } catch {
            continue;
          }

          if (evt?.type === "thinking") setThinking(true);
          if (evt?.type === "text" && evt.content) {
            finalText += evt.content;
            setThinking(false);
            setStreamingText(finalText);
          }
          if (evt?.type === "error") throw new Error(evt.message || "AI error");
          if (evt?.type === "done") break;
        }
      }

      if (streamConversationId) setConversationId(streamConversationId);
      else if (nextConversationId) setConversationId(nextConversationId);

      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: "assistant", content: finalText.trim() || "(no output)", createdAt: new Date().toISOString() }]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setMessages((prev) => [...prev, { id: `e-${Date.now()}`, role: "assistant", content: `⚠️ ${message}`, createdAt: new Date().toISOString() }]);
    } finally {
      setLoading(false);
      setThinking(false);
      setStreamingText("");
      setStreamConversationId(null);
    }
  }, [canSend, conversationId, input, loading, model, mode, streamConversationId]);

  const handleKey = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const modelLabel = selectedModel?.label || model.replace(/^(ollama|zo):/i, "");

  return (
    <div className={`relative flex h-screen overflow-hidden ${UI.page} text-white selection:bg-primary/30 selection:text-black`}>
      <MatrixBackground />

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-5"
            onClick={(event) => event.target === event.currentTarget && setShowSettings(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="w-full max-w-xl rounded-2xl border border-white/15 bg-zinc-950 p-5 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Select Model</h2>
                  <p className="mt-1 text-xs text-white/40">Choose an AI model for your session</p>
                </div>
                <button onClick={() => setShowSettings(false)} className="text-white/40 transition-colors hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid max-h-[50vh] gap-2 overflow-y-auto pr-1 md:grid-cols-2">
                {models.map((item) => {
                  const active = item.model_name === model;
                  return (
                    <button
                      key={item.model_name}
                      onClick={() => {
                        setModel(item.model_name);
                        setShowSettings(false);
                      }}
                      className={`rounded-xl border p-3 text-left transition-all ${
                        active ? "border-primary/50 bg-primary/10" : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className="mb-1.5 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-white">{item.label}</div>
                          <div className="truncate text-[10px] font-mono text-white/30">{item.vendor}</div>
                        </div>
                        {active ? <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" /> : <Globe className="h-4 w-4 shrink-0 text-white/20" />}
                      </div>
                      <p className="mb-2 text-[11px] leading-relaxed text-white/50">{item.description || item.vendor}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {item.type === "free" && <Badge tone="green">FREE</Badge>}
                        <Badge>{formatTokens(item.context_window)}</Badge>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setModel(health?.defaultModel || "gpt-oss:20b")}
                  className="rounded-lg border border-white/10 px-4 py-2 text-xs text-white/60 transition-colors hover:bg-white/5"
                >
                  Reset default
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="ml-auto rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-black transition-all hover:opacity-90"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="hidden w-60 flex-col border-r border-white/8 bg-black/90 backdrop-blur-xl md:flex">
        <div className="border-b border-white/8 p-4">
          <Link href="/" className="flex items-center gap-2 text-white/50 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-bold tracking-wider text-white">OUWIBO<span className="text-primary">_</span></span>
          </Link>
        </div>

        <div className="space-y-2 border-b border-white/8 p-4">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${health?.ok ? "bg-primary" : "bg-red-500"} animate-pulse`} />
            <span className="text-[11px] font-mono text-white/40">{health?.ok ? "ONLINE" : "OFFLINE"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${serverHasAiKey ? "bg-primary" : "bg-yellow-500"} animate-pulse`} />
            <span className="text-[11px] font-mono text-white/40">{serverHasAiKey ? "AI READY" : "NO API KEY"}</span>
          </div>
        </div>

        <div className="space-y-2 p-4">
          <button
            onClick={() => setShowSettings(true)}
            className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white/60 transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
          >
            <Settings className="h-4 w-4" />
            Model · {modelLabel}
          </button>
          <button
            onClick={() => {
              setMessages([]);
              setConversationId("");
              setStreamingText("");
              localStorage.removeItem(CONVERSATION_STORAGE_KEY);
            }}
            disabled={loading && !messages.length}
            className="flex w-full items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-sm text-red-400/60 transition-all hover:bg-red-500/10 hover:text-red-300 disabled:opacity-30"
          >
            <Trash2 className="h-4 w-4" />
            Clear Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <p className="mb-2 px-1 text-[10px] tracking-[0.2em] text-white/30 font-mono">QUICK PROMPTS</p>
          <div className="space-y-1.5">
            {QUICK_PROMPTS.map((item) => (
              <button
                key={item}
                onClick={() => sendMessage(item)}
                disabled={!canSend}
                className="w-full rounded-lg border border-white/6 bg-white/[0.02] px-3 py-2 text-left text-[11px] leading-relaxed text-white/50 transition-all hover:border-primary/30 hover:bg-primary/10 hover:text-white/90 disabled:opacity-30"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center gap-3 border-b border-white/8 bg-black/80 px-4 backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-1.5 text-white/40 transition-colors hover:text-white md:hidden">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${loading ? "bg-yellow-400" : "bg-primary"} animate-pulse`} />
            <span className="font-mono text-[12px] tracking-wide text-white/70">
              {loading ? "PROCESSING..." : "OUWIBO AGENT"}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {!serverHasAiKey && (
              <span className="hidden rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-[10px] font-mono text-yellow-400 md:inline-flex">
                Configure API Key
              </span>
            )}
            <button onClick={() => setShowSettings(true)} className="text-white/40 transition-colors hover:text-white md:hidden">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
            {messages.length === 0 && !streamingText && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-[50vh] flex-col items-center justify-center gap-5 text-center">
                <div className="relative">
                  <div className="absolute inset-0 scale-150 rounded-full bg-primary/15 blur-2xl animate-pulse" />
                  <img
                    src="/logo.png"
                    alt="OUWIBO"
                    className="relative h-16 w-16 rounded-full border-2 border-primary/40 object-cover shadow-[0_0_20px_rgba(0,255,65,0.3)]"
                    style={{ objectPosition: "center 15%" }}
                  />
                </div>
                <div>
                  <h1 className="mb-2 text-2xl font-bold text-white">OUWIBO Agent</h1>
                  <p className="mx-auto max-w-md text-sm leading-relaxed text-white/40">
                    AI-powered assistant for coding, research, and task automation. Select a model and start chatting.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Badge tone="blue">{modelLabel}</Badge>
                  {selectedModel?.type === "free" && <Badge tone="green">FREE</Badge>}
                  {serverHasAiKey ? <Badge tone="green">AI READY</Badge> : <Badge tone="amber">NO API KEY</Badge>}
                </div>
                <div className="grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
                  {QUICK_PROMPTS.slice(0, 4).map((item) => (
                    <button
                      key={item}
                      onClick={() => sendMessage(item)}
                      disabled={!canSend}
                      className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-left text-[11px] leading-relaxed text-white/50 transition-all hover:border-primary/30 hover:bg-primary/10 hover:text-white/90 disabled:opacity-30"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </AnimatePresence>

            {streamingText && <WritingIndicator text={streamingText} />}
            {thinking && !streamingText && <ThinkingIndicator />}

            <div ref={bottomRef} />
          </div>
        </div>

        <div className="shrink-0 border-t border-white/8 bg-black/80 p-4 backdrop-blur-xl">
          <div className="mx-auto flex max-w-3xl items-end gap-2">
            <div className="relative flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                disabled={!canSend || loading}
                placeholder={serverHasAiKey ? `Message ${modelLabel}...` : "Configure API key first..."}
                rows={1}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 disabled:opacity-40"
                style={{ maxHeight: 120, overflowY: "hidden" }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                }}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || !canSend || loading}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-black shadow-[0_0_16px_rgba(0,255,65,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_24px_rgba(0,255,65,0.5)] active:scale-95 disabled:opacity-30"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
          <p className="mt-2 text-center font-mono text-[10px] text-white/25">
            ENTER to send · SHIFT+ENTER for new line · Model: {modelLabel}
          </p>
        </div>
      </main>
    </div>
  );
}
