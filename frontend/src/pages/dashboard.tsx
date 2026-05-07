import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  Activity, Terminal, Settings, LogOut,
  Server, Menu, X, Bot, Search, Code2, Globe, ListTodo,
  LayoutDashboard, Zap, CheckCircle2, Clock, TrendingUp, Cpu
} from "lucide-react";
import { MatrixBackground } from "@/components/matrix-background";
import { fetchLiveStats } from "@/lib/live-stats";

const agents = [
  { id: "OUWIBO-1", status: "ACTIVE", task: "Researching AI trends", load: 72, tool: "search_web" },
  { id: "OUWIBO-2", status: "PROCESSING", task: "Writing Python scraper", load: 91, tool: "write_code" },
  { id: "OUWIBO-3", status: "IDLE", task: "Awaiting command", load: 8, tool: null },
  { id: "OUWIBO-4", status: "ACTIVE", task: "Browsing research papers", load: 55, tool: "browse_url" },
];

const TOOL_ICONS: Record<string, React.ElementType> = {
  search_web: Search,
  write_code: Code2,
  browse_url: Globe,
  create_plan: ListTodo,
};

const TOOL_COLORS: Record<string, string> = {
  search_web: "text-blue-400",
  write_code: "text-yellow-400",
  browse_url: "text-purple-400",
  create_plan: "text-green-400",
};

const mockLogs = [
  "[AGENT] OUWIBO-1 completed web search in 1.2s",
  "[SYS] Backend API connected · port 3001",
  "[TOOL] Code written: 142 lines of Python",
  "[AGENT] OUWIBO-4 browsing arxiv.org/ai",
  "[SYS] Memory usage optimized · 34% freed",
  "[TOOL] Plan created: 12-step task breakdown",
  "[AGENT] OUWIBO-2 processing code review",
  "[SYS] All systems nominal · uptime 342h",
  "[NET] Streaming response received · 98ms",
  "[TOOL] Search result cached · 4 sources",
];

const quickActions = [
  { icon: Search, label: "Web Search", desc: "Research any topic", href: "/agent", color: "border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10" },
  { icon: Code2, label: "Write Code", desc: "Generate or debug code", href: "/agent", color: "border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10" },
  { icon: Globe, label: "Browse URL", desc: "Extract web content", href: "/agent", color: "border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10" },
  { icon: ListTodo, label: "Create Plan", desc: "Break down any goal", href: "/agent", color: "border-green-500/30 bg-green-500/5 hover:bg-green-500/10" },
];

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", active: true },
  { icon: Bot, label: "AI Agent", href: "/agent", active: false },
  { icon: Activity, label: "Activity", href: "/dashboard", active: false },
  { icon: Settings, label: "Settings", href: "/dashboard", active: false },
];

type LiveStats = {
  ok: boolean;
  uptimeSec?: number;
  requestsHandled?: number;
  serverKeys?: Record<string, boolean>;
  availableProviders?: string[];
};

function formatUptime(totalSec: number) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const sec = totalSec % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function Dashboard() {
  const [logs, setLogs] = useState<string[]>(mockLogs.slice(0, 4));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [live, setLive] = useState<LiveStats | null>(null);
  const [apiHealth, setApiHealth] = useState<LiveStats | null>(null);

  useEffect(() => {
    const tick = () => {
      setLogs(prev => {
        const nextLog = mockLogs[Math.floor(Math.random() * mockLogs.length)];
        const ts = new Date().toLocaleTimeString();
        return [...prev, `[${ts}] ${nextLog}`].slice(-8);
      });
    };
    const logInterval = setInterval(tick, 2800);
    return () => clearInterval(logInterval);
  }, []);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const data = await fetchLiveStats();
        if (alive) {
          setLive(data);
          setApiHealth(data);
        }
      } catch {
        if (alive) setApiHealth({ ok: false });
      }
    };
    load();
    const id = setInterval(load, 10000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const uptimeLabel = useMemo(() => {
    const sec = live?.uptimeSec ?? 0;
    return formatUptime(sec);
  }, [live]);

  const tasksDone = live?.requestsHandled ?? logs.length;
  const backendKeyState = live?.serverKeys ?? {};
  const backendOk = apiHealth?.ok ?? false;

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden flex selection:bg-primary selection:text-black">
      <MatrixBackground />
      <div className="scanline" />

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed md:relative inset-y-0 left-0 z-30 md:z-20 w-64 border-r border-primary/20 bg-black/95 backdrop-blur-md flex flex-col transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="p-5 border-b border-primary/20 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2.5 cursor-pointer group">
              <img src="/logo.png" alt="OUWIBO" className="w-8 h-8 rounded-full object-cover border border-primary/40 shadow-[0_0_10px_rgba(0,255,65,0.3)]" style={{ objectPosition: "center 15%" }} />
              <h2 className="text-xl font-bold text-white tracking-widest drop-shadow-[0_0_5px_rgba(0,255,65,0.8)] group-hover:text-primary transition-colors">
                OUWIBO<span className="text-primary animate-pulse">_</span>
              </h2>
            </div>
          </Link>
          <button className="md:hidden text-primary/60 hover:text-primary transition-colors" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item, i) => (
            <Link key={i} href={item.href}>
              <button className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-left font-medium text-sm ${item.active ? "bg-primary/15 text-primary border border-primary/25" : "hover:bg-white/5 text-white/40 hover:text-white"}`}>
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.label === "AI Agent" && <span className="ml-auto text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-md font-mono">LIVE</span>}
              </button>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-primary/15 space-y-2">
          <p className="text-[10px] font-mono text-white/25 tracking-widest mb-3">SYSTEM STATUS</p>
          {[
            { label: "Backend API", ok: backendOk },
            { label: "OpenAI API", ok: !!backendKeyState.openai },
            { label: "Groq API", ok: !!backendKeyState.groq },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${s.ok ? "bg-primary animate-pulse" : "bg-red-500"}`} />
              <span className="text-xs font-mono text-white/35">{s.label}</span>
              <span className={`ml-auto text-[10px] font-mono ${s.ok ? "text-primary/50" : "text-red-500/50"}`}>{s.ok ? "OK" : "ERR"}</span>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-primary/15">
          <Link href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/30 hover:text-white hover:bg-white/5 transition-all duration-200 w-full text-left text-sm font-medium">
            <LogOut className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative z-10 h-screen overflow-hidden min-w-0">
        <header className="h-14 border-b border-primary/15 bg-black/60 backdrop-blur-md flex items-center justify-between px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-primary/60 hover:text-primary transition-colors" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <Server className="w-4 h-4 text-primary/40 hidden sm:block" />
            <span className="font-mono font-bold tracking-widest text-sm text-white/70">OUWIBO_DASHBOARD</span>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Link href="/agent" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/15 border border-primary/30 text-primary text-xs font-medium hover:bg-primary/25 transition-all">
              <Bot className="w-3 h-3" />
              <span className="hidden sm:inline">Launch Agent</span>
              <span className="sm:hidden">Agent</span>
            </Link>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/8 border border-primary/20 text-xs rounded-xl font-mono">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-primary/70 hidden sm:inline">ONLINE</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: CheckCircle2, label: "TASKS DONE", val: tasksDone.toLocaleString(), color: "text-primary" },
              { icon: Cpu, label: "ACTIVE AGENTS", val: `${agents.filter(a => a.status !== "IDLE").length} / ${agents.length}`, color: "text-blue-400" },
              { icon: TrendingUp, label: "SUCCESS RATE", val: backendOk ? "99.8%" : "—", color: "text-green-400" },
              { icon: Clock, label: "UPTIME", val: uptimeLabel, color: "text-yellow-400" },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="bg-black/50 border border-white/8 p-4 rounded-xl hover:border-primary/25 transition-colors relative overflow-hidden group">
                <div className="absolute top-3 right-3 opacity-10 group-hover:opacity-20 transition-opacity"><stat.icon className={`w-7 h-7 ${stat.color}`} /></div>
                <div className="text-[10px] font-mono text-white/30 mb-1 tracking-wider">{stat.label}</div>
                <div className={`text-xl md:text-2xl font-bold font-mono ${stat.color}`}>{stat.val}</div>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="border border-white/8 bg-black/40 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/8 bg-white/[0.02] flex items-center justify-between">
              <span className="font-mono font-bold text-sm text-white/70 tracking-wider">&gt; QUICK_ACTIONS</span>
              <Zap className="w-4 h-4 text-primary/40" />
            </div>
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickActions.map((action, i) => (
                <Link key={i} href={action.href}>
                  <button className={`w-full p-4 rounded-xl border text-left transition-all duration-200 group ${action.color}`}>
                    <action.icon className="w-5 h-5 text-white/50 group-hover:text-white transition-colors mb-2" />
                    <div className="font-semibold text-sm text-white/80 group-hover:text-white transition-colors">{action.label}</div>
                    <div className="text-[11px] text-white/30 mt-0.5">{action.desc}</div>
                  </button>
                </Link>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="lg:col-span-2 border border-white/8 bg-black/40 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/8 bg-white/[0.02] flex items-center justify-between">
                <span className="font-mono font-bold text-sm text-white/70 tracking-wider">&gt; ACTIVE_AGENTS</span>
                <span className="text-[10px] font-mono text-white/30">{agents.filter(a => a.status !== "IDLE").length} RUNNING</span>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {agents.map((agent, i) => {
                  const ToolIcon = agent.tool ? TOOL_ICONS[agent.tool] : null;
                  const toolColor = agent.tool ? TOOL_COLORS[agent.tool] : "";
                  return (
                    <motion.div key={agent.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.1 }} className="border border-white/8 bg-black/60 p-4 rounded-xl hover:border-primary/20 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">{ToolIcon && <ToolIcon className={`w-3.5 h-3.5 ${toolColor}`} />}<span className="font-mono font-bold text-sm text-white">{agent.id}</span></div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${agent.status === "ACTIVE" ? "border-primary/50 text-primary bg-primary/10" : agent.status === "PROCESSING" ? "border-blue-400/50 text-blue-400 bg-blue-400/10" : "border-white/15 text-white/30"}`}>{agent.status}</span>
                      </div>
                      <div className="text-xs text-white/40 mb-3 font-mono">{agent.task}</div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-mono text-white/30"><span>CPU LOAD</span><span className={agent.load > 80 ? "text-red-400" : "text-primary/60"}>{agent.load}%</span></div>
                        <div className="h-1 w-full bg-white/8 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${agent.load}%` }} transition={{ duration: 1, ease: "easeOut", delay: 0.6 + i * 0.1 }} className={`h-full rounded-full ${agent.load > 80 ? "bg-red-500" : "bg-primary"}`} /></div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="border border-white/8 bg-black/40 rounded-xl overflow-hidden flex flex-col min-h-56 lg:min-h-0">
              <div className="px-4 py-3 border-b border-white/8 bg-white/[0.02] flex items-center justify-between">
                <span className="font-mono font-bold text-sm text-white/70 tracking-wider">&gt; SYS_LOGS</span>
                <Terminal className="w-3.5 h-3.5 text-white/20" />
              </div>
              <div className="flex-1 p-3 overflow-y-auto text-[11px] space-y-1.5 flex flex-col justify-end font-mono">
                <AnimatePresence initial={false}>
                  {logs.map((log, i) => (
                    <motion.div key={log + i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className={log.includes("[SYS]") ? "text-primary/60" : log.includes("[TOOL]") ? "text-blue-400/70" : log.includes("[AGENT]") ? "text-white/50" : log.includes("[NET]") ? "text-purple-400/70" : "text-white/30"}>
                      {log}
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div className="flex items-center gap-1.5 mt-1 text-primary/40"><span>&gt;</span><div className="w-1.5 h-3.5 bg-primary/60 animate-pulse" /></div>
              </div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="border border-white/8 bg-black/40 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs text-white/30 tracking-wider">NETWORK_THROUGHPUT</span>
              <span className="font-mono text-xs text-primary/40">LIVE</span>
            </div>
            <div className="flex items-end gap-px h-14">
              {Array.from({ length: 64 }).map((_, i) => (
                <motion.div key={i} animate={{ height: ["15%", "85%", "25%", "100%", "45%", "60%"][Math.floor(Math.random() * 6)] }} transition={{ duration: 1.2 + Math.random() * 2, repeat: Infinity, repeatType: "reverse", delay: Math.random() * 2 }} className="flex-1 bg-primary/50 rounded-t-sm" />
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
