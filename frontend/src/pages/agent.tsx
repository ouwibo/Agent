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
} from "lucide-react";
import { MatrixBackground } from "@/components/matrix-background";

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

interface ZoModel {
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
  models: ZoModel[];
  recommendedModel?: string;
}

const BACKEND = "/api";
const MODEL_STORAGE_KEY = "ouwibo_zo_model";
const CONVERSATION_STORAGE_KEY = "ouwibo_zo_conversation";

const FALLBACK_MODELS: ZoModel[] = [
  { model_name: "zo:openai/gpt-5.4-mini", label: "GPT-5.4 mini", vendor: "OpenAI", type: "free", context_window: 400000, is_byok: false },
  { model_name: "zo:zai/glm-5", label: "GLM 5", vendor: "Z.AI", type: "free", context_window: 202752, is_byok: false },
  { model_name: "zo:google/kimi-k2", label: "Kimi K2", vendor: "Moonshot AI", type: "free", context_window: 200000, is_byok: false },
];

const QUICK_PROMPTS = [
  "Bantu saya bikin ringkasan singkat dari topik yang sedang tren",
  "Jelaskan sesuatu dengan gaya yang sederhana dan langsung",
  "Buat ide fitur untuk website AI publik",
  "Tulis prompt yang lebih tajam untuk AI agent",
  "Analisis halaman web dan beri poin pentingnya",
  "Buat rencana langkah demi langkah untuk task kompleks",
];

function formatTokens(value?: number | null) {
  if (!value) return "-";
  return value >= 1000000 ? `${Math.round(value / 100000) / 10}M` : `${Math.round(value / 1000)}k`;
}

function Badge({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "green" | "blue" | "amber" }) {
  const cls =
    tone === "green"
      ? "bg-green-500/15 text-green-400 border-green-500/20"
      : tone === "blue"
        ? "bg-primary/15 text-primary border-primary/20"
        : tone === "amber"
          ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/20"
          : "bg-white/5 text-white/55 border-white/10";

  return <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-mono tracking-wide ${cls}`}>{children}</span>;
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/30 bg-black/60 shadow-[0_0_10px_rgba(0,255,65,0.18)]">
          <img src="/logo.png" alt="OUWIBO" className="h-full w-full object-cover" style={{ objectPosition: "center 15%" }} />
        </div>
      )}
      <div className={`max-w-[86%] md:max-w-[72%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-2`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser ? "rounded-br-sm bg-primary text-black font-medium" : "rounded-bl-sm border border-white/10 bg-white/5 text-white/90"}`}>
          <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
        </div>
        <span className="px-1 font-mono text-[10px] text-white/20">{new Date(message.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
      </div>
      {isUser && (
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10">
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
  const [models, setModels] = useState<ZoModel[]>(FALLBACK_MODELS);
  const [model, setModel] = useState(() => localStorage.getItem(MODEL_STORAGE_KEY) || "zo:openai/gpt-5.4-mini");
  const [conversationId, setConversationId] = useState(() => localStorage.getItem(CONVERSATION_STORAGE_KEY) || "");
  const [streamConversationId, setStreamConversationId] = useState<string | null>(null);

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
    setStreamConversationId(null);

    try {
      const response = await fetch(`${BACKEND}/agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ input: prompt, conversation_id: conversationId, model_name: model }),
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
          if (evt?.type === "error") throw new Error(evt.message || "AI returned an error");
          if (evt?.type === "done") break;
        }
      }

      if (streamConversationId) setConversationId(streamConversationId);
      else if (nextConversationId) setConversationId(nextConversationId);

      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: "assistant", content: finalText.trim() || "(tidak ada output)", createdAt: new Date().toISOString() }]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setMessages((prev) => [...prev, { id: `e-${Date.now()}`, role: "assistant", content: `⚠️ ${message}`, createdAt: new Date().toISOString() }]);
    } finally {
      setLoading(false);
      setStreamingText("");
      setStreamConversationId(null);
    }
  }, [canSend, conversationId, input, loading, model, streamConversationId]);

  const handleKey = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const modelLabel = selectedModel?.label || model.replace(/^zo:/i, "");

  return (
    <div className="relative flex h-screen overflow-hidden bg-black text-white">
      <MatrixBackground />
      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6" onClick={(event) => event.target === event.currentTarget && setShowSettings(false)}>
            <motion.div initial={{ opacity: 0, y: 14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 14, scale: 0.98 }} className="w-full max-w-2xl rounded-2xl border border-white/10 bg-black p-5 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Model</h2>
                  <p className="mt-1 text-xs text-white/35">Pilih model yang tersedia untuk akun kamu.</p>
                </div>
                <button onClick={() => setShowSettings(false)} className="text-white/40 transition-colors hover:text-white"><X className="h-5 w-5" /></button>
              </div>
              <div className="grid max-h-[55vh] gap-2 overflow-y-auto pr-1 md:grid-cols-2">
                {models.map((item) => {
                  const active = item.model_name === model;
                  return (
                    <button key={item.model_name} onClick={() => { setModel(item.model_name); setShowSettings(false); }} className={`rounded-xl border p-3 text-left transition-all ${active ? "border-primary/50 bg-primary/10" : "border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.05]"}`}>
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-white">{item.label}</div>
                          <div className="truncate text-[11px] font-mono text-white/28">{item.vendor}</div>
                        </div>
                        {active ? <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" /> : <Globe className="h-4 w-4 shrink-0 text-white/20" />}
                      </div>
                      <p className="mb-3 text-xs leading-relaxed text-white/38">{item.description || item.vendor}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {item.type === "free" && <Badge tone="green">FREE</Badge>}
                        {item.type === "subscribers" && <Badge tone="amber">PREMIUM</Badge>}
                        {item.is_byok && <Badge tone="blue">BYOK</Badge>}
                        <Badge>{formatTokens(item.context_window)}</Badge>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-5 flex gap-2">
                <button onClick={() => setModel(health?.defaultModel || "zo:openai/gpt-5.4-mini")} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/5">Reset default</button>
                <button onClick={() => setShowSettings(false)} className="ml-auto rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <aside className="hidden w-72 flex-col border-r border-white/8 bg-black/90 backdrop-blur-xl md:flex">
        <div className="border-b border-white/8 p-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-white/50 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            <span className="font-bold tracking-wider text-white">OUWIBO<span className="text-primary">_</span></span>
          </Link>
        </div>
        <div className="space-y-2 border-b border-white/6 p-4">
          <div className="flex items-center gap-2"><div className={`h-2 w-2 rounded-full ${health?.ok ? "bg-primary" : "bg-red-500"} animate-pulse`} /><span className="text-xs font-mono text-white/35">{health?.ok ? "SERVER ONLINE" : "SERVER OFFLINE"}</span></div>
          <div className="flex items-center gap-2"><div className={`h-2 w-2 rounded-full ${serverHasAiKey ? "bg-primary" : "bg-yellow-500"} animate-pulse`} /><span className="text-xs font-mono text-white/35">{serverHasAiKey ? "API KEY ACTIVE" : "SET ZO_API_KEY"}</span></div>
        </div>
        <div className="p-3 space-y-2">
          <button onClick={() => setShowSettings(true)} className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/3 px-3 py-2.5 text-sm font-medium text-white/55 transition-all hover:bg-white/8 hover:text-white"><Settings className="h-4 w-4" />Model · {modelLabel}</button>
          <button onClick={() => { setMessages([]); setConversationId(""); setStreamingText(""); localStorage.removeItem(CONVERSATION_STORAGE_KEY); }} disabled={loading && !messages.length} className="flex w-full items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-sm font-medium text-red-400/55 transition-all hover:bg-red-500/10 hover:text-red-400 disabled:opacity-25"><Trash2 className="h-4 w-4" />Clear Chat</button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <p className="mb-2 px-2 py-1 text-[10px] tracking-[0.28em] text-white/20 font-mono">QUICK PROMPTS</p>
          <div className="space-y-1.5">
            {QUICK_PROMPTS.map((item) => (
              <button key={item} onClick={() => sendMessage(item)} disabled={!canSend} className="w-full rounded-lg border border-white/6 bg-white/[0.02] px-3 py-2 text-left font-mono text-[11px] leading-relaxed text-white/35 transition-all hover:border-primary/25 hover:bg-primary/8 hover:text-white/70 disabled:opacity-20">{item}</button>
            ))}
          </div>
        </div>
      </aside>
      <main className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-white/8 bg-black/70 px-4 backdrop-blur-md md:px-6">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-white/40 transition-colors hover:text-white md:hidden"><ArrowLeft className="h-4 w-4" /></Link>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${loading ? "bg-yellow-400" : "bg-primary"} animate-pulse`} />
            <span className="font-mono text-sm tracking-wide text-white/60">{loading ? "OUWIBO WORKING..." : "OUWIBO AGENT // READY"}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {!serverHasAiKey && <span className="hidden rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-xs font-mono text-yellow-400 md:inline-flex">Add API key in Vercel env</span>}
            <button onClick={() => setShowSettings(true)} className="text-white/40 transition-colors hover:text-white md:hidden"><Settings className="h-5 w-5" /></button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
            {messages.length === 0 && !streamingText && (
              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-[55vh] flex-col items-center justify-center gap-5 text-center">
                <div className="relative">
                  <div className="absolute inset-0 scale-125 rounded-full bg-primary/20 blur-xl animate-pulse" />
                  <img src="/logo.png" alt="OUWIBO" className="relative h-16 w-16 rounded-full border-2 border-primary/40 object-cover shadow-[0_0_20px_rgba(0,255,65,0.35)]" style={{ objectPosition: "center 15%" }} />
                </div>
                <div>
                  <h1 className="mb-1 text-2xl font-bold text-white">OUWIBO Agent</h1>
                  <p className="mx-auto max-w-xl text-sm leading-relaxed text-white/35">Public AI agent di atas Zo Computer. Pilih model, lalu kirim prompt langsung.</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Badge tone="blue">{modelLabel}</Badge>
                  {selectedModel?.type === "free" && <Badge tone="green">FREE</Badge>}
                  {selectedModel?.type === "subscribers" && <Badge tone="amber">PREMIUM</Badge>}
                  {serverHasAiKey ? <Badge tone="green">API KEY ACTIVE</Badge> : <Badge tone="amber">SET ZO_API_KEY</Badge>}
                </div>
                <div className="grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
                  {QUICK_PROMPTS.slice(0, 4).map((item) => (
                    <button key={item} onClick={() => sendMessage(item)} disabled={!canSend} className="rounded-xl border border-white/8 bg-white/[0.02] px-3 py-3 text-left text-[11px] leading-relaxed text-white/35 transition-all hover:border-primary/25 hover:bg-primary/8 hover:text-white/70 disabled:opacity-20">{item}</button>
                  ))}
                </div>
              </motion.div>
            )}
            <AnimatePresence initial={false}>{messages.map((message) => (<MessageBubble key={message.id} message={message} />))}</AnimatePresence>
            {streamingText && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 justify-start">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/30 bg-black/60 shadow-[0_0_10px_rgba(0,255,65,0.18)]"><img src="/logo.png" alt="OUWIBO" className="h-full w-full object-cover" style={{ objectPosition: "center 15%" }} /></div>
                <div className="max-w-[86%] md:max-w-[72%]"><div className="rounded-2xl rounded-bl-sm border border-white/10 bg-white/5 px-4 py-3 text-sm leading-relaxed text-white/90"><pre className="whitespace-pre-wrap font-sans">{streamingText}<span className="ml-1 inline-block h-4 w-2 animate-pulse bg-primary align-bottom" /></pre></div></div>
              </motion.div>
            )}
            {!messages.length && loading && <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70"><Loader2 className="h-4 w-4 animate-spin text-primary" />Memproses jawaban...</div>}
            <div ref={bottomRef} />
          </div>
        </div>
        <div className="shrink-0 border-t border-white/8 bg-black/70 p-3 backdrop-blur-md md:p-4">
          <div className="mx-auto flex max-w-4xl items-end gap-2">
            <div className="relative flex-1">
              <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={handleKey} disabled={!canSend || loading} placeholder={serverHasAiKey ? `Tulis prompt untuk ${modelLabel}...` : "Tambahkan API key di Vercel dulu..."} rows={1} className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/50 disabled:opacity-40" style={{ maxHeight: 120, overflowY: "auto" }} onInput={(event) => { const target = event.target as HTMLTextAreaElement; target.style.height = "auto"; target.style.height = `${Math.min(target.scrollHeight, 120)}px`; }} />
            </div>
            <button onClick={() => sendMessage()} disabled={!input.trim() || !canSend || loading} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-black shadow-[0_0_16px_rgba(0,255,65,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_24px_rgba(0,255,65,0.45)] active:scale-95 disabled:opacity-25">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</button>
          </div>
          <p className="mt-2 text-center font-mono text-[10px] tracking-wider text-white/12">ENTER · SHIFT+ENTER baru baris · model: {modelLabel}</p>
        </div>
      </main>
    </div>
  );
}
