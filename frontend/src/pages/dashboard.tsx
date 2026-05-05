import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Activity, Terminal, Users, Network, Settings, LogOut, Server, Menu, X, Bot } from "lucide-react";
import { MatrixBackground } from "@/components/matrix-background";

const agents = [
  { id: "AGENT-7", status: "ACTIVE", task: "Analyzing node patterns", load: 87 },
  { id: "NEXUS-1", status: "PROCESSING", task: "Decrypting payload", load: 94 },
  { id: "CIPHER-3", status: "IDLE", task: "Awaiting command", load: 12 },
  { id: "GHOST-9", status: "ACTIVE", task: "Network mapping", load: 65 },
];

const mockLogs = [
  "[SYS] Connection established on port 443",
  "[SEC] Firewall neural net updated",
  "[AGT] AGENT-7 deployed to sector 4",
  "[SYS] Memory allocation optimized",
  "[NET] Handshake with external node successful",
  "[ERR] Warning: Packet drop detected (resolved)",
  "[AGT] NEXUS-1 processing hash collision",
  "[SYS] All systems nominal.",
];

const navItems = [
  { icon: Terminal, label: "Terminal", active: true },
  { icon: Users, label: "Agents" },
  { icon: Network, label: "Network" },
  { icon: Activity, label: "Logs" },
  { icon: Settings, label: "Settings" },
];

export default function Dashboard() {
  const [logs, setLogs] = useState<string[]>(mockLogs.slice(0, 3));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs((prev) => {
        const nextLog = mockLogs[Math.floor(Math.random() * mockLogs.length)];
        const newLogs = [...prev, `[${new Date().toLocaleTimeString()}] ${nextLog}`];
        if (newLogs.length > 8) newLogs.shift();
        return newLogs;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-primary overflow-hidden flex selection:bg-primary selection:text-black">
      <MatrixBackground />
      <div className="scanline" />

      {/* Mobile overlay */}
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

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative inset-y-0 left-0 z-30 md:z-20
          w-64 border-r border-primary/20 bg-black/95 backdrop-blur-md flex flex-col
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="p-5 border-b border-primary/20 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white tracking-widest drop-shadow-[0_0_5px_rgba(0,255,65,0.8)]">
            OUWIBO<span className="text-primary animate-pulse">_</span>
          </h2>
          <button
            className="md:hidden text-primary/60 hover:text-primary transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item, i) => (
            <button
              key={i}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-left font-medium text-sm ${
                item.active
                  ? "bg-primary/20 text-white shadow-[inset_0_0_0_1px_rgba(0,255,65,0.3)]"
                  : "hover:bg-primary/10 text-primary/60 hover:text-primary"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}

          <div className="pt-2 border-t border-primary/10 mt-2">
            <Link
              href="/agent"
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-left font-medium text-sm hover:bg-primary/10 text-primary/60 hover:text-primary"
            >
              <Bot className="w-4 h-4" />
              <span>AI Agent</span>
              <span className="ml-auto text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-md">LIVE</span>
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-primary/20">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-primary/50 hover:text-primary hover:bg-primary/10 transition-all duration-200 w-full text-left text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Disconnect</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 h-screen overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="h-14 md:h-16 border-b border-primary/20 bg-black/60 backdrop-blur-md flex items-center justify-between px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-primary/60 hover:text-primary transition-colors mr-1"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <Server className="w-4 h-4 hidden sm:block" />
            <span className="font-bold tracking-widest text-sm">SYSTEM_CORE_V9</span>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Link
              href="/agent"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/15 border border-primary/30 text-primary text-xs font-medium hover:bg-primary/25 transition-all duration-200"
            >
              <Bot className="w-3 h-3" />
              <span className="hidden sm:inline">Launch Agent</span>
              <span className="sm:hidden">Agent</span>
            </Link>
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/30 text-xs rounded-xl">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="tracking-wider hidden sm:inline">ONLINE // NOMINAL</span>
              <span className="tracking-wider sm:hidden">ONLINE</span>
            </div>
          </div>
        </header>

        <div className="flex-1 p-3 md:p-6 overflow-y-auto space-y-4 md:space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { label: "TASKS PROCESSED", val: "14,892" },
              { label: "ACTIVE AGENTS", val: "12 / 16" },
              { label: "SUCCESS RATE", val: "99.8%" },
              { label: "UPTIME", val: "342:12:04" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-black/40 border border-primary/20 p-3 md:p-4 relative overflow-hidden group hover:border-primary/50 transition-colors rounded-xl md:rounded-none"
              >
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Activity className="w-8 h-8" />
                </div>
                <div className="text-xs text-primary/60 mb-1 truncate">{stat.label}</div>
                <div className="text-lg md:text-2xl font-bold text-white">{stat.val}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Active Agents */}
            <div className="lg:col-span-2 flex flex-col border border-primary/20 bg-black/40 backdrop-blur-sm rounded-xl md:rounded-none">
              <div className="p-3 border-b border-primary/20 bg-primary/5 font-bold tracking-widest flex items-center justify-between text-sm">
                <span>&gt; ACTIVE_AGENTS</span>
                <span className="text-xs text-primary/50">4 DEPLOYED</span>
              </div>
              <div className="p-3 md:p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <AnimatePresence>
                  {agents.map((agent, i) => (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.15 }}
                      className="border border-primary/20 p-3 md:p-4 bg-black/60 relative rounded-xl md:rounded-none"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="font-bold text-white text-sm">{agent.id}</div>
                        <div
                          className={`text-xs px-2 py-0.5 border rounded-full md:rounded-none ${
                            agent.status === "ACTIVE"
                              ? "border-primary text-primary"
                              : agent.status === "PROCESSING"
                              ? "border-cyan-400 text-cyan-400"
                              : "border-primary/40 text-primary/40"
                          }`}
                        >
                          {agent.status}
                        </div>
                      </div>
                      <div className="text-xs text-primary/70 mb-3">{agent.task}</div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>SYS_LOAD</span>
                          <span>{agent.load}%</span>
                        </div>
                        <div className="h-1 w-full bg-primary/10 rounded-full">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${agent.load}%` }}
                            className={`h-full rounded-full ${agent.load > 80 ? "bg-red-500" : "bg-primary"}`}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Terminal Log */}
            <div className="flex flex-col border border-primary/20 bg-black/40 backdrop-blur-sm min-h-48 lg:min-h-0 rounded-xl md:rounded-none">
              <div className="p-3 border-b border-primary/20 bg-primary/5 font-bold tracking-widest text-sm">
                <span>&gt; SYS_LOGS</span>
              </div>
              <div className="flex-1 p-3 md:p-4 overflow-y-auto text-xs space-y-2 flex flex-col justify-end font-mono">
                <AnimatePresence initial={false}>
                  {logs.map((log, i) => (
                    <motion.div
                      key={log + i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`${
                        log.includes("[ERR]")
                          ? "text-red-500"
                          : log.includes("[SEC]")
                          ? "text-cyan-400"
                          : "text-primary/80"
                      }`}
                    >
                      {log}
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div className="flex items-center gap-2 mt-2 text-white animate-pulse">
                  <span>&gt;</span>
                  <div className="w-2 h-4 bg-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Waveform visualization */}
          <div className="h-24 md:h-32 border border-primary/20 bg-black/40 p-3 md:p-4 flex flex-col justify-between rounded-xl md:rounded-none">
            <div className="text-xs text-primary/50 font-mono">NETWORK_THROUGHPUT</div>
            <div className="flex items-end gap-px h-16 opacity-60">
              {Array.from({ length: 60 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: ["20%", "80%", "30%", "100%", "40%"][Math.floor(Math.random() * 5)],
                  }}
                  transition={{
                    duration: 1.5 + Math.random() * 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  className="flex-1 bg-primary rounded-t-sm"
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
