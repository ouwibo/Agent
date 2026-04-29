import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Bot,
  Brain,
  Clock3,
  MessageSquareText,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

type ChatItem = { role: "user" | "assistant"; content: string };

type HealthResponse = {
  ok: boolean;
  configured: boolean;
  ready: boolean;
  channel: "managed" | "direct" | "fallback" | "none";
  model: string | null;
  baseUrl: string | null;
};

type ChatResponse = {
  reply: string;
  conversationId: string | null;
  configured: boolean;
  channel: string;
};

const starterPrompts = [
  "Write a concise product description.",
  "Summarize Bitcoin in one sentence.",
  "Help me plan a premium landing page.",
];

const featureCards = [
  {
    title: "Professional presentation",
    text: "A cleaner layout with more breathing room and sharper hierarchy.",
    icon: Sparkles,
  },
  {
    title: "Fast, focused replies",
    text: "Short turns, clear structure, and a conversation flow that stays easy to scan.",
    icon: MessageSquareText,
  },
  {
    title: "Always on",
    text: "Built for continuous availability with a simple, durable chat surface.",
    icon: ShieldCheck,
  },
];

const stats = [
  { label: "Session continuity", value: "On" },
  { label: "Core modes", value: "3" },
  { label: "Availability", value: "24/7" },
];

const initialAssistantMessage =
  "I am Ouwibo AI. Ask for strategy, product copy, market insight, or technical guidance.";

export default function Home() {
  const [messages, setMessages] = useState<ChatItem[]>([
    { role: "assistant", content: initialAssistantMessage },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.title = "Ouwibo AI | Agent Studio";
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadHealth() {
      try {
        const response = await fetch("/api/health", { headers: { accept: "application/json" } });
        if (!response.ok) return;
        const data = (await response.json()) as HealthResponse;
        if (!cancelled) setHealth(data);
      } catch {
        if (!cancelled) setHealth(null);
      }
    }

    void loadHealth();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const statusLabel = useMemo(() => {
    if (!health) return "Checking status";
    if (health.ready) return "Connected";
    return "Not configured";
  }, [health]);

  async function sendMessage(text: string) {
    const message = text.trim();
    if (!message || loading) return;

    const nextMessages: ChatItem[] = [...messages, { role: "user", content: message }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({ message, conversationId, messages: nextMessages }),
      });

      const data = (await response.json()) as ChatResponse & { error?: string };
      if (!response.ok) throw new Error(data.error || "Request failed");

      setMessages((current) => [...current, { role: "assistant", content: data.reply }]);
      setConversationId(data.conversationId ?? null);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: error instanceof Error ? error.message : "The agent is unavailable.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function resetChat() {
    setMessages([{ role: "assistant", content: initialAssistantMessage }]);
    setInput("");
    setConversationId(null);
  }

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-[-10rem] h-[28rem] bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_42%)]" />
        <div className="absolute right-[-8rem] top-[12rem] h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(circle,_rgba(56,189,248,0.13),_transparent_66%)] blur-3xl" />
        <div className="absolute left-[-8rem] bottom-[8rem] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,_rgba(34,197,94,0.1),_transparent_66%)] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-6 lg:py-8">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 backdrop-blur">
              <img src="/images/ouwibo-agent-logo.png" alt="Ouwibo Agent" className="size-6 object-contain" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.38em] text-white/40">Ouwibo Agent</div>
              <div className="text-sm font-medium text-white/85">Professional AI agent studio</div>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 md:flex">
            <span className={`h-2 w-2 rounded-full ${health?.ready ? "bg-emerald-400" : "bg-amber-400"}`} />
            {statusLabel}
          </div>
        </header>

        <section className="grid gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-1 text-[11px] uppercase tracking-[0.3em] text-emerald-200">
              AI agent website
            </div>
            <h1 className="mt-6 text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              A professional AI agent website.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">
              Clean presentation. Focused chat. Strong hierarchy. Built to feel credible on first view.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => document.getElementById("chat")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-black shadow-[0_20px_50px_-20px_rgba(255,255,255,0.55)] transition hover:bg-white/90"
              >
                Try the chat
                <ArrowRight className="size-4" />
              </button>
              <button
                onClick={resetChat}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 text-sm font-medium text-white transition hover:bg-white/10"
              >
                <RefreshCw className="size-4" />
                Reset
              </button>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {stats.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="text-2xl font-semibold text-white">{item.value}</div>
                  <div className="mt-1 text-sm text-white/50">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_30px_100px_-32px_rgba(0,0,0,0.95)] backdrop-blur-2xl lg:p-6">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="text-2xl font-semibold text-white">Live chat console</div>
                <div className="mt-1 text-sm text-white/55">Short replies. Clean structure. No clutter.</div>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                {health?.model ? health.model : "Ready"}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {featureCards.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70"
                  >
                    <Icon className="size-3.5" />
                    {item.title}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 h-[380px] space-y-4 overflow-y-auto rounded-[24px] border border-white/10 bg-black/20 p-4">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[84%] rounded-[22px] px-4 py-3 text-sm leading-6 ${
                      message.role === "user"
                        ? "bg-white text-black"
                        : "border border-white/10 bg-white/8 text-white"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {loading ? (
                <div className="flex justify-start">
                  <div className="rounded-[22px] border border-white/10 bg-white/8 px-4 py-3 text-sm text-white/60">
                    The agent is preparing a response...
                  </div>
                </div>
              ) : null}
              <div ref={messagesEndRef} />
            </div>

            <div className="mt-4 flex gap-3">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void sendMessage(input);
                  }
                }}
                placeholder="Ask for strategy, copy, market insight, or technical guidance"
                className="h-12 flex-1 rounded-full border border-white/10 bg-white/5 px-5 text-sm text-white outline-none placeholder:text-white/35"
              />
              <button
                onClick={() => void sendMessage(input)}
                disabled={loading}
                className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Send
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => void sendMessage(prompt)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-left text-xs text-white/70 transition hover:bg-white/10"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="chat" className="grid gap-6 pb-10 md:grid-cols-3">
          {featureCards.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_80px_-36px_rgba(0,0,0,0.9)] backdrop-blur-xl"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white">
                  <Icon className="size-5" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-white">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/60">{item.text}</p>
              </div>
            );
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-white/65">
              <Brain className="size-4" />
              <span className="text-xs uppercase tracking-[0.3em]">AI status</span>
            </div>
            <h3 className="mt-3 text-2xl font-semibold text-white">
              {health?.ready ? "Connected and ready." : "Connect an API key to go live."}
            </h3>
            <p className="mt-2 text-sm leading-6 text-white/60">
              The site checks the active API configuration on load and routes chat requests through the server.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[20px] border border-white/10 bg-black/20 p-4 text-sm text-white/70">
                Status: {statusLabel}
              </div>
              <div className="rounded-[20px] border border-white/10 bg-black/20 p-4 text-sm text-white/70">
                Model: {health?.model ?? "unknown"}
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-emerald-400/10 via-white/[0.04] to-cyan-400/10 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-white/70">
              <Zap className="size-4" />
              <span className="text-xs uppercase tracking-[0.3em]">Design notes</span>
            </div>
            <h3 className="mt-3 text-2xl font-semibold text-white">Short copy. Strong spacing.</h3>
            <p className="mt-2 text-sm leading-6 text-white/60">
              The interface is intentionally restrained so the product feels clearer, more premium, and easier to trust.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-white/45">
              <Clock3 className="size-3.5" />
              Built for continuous use
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
