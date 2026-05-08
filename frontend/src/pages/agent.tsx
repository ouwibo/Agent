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
  Sparkles,
  Search,
  FileText,
  Calculator,
  Globe2,
  Database,
  Cpu,
  BookOpen,
  Zap,
  ChevronDown,
} from "lucide-react";
import { MatrixBackground } from "@/components/matrix-background";

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
  { model_name: "gemma3:4b", label: "Gemma 3 4B", vendor: "Google", type: "free", context_window: 128000, is_byok: false, description: "Ultra lightweight, fast responses" },
  { model_name: "gemma3:12b", label: "Gemma 3 12B", vendor: "Google", type: "free", context_window: 128000, is_byok: false, description: "Lightweight, fast responses" },
  { model_name: "gemma3:27b", label: "Gemma 3 27B", vendor: "Google", type: "free", context_window: 128000, is_byok: false, description: "Balanced performance" },
  { model_name: "gemma4:31b", label: "Gemma 4 31B", vendor: "Google", type: "free", context_window: 128000, is_byok: false, description: "Latest Gemma, excellent reasoning" },
  { model_name: "gpt-oss:20b", label: "GPT-OSS 20B", vendor: "Open Source", type: "free", context_window: 128000, is_byok: false, description: "General purpose, fast and capable" },
  { model_name: "qwen3-coder-next", label: "Qwen3 Coder", vendor: "Alibaba", type: "free", context_window: 128000, is_byok: false, description: "Specialized for code tasks" },
  { model_name: "nemotron-3-nano:30b", label: "Nemotron 3 Nano", vendor: "NVIDIA", type: "free", context_window: 128000, is_byok: false, description: "Efficient and accurate" },
  { model_name: "devstral-small-2:24b", label: "Devstral 2", vendor: "Mistral", type: "free", context_window: 128000, is_byok: false, description: "Code-focused model" },
];

const SKILLS = [
  { icon: Search, name: "Web Search", desc: "Search the internet for real-time information", color: "text-cyan-400" },
  { icon: Code, name: "Code Writing", desc: "Write, debug and explain code in any language", color: "text-yellow-400" },
  { icon: Globe2, name: "Browse URLs", desc: "Visit websites and extract information", color: "text-green-400" },
  { icon: FileText, name: "Content Writing", desc: "Create articles, reports, and documentation", color: "text-purple-400" },
  { icon: Calculator, name: "Data Analysis", desc: "Analyze and visualize data", color: "text-orange-400" },
  { icon: Database, name: "File Operations", desc: "Read, write, and manage files", color: "text-pink-400" },
  { icon: Cpu, name: "Task Planning", desc: "Break complex goals into actionable steps", color: "text-blue-400" },
  { icon: BookOpen, name: "Research", desc: "Deep research on any topic", color: "text-emerald-400" },
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

function LoadingDots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
          className="h-2 w-2 rounded-full bg-primary"
        />
      ))}
    </div>
  );
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-3 rounded-xl border border-white/10 bg-zinc-900/80 overflow-hidden">
      <div className="flex items-center justify-between bg-zinc-800/80 px-3 py-1.5 border-b border-white/5">
        <span className="text-[11px] font-mono text-white/50">{language || "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white transition-colors"
        >
          {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 text-[13px] font-mono text-white/90 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function renderContent(content: string) {
  const parts: React.ReactNode[] = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let key = 0;

  for (const match of content.matchAll(codeBlockRegex)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push(
        <span key={`t-${key++}`} className="whitespace-pre-wrap text-[14px] leading-relaxed">
          {content.slice(lastIndex, index)}
        </span>
      );
    }

    const language = match[1] || "";
    const code = match[2].trim();
    parts.push(<CodeBlock key={`c-${key++}`} code={code} language={language} />);

    lastIndex = index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(
      <span key={`t-${key++}`} className="whitespace-pre-wrap text-[14px] leading-relaxed">
        {content.slice(lastIndex)}
      </span>
    );
  }

  return parts.length > 0 ? <>{parts}</> : <span className="whitespace-pre-wrap text-[14px] leading-relaxed">{content}</span>;
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 border border-primary/30">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}
      <div className={`max-w-[85%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div
          className={`rounded-2xl px-4 py-3 backdrop-blur-sm ${
            isUser
              ? "rounded-tr-sm bg-primary text-black font-medium"
              : "rounded-tl-sm border border-white/10 bg-white/[0.03] text-white/90"
          }`}
        >
          {isUser ? <span className="text-[14px]">{message.content}</span> : renderContent(message.content)}
        </div>
        <span className="px-1 text-[10px] text-white/30">
          {new Date(message.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 border border-white/15">
          <span className="text-[11px] font-semibold text-white/70">U</span>
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
  const [showSkills, setShowSkills] = useState(false);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [models, setModels] = useState<AIModel[]>(FALLBACK_MODELS);
  const [conversationId, setConversationId] = useState<string | null>(() => localStorage.getItem(CONVERSATION_STORAGE_KEY));
  const [streamConversationId, setStreamConversationId] = useState<string | null>(null);
  const [model, setModel] = useState(() => localStorage.getItem(MODEL_STORAGE_KEY) || "gemma3:4b");
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

          if (evt?.type === "text" && evt.content) {
            finalText += evt.content;
            setStreamingText(finalText);
          }
          if (evt?.type === "error") throw new Error(evt.message || "AI error");
          if (evt?.type === "done") break;
        }
      }

      if (streamConversationId) setConversationId(streamConversationId);
      else if (nextConversationId) setConversationId(nextConversationId);

      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: "assistant", content: finalText.trim() || "(no response)", createdAt: new Date().toISOString() }]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setMessages((prev) => [...prev, { id: `e-${Date.now()}`, role: "assistant", content: `⚠️ ${message}`, createdAt: new Date().toISOString() }]);
    } finally {
      setLoading(false);
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

  const modelLabel = selectedModel?.label || model;

  return (
    <div className={`flex h-screen overflow-hidden ${UI.page} text-white`}>
      <MatrixBackground />

      {/* Sidebar */}
      <aside className="hidden w-72 flex-col border-r border-white/8 bg-black/90 backdrop-blur-xl md:flex">
        <div className="border-b border-white/8 p-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
            <LayoutDashboard className="h-4 w-4" />
            <span className="text-base font-bold">OUWIBO<span className="text-primary">_</span></span>
          </Link>
        </div>

        {/* Status */}
        <div className="border-b border-white/8 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${health?.ok ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-xs text-white/50">{health?.ok ? "Online" : "Offline"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs text-white/70 font-medium">{modelLabel}</span>
          </div>
        </div>

        {/* Skills */}
        <div className="border-b border-white/8 p-4">
          <button
            onClick={() => setShowSkills(!showSkills)}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-xs font-mono text-white/40 tracking-wider">SKILLS</span>
            <ChevronDown className={`h-3 w-3 text-white/40 transition-transform ${showSkills ? "rotate-180" : ""}`} />
          </button>
          {showSkills && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {SKILLS.map((skill, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 rounded-lg border border-white/5 bg-white/[0.02] hover:border-primary/20 hover:bg-primary/5 transition-all cursor-pointer"
                >
                  <skill.icon className={`h-4 w-4 ${skill.color}`} />
                  <span className="text-[11px] text-white/60 truncate">{skill.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 space-y-2">
          <button
            onClick={() => setShowSettings(true)}
            className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-all"
          >
            <Settings className="h-4 w-4" />
            Change Model
          </button>
          <button
            onClick={() => { setMessages([]); setConversationId(""); localStorage.removeItem(CONVERSATION_STORAGE_KEY); }}
            className="flex w-full items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-sm text-red-400/70 hover:bg-red-500/10 transition-all"
          >
            <Trash2 className="h-4 w-4" />
            Clear Chat
          </button>
        </div>

        {/* Quick Prompts */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-xs font-mono text-white/40 tracking-wider mb-3">QUICK PROMPTS</p>
          <div className="space-y-2">
            {QUICK_PROMPTS.map((item, i) => (
              <button
                key={i}
                onClick={() => sendMessage(item)}
                disabled={!canSend || loading}
                className="w-full rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2.5 text-left text-[12px] leading-relaxed text-white/50 hover:border-primary/20 hover:bg-primary/5 hover:text-white/80 disabled:opacity-30 transition-all"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="relative flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/8 bg-black/80 px-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-1.5 text-white/40 hover:text-white md:hidden">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${loading ? "bg-yellow-400 animate-pulse" : "bg-primary"}`} />
              <span className="text-sm font-medium text-white/80">
                {loading ? "Generating..." : "OUWIBO Agent"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="blue">{modelLabel}</Badge>
            <button onClick={() => setShowSettings(true)} className="md:hidden text-white/40 hover:text-white">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
            {messages.length === 0 && !streamingText && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center gap-6 py-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-white mb-2">OUWIBO Agent</h1>
                  <p className="text-white/40 max-w-md">An autonomous AI assistant with web search, code writing, and task planning capabilities.</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Badge tone="blue">{modelLabel}</Badge>
                  {selectedModel?.type === "free" && <Badge tone="green">FREE</Badge>}
                  {serverHasAiKey ? <Badge tone="green">READY</Badge> : <Badge tone="amber">SETUP REQUIRED</Badge>}
                </div>
                <div className="grid w-full max-w-xl grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  {QUICK_PROMPTS.slice(0, 4).map((item, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(item)}
                      disabled={!canSend || loading}
                      className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-[13px] leading-relaxed text-white/50 hover:border-primary/30 hover:bg-primary/5 hover:text-white/80 disabled:opacity-30 transition-all"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((message) => <MessageBubble key={message.id} message={message} />)}
            </AnimatePresence>

            {streamingText && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 rounded-2xl rounded-tl-sm border border-white/10 bg-white/[0.03] px-4 py-3">
                  {renderContent(streamingText)}
                  <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-1" />
                </div>
              </motion.div>
            )}

            {loading && !streamingText && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 text-white/50">
                <LoadingDots />
                <span className="text-sm">Generating response...</span>
              </motion.div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-white/8 bg-black/80 p-4 backdrop-blur-xl">
          <div className="mx-auto flex max-w-3xl items-end gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={!canSend || loading}
              placeholder={serverHasAiKey ? `Message ${modelLabel}...` : "Setup required..."}
              rows={1}
              className="flex-1 resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[14px] text-white placeholder-white/30 focus:outline-none focus:border-primary/40 disabled:opacity-40"
              style={{ maxHeight: 120 }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || !canSend || loading}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-black transition-all hover:opacity-90 active:scale-95 disabled:opacity-30"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={(e) => e.target === e.currentTarget && setShowSettings(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-900 p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Select Model</h2>
                <button onClick={() => setShowSettings(false)} className="text-white/40 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-2">
                {models.map((item) => {
                  const active = item.model_name === model;
                  return (
                    <button
                      key={item.model_name}
                      onClick={() => { setModel(item.model_name); setShowSettings(false); }}
                      className={`w-full rounded-xl border p-3 text-left transition-all ${
                        active
                          ? "border-primary/40 bg-primary/10"
                          : "border-white/8 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-[14px]">{item.label}</span>
                        {active && <CheckCircle2 className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="text-[12px] text-white/40">{item.description || item.vendor}</p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setShowSettings(false)}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-black hover:opacity-90"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}