import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  Send, Trash2, Bot, User, ArrowLeft, Search,
  Code2, Globe, ListTodo, ChevronDown, ChevronRight,
  Settings, X, KeyRound, Loader2, CheckCircle2, AlertCircle, Zap
} from "lucide-react";
import { MatrixBackground } from "@/components/matrix-background";

interface ToolCall {
  id: string;
  tool: string;
  args: Record<string, unknown>;
  result?: Record<string, unknown>;
  status: "running" | "done" | "error";
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCall[];
  createdAt: string;
}

const BACKEND = "/api";

const QUICK_TASKS = [
  "Research the latest trends in AI and write a summary",
  "Write a Python script to scrape product prices from a website",
  "Create a 30-day machine learning study plan",
  "Explain how neural networks work with code examples",
  "Find and compare the top 3 JavaScript frameworks",
  "Write a Node.js REST API with JWT authentication",
];

const TOOL_META: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  search_web: { icon: Search, label: "Web Search", color: "text-blue-400" },
  write_code: { icon: Code2, label: "Write Code", color: "text-yellow-400" },
  browse_url: { icon: Globe, label: "Browse URL", color: "text-purple-400" },
  create_plan: { icon: ListTodo, label: "Create Plan", color: "text-green-400" },
};

function ToolCallCard({ tc }: { tc: ToolCall }) {
  const [expanded, setExpanded] = useState(false);
  const meta = TOOL_META[tc.tool] || { icon: Zap, label: tc.tool, color: "text-primary" };
  const Icon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="rounded-xl border border-white/8 bg-white/[0.03] overflow-hidden text-xs"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
      >
        <div className={`flex items-center gap-1.5 flex-1 min-w-0 ${meta.color}`}>
          {tc.status === "running" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
          ) : tc.status === "done" ? (
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          )}
          <Icon className="w-3.5 h-3.5 shrink-0" />
          <span className="font-mono font-medium truncate">{meta.label}</span>
        </div>
        <span className="text-white/20 text-[10px] font-mono shrink-0">
          {tc.status === "running" ? "executing..." : "completed"}
        </span>
        {tc.status === "done" && (
          expanded ? <ChevronDown className="w-3 h-3 text-white/30 shrink-0" /> : <ChevronRight className="w-3 h-3 text-white/30 shrink-0" />
        )}
      </button>

      {tc.args && (
        <div className="px-3 pb-2 text-white/30 font-mono text-[10px] border-t border-white/5">
          {Object.entries(tc.args).map(([k, v]) => (
            <div key={k} className="flex gap-1.5 mt-1 min-w-0">
              <span className="text-primary/50 shrink-0">{k}:</span>
              <span className="truncate">{String(v).slice(0, 80)}</span>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {expanded && tc.result && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/8 px-3 py-2 bg-black/30"
          >
            <pre className="text-white/40 font-mono text-[10px] leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto">
              {JSON.stringify(tc.result, null, 2)}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
          <Bot className="w-4 h-4 text-primary" />
        </div>
      )}
      <div className={`max-w-[85%] md:max-w-[72%] space-y-2 ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        {msg.toolCalls && msg.toolCalls.length > 0 && (
          <div className="w-full space-y-1.5">
            {msg.toolCalls.map((tc) => <ToolCallCard key={tc.id} tc={tc} />)}
          </div>
        )}
        {msg.content && (
          <div
            className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              isUser
                ? "bg-primary text-black font-medium rounded-br-sm"
                : "bg-white/5 border border-white/10 text-white/90 rounded-bl-sm"
            }`}
          >
            <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
          </div>
        )}
        <span className="text-[10px] text-white/20 font-mono px-1">
          {new Date(msg.createdAt).toLocaleTimeString()}
        </span>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 mt-0.5">
          <User className="w-4 h-4 text-white/60" />
        </div>
      )}
    </motion.div>
  );
}

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("openai_api_key") || "");
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [serverOk, setServerOk] = useState<boolean | null>(null);
  const [streamingMsg, setStreamingMsg] = useState<{ content: string; toolCalls: ToolCall[] } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMsg]);

  useEffect(() => {
    fetch(`${BACKEND}/health`)
      .then(r => r.ok ? setServerOk(true) : setServerOk(false))
      .catch(() => setServerOk(false));
  }, []);

  const saveApiKey = () => {
    const key = apiKeyInput.trim();
    if (key) {
      setApiKey(key);
      localStorage.setItem("openai_api_key", key);
    }
    setShowSettings(false);
    setApiKeyInput("");
  };

  const clearApiKey = () => {
    setApiKey("");
    localStorage.removeItem("openai_api_key");
  };

  const sendMessage = useCallback(async (text?: string) => {
    const userInput = (text || input).trim();
    if (!userInput || streaming) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: userInput,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setStreaming(true);

    const history = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    let liveContent = "";
    let liveTools: ToolCall[] = [];

    setStreamingMsg({ content: "", toolCalls: [] });

    try {
      const res = await fetch(`${BACKEND}/agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput, history, apiKey }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Server error");
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

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
          let evt: Record<string, unknown>;
          try { evt = JSON.parse(raw); } catch { continue; }

          if (evt.type === "text") {
            liveContent += evt.content as string;
            setStreamingMsg({ content: liveContent, toolCalls: [...liveTools] });
          } else if (evt.type === "tool_start") {
            const tc: ToolCall = {
              id: evt.id as string || `tc-${Date.now()}`,
              tool: evt.tool as string,
              args: evt.args as Record<string, unknown>,
              status: "running"
            };
            liveTools = [...liveTools, tc];
            liveContent = "";
            setStreamingMsg({ content: "", toolCalls: [...liveTools] });
          } else if (evt.type === "tool_end") {
            liveTools = liveTools.map(tc =>
              tc.id === evt.id ? { ...tc, status: "done" as const, result: evt.result as Record<string, unknown> } : tc
            );
            setStreamingMsg({ content: liveContent, toolCalls: [...liveTools] });
          } else if (evt.type === "error") {
            throw new Error(evt.message as string);
          } else if (evt.type === "done") {
            break;
          }
        }
      }

      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: liveContent,
        toolCalls: liveTools.length > 0 ? liveTools : undefined,
        createdAt: new Date().toISOString(),
      }]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setMessages(prev => [...prev, {
        id: `e-${Date.now()}`,
        role: "assistant",
        content: `⚠️ Error: ${msg}`,
        createdAt: new Date().toISOString(),
      }]);
    } finally {
      setStreaming(false);
      setStreamingMsg(null);
    }
  }, [input, streaming, messages, apiKey]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const hasKey = !!apiKey;

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden relative">
      <MatrixBackground />

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
            onClick={e => e.target === e.currentTarget && setShowSettings(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="bg-black border border-white/15 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-lg">API Settings</h2>
                <button onClick={() => setShowSettings(false)} className="text-white/40 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-mono text-white/50 mb-2 block tracking-wider">OPENAI API KEY</label>
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={e => setApiKeyInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && saveApiKey()}
                    placeholder={hasKey ? "••••••••••••••••••••••••" : "sk-..."}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-white/25 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                  <p className="text-xs text-white/25 mt-2 font-mono">
                    Get your key at platform.openai.com. Stored locally in your browser.
                  </p>
                </div>

                {hasKey && (
                  <div className="flex items-center gap-2 p-3 rounded-xl border border-primary/20 bg-primary/5">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm text-primary/80 font-mono">API key saved</span>
                    <button
                      onClick={clearApiKey}
                      className="ml-auto text-xs text-red-400/70 hover:text-red-400 transition-colors font-mono"
                    >
                      remove
                    </button>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={saveApiKey}
                    disabled={!apiKeyInput.trim()}
                    className="flex-1 bg-primary text-black font-semibold py-2.5 rounded-xl text-sm disabled:opacity-40 transition-opacity hover:opacity-90"
                  >
                    Save Key
                  </button>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="flex-1 border border-white/15 text-white/60 font-medium py-2.5 rounded-xl text-sm hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 flex-col border-r border-white/8 bg-black/90 backdrop-blur-xl relative z-10">
          <div className="p-4 border-b border-white/8 flex items-center justify-between">
            <Link href="/dashboard" className="group flex items-center gap-2 text-white/50 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="font-bold text-base text-white tracking-wider">OUWIBO<span className="text-primary">_</span></span>
            </Link>
          </div>

          {/* Status */}
          <div className="p-4 border-b border-white/6 space-y-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${serverOk === true ? "bg-primary animate-pulse" : serverOk === false ? "bg-red-500" : "bg-yellow-500"}`} />
              <span className="text-xs font-mono text-white/40">
                {serverOk === true ? "BACKEND CONNECTED" : serverOk === false ? "BACKEND OFFLINE" : "CHECKING..."}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${hasKey ? "bg-primary animate-pulse" : "bg-red-500"}`} />
              <span className="text-xs font-mono text-white/40">
                {hasKey ? "API KEY SET" : "NO API KEY"}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="p-3 space-y-2">
            <button
              onClick={() => setShowSettings(true)}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/10 bg-white/3 text-white/60 hover:bg-white/8 hover:text-white transition-all text-sm font-medium"
            >
              <KeyRound className="w-4 h-4" />
              API Settings
            </button>
            <button
              onClick={() => { setMessages([]); setStreamingMsg(null); }}
              disabled={streaming}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400/60 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm font-medium disabled:opacity-30"
            >
              <Trash2 className="w-4 h-4" />
              Clear Chat
            </button>
          </div>

          {/* Quick tasks */}
          <div className="flex-1 overflow-y-auto p-3">
            <p className="text-[10px] font-mono text-white/25 px-2 py-1 tracking-widest mb-2">QUICK TASKS</p>
            <div className="space-y-1.5">
              {QUICK_TASKS.map((task, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(task)}
                  disabled={streaming}
                  className="w-full text-left px-3 py-2 rounded-lg border border-white/7 bg-white/2 text-xs text-white/40 hover:text-white/75 hover:bg-primary/8 hover:border-primary/25 transition-all font-mono leading-relaxed disabled:opacity-30"
                >
                  {task}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Chat area */}
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          {/* Header */}
          <header className="flex items-center gap-3 px-4 md:px-6 h-14 border-b border-white/8 bg-black/70 backdrop-blur-md shrink-0">
            <Link href="/" className="md:hidden flex items-center gap-1.5 text-white/40 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${streaming ? "bg-yellow-400 animate-pulse" : "bg-primary animate-pulse"}`} />
              <span className="font-mono text-sm text-white/60">
                {streaming ? "OUWIBO WORKING..." : "OUWIBO AGENT // READY"}
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {!hasKey && (
                <button
                  onClick={() => setShowSettings(true)}
                  className="text-xs font-mono text-yellow-400/80 border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 rounded-full hover:bg-yellow-400/15 transition-colors"
                >
                  Set API Key
                </button>
              )}
              <button
                onClick={() => setShowSettings(true)}
                className="md:hidden text-white/40 hover:text-white transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-5">
            {messages.length === 0 && !streamingMsg && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full text-center gap-5 py-12"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center">
                  <Bot className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">OUWIBO Agent</h2>
                  <p className="text-sm text-white/35 font-mono max-w-sm">
                    Give me any task — I'll use my tools to search the web, write code, browse pages, and create plans.
                  </p>
                </div>
                {!hasKey && (
                  <button
                    onClick={() => setShowSettings(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-yellow-400/30 bg-yellow-400/10 text-yellow-400 text-sm font-mono hover:bg-yellow-400/15 transition-colors"
                  >
                    <KeyRound className="w-4 h-4" />
                    Add your OpenAI API key to start
                  </button>
                )}
                {!serverOk && serverOk !== null && (
                  <div className="px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-mono max-w-sm">
                    ⚠️ Backend server is offline. Make sure the server workflow is running.
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full mt-2">
                  {QUICK_TASKS.slice(0, 4).map((task, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(task)}
                      disabled={streaming || !hasKey}
                      className="text-left text-xs text-white/40 border border-white/8 bg-white/2 hover:bg-primary/8 hover:border-primary/25 hover:text-white/70 rounded-xl px-3 py-2.5 transition-all font-mono leading-relaxed disabled:opacity-30"
                    >
                      {task}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}
            </AnimatePresence>

            {/* Streaming message */}
            {streamingMsg && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 justify-start"
              >
                <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                </div>
                <div className="max-w-[85%] md:max-w-[72%] space-y-2">
                  {streamingMsg.toolCalls.length > 0 && (
                    <div className="space-y-1.5">
                      {streamingMsg.toolCalls.map((tc) => <ToolCallCard key={tc.id} tc={tc} />)}
                    </div>
                  )}
                  {streamingMsg.content ? (
                    <div className="px-4 py-3 rounded-2xl rounded-bl-sm text-sm leading-relaxed bg-white/5 border border-white/10 text-white/90">
                      <pre className="whitespace-pre-wrap font-sans">{streamingMsg.content}</pre>
                      <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1 align-bottom" />
                    </div>
                  ) : streamingMsg.toolCalls.length === 0 ? (
                    <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white/5 border border-white/10 flex gap-1 items-center">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  ) : null}
                </div>
              </motion.div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 md:p-4 border-t border-white/8 bg-black/70 backdrop-blur-md shrink-0">
            <div className="flex gap-2 items-end max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  disabled={streaming || !hasKey}
                  placeholder={hasKey ? "Give the agent a task..." : "Add your OpenAI API key in settings to start..."}
                  rows={1}
                  className="w-full resize-none bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-primary/50 transition-colors font-mono disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ maxHeight: "120px", overflowY: "auto" }}
                  onInput={e => {
                    const t = e.target as HTMLTextAreaElement;
                    t.style.height = "auto";
                    t.style.height = Math.min(t.scrollHeight, 120) + "px";
                  }}
                />
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || streaming || !hasKey}
                className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center text-black disabled:opacity-30 hover:scale-105 active:scale-95 transition-all duration-200 shadow-[0_0_16px_rgba(0,255,65,0.3)] hover:shadow-[0_0_24px_rgba(0,255,65,0.5)] shrink-0"
              >
                {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-center text-[10px] text-white/15 mt-2 font-mono">
              ENTER to send · SHIFT+ENTER for new line · OUWIBO AGENT · GPT-4o-mini
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
