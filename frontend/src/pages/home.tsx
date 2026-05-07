import { motion } from "framer-motion";
import { Link } from "wouter";
import { MatrixBackground } from "@/components/matrix-background";
import { Globe, Code2, Zap, ArrowRight, Bot, Search, ListTodo, LayoutDashboard } from "lucide-react";

const capabilities = [
  { icon: Search, title: "Web Search", desc: "Searches the internet in real-time to gather up-to-date information on any topic.", tag: "TOOL" },
  { icon: Code2, title: "Code Writing", desc: "Writes, debugs and explains code in any language — Python, JS, Rust, and more.", tag: "TOOL" },
  { icon: Globe, title: "Browse URLs", desc: "Visits websites and extracts relevant information to complete your task.", tag: "TOOL" },
  { icon: ListTodo, title: "Task Planning", desc: "Breaks complex goals into detailed, actionable step-by-step plans.", tag: "TOOL" },
];

const examples = [
  "Research the latest AI trends and write a summary report",
  "Build me a Python web scraper for product prices",
  "Create a 30-day learning plan for machine learning",
  "Find the top 5 competitors of Tesla and analyze them",
  "Write a REST API in Node.js with authentication",
  "Explain how transformer models work with code examples",
];

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const rise = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function Home() {
  return (
    <div className="relative bg-black overflow-x-hidden selection:bg-primary selection:text-black text-white">
      <MatrixBackground />
      <div className="scanline" />

      {/* HERO */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(0,255,65,0.07) 0%, transparent 70%)" }}
        />

        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/8 backdrop-blur-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[11px] font-mono text-primary tracking-[0.18em] font-medium">
            AUTONOMOUS INTELLIGENCE ONLINE
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-3 flex flex-col items-center"
        >
          <div className="mb-4 relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl scale-150 animate-pulse" />
            <img
              src="/logo.png"
              alt="OUWIBO Agent"
              className="relative w-28 h-28 rounded-full object-cover border-2 border-primary/40 shadow-[0_0_32px_rgba(0,255,65,0.35)]"
              style={{ objectPosition: "center 15%" }}
            />
          </div>
          <h1
            className="glitch-text font-bold leading-none select-none"
            style={{
              fontFamily: "var(--app-font-display)",
              fontSize: "clamp(3rem, 16vw, 9rem)",
              letterSpacing: "-0.025em",
              textShadow: "0 0 60px rgba(0,255,65,0.3)",
            }}
          >
            OUWIBO
          </h1>
          <p
            className="font-mono text-primary/60 tracking-[0.35em] text-sm mt-1"
          >
            AGENT
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.3, ease: "easeOut" }}
          className="text-white/45 mb-8 max-w-md leading-relaxed"
          style={{ fontSize: "clamp(0.9rem, 1.6vw, 1.1rem)" }}
        >
          Give it any task — it searches the web, writes code, browses pages,
          and creates plans to get things done autonomously.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.5, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <Link
            href="/dashboard"
            className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-primary px-8 py-[14px] font-semibold text-black transition-all duration-300 hover:scale-[1.04] active:scale-[0.97] hover:shadow-[0_0_52px_rgba(0,255,65,0.65)] w-full sm:w-auto justify-center"
            style={{ fontFamily: "var(--app-font-sans)", fontSize: "0.9375rem", letterSpacing: "-0.01em" }}
          >
            <LayoutDashboard className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Open Dashboard</span>
            <ArrowRight className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            <span className="absolute inset-0 bg-white/15 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-full" />
          </Link>

          <Link
            href="/agent"
            className="group inline-flex items-center gap-2.5 rounded-full border border-white/12 bg-white/4 px-8 py-[14px] font-medium text-white/75 backdrop-blur-sm transition-all duration-300 hover:border-primary/45 hover:bg-primary/10 hover:text-white active:scale-[0.97] w-full sm:w-auto justify-center"
            style={{ fontFamily: "var(--app-font-sans)", fontSize: "0.9375rem", letterSpacing: "-0.01em" }}
          >
            <Bot className="w-4 h-4 text-primary" />
            <span>Try AI Agent</span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 hidden md:flex"
        >
          <span className="text-[10px] text-white/20 font-mono tracking-[0.25em]">SCROLL</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-7 bg-gradient-to-b from-primary/40 to-transparent"
          />
        </motion.div>
      </section>

      {/* CAPABILITIES */}
      <section className="relative z-10 py-24 px-6 max-w-6xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
          <motion.div variants={rise} className="flex items-center gap-3 mb-4">
            <div className="h-px w-7 bg-primary/50" />
            <span className="text-[11px] font-mono text-primary/60 tracking-[0.25em]">BUILT-IN TOOLS</span>
          </motion.div>

          <motion.h2
            variants={rise}
            className="mb-12 text-white leading-tight font-bold"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "-0.03em" }}
          >
            What OUWIBO can do
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {capabilities.map((cap, i) => (
              <motion.div
                key={i}
                variants={rise}
                className="group relative p-6 rounded-2xl border border-white/7 bg-white/2 hover:border-primary/35 hover:bg-primary/5 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/4 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-10 h-10 rounded-xl bg-primary/12 border border-primary/18 flex items-center justify-center group-hover:bg-primary/22 transition-colors duration-300">
                      <cap.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-[10px] font-mono text-primary/35 tracking-[0.2em]">{cap.tag}</span>
                  </div>
                  <h3 className="text-white mb-2 font-semibold text-base">{cap.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{cap.desc}</p>
                </div>
                <div className="absolute bottom-0 left-0 h-px w-0 bg-primary group-hover:w-full transition-all duration-700 ease-out" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* EXAMPLES */}
      <section className="relative z-10 py-16 px-6 max-w-4xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.div variants={rise} className="flex items-center gap-3 mb-4">
            <div className="h-px w-7 bg-primary/50" />
            <span className="text-[11px] font-mono text-primary/60 tracking-[0.25em]">EXAMPLE TASKS</span>
          </motion.div>
          <motion.h2
            variants={rise}
            className="mb-8 text-white font-bold leading-tight"
            style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", letterSpacing: "-0.03em" }}
          >
            Try asking OUWIBO...
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {examples.map((ex, i) => (
              <motion.div key={i} variants={rise}>
                <Link
                  href="/agent"
                  className="group flex items-start gap-3 p-4 rounded-xl border border-white/8 bg-white/2 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 text-left w-full"
                >
                  <Zap className="w-4 h-4 text-primary/60 group-hover:text-primary transition-colors mt-0.5 shrink-0" />
                  <span className="text-sm text-white/50 group-hover:text-white/80 transition-colors leading-relaxed">{ex}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-32 px-6 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,255,65,0.055) 0%, transparent 70%)" }}
        />
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-2xl mx-auto text-center"
        >
          <h2
            className="text-white mb-4 leading-tight font-bold"
            style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)", letterSpacing: "-0.03em" }}
          >
            Ready to connect?
          </h2>
          <p className="text-white/35 mb-8 leading-relaxed text-base">
            Access the full power of OUWIBO — one command away.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-primary px-9 py-[15px] font-semibold text-black transition-all duration-300 hover:scale-[1.04] active:scale-[0.97] hover:shadow-[0_0_60px_rgba(0,255,65,0.6)] w-full sm:w-auto justify-center"
              style={{ fontSize: "1rem" }}
            >
              <LayoutDashboard className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Open Dashboard</span>
              <ArrowRight className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              <span className="absolute inset-0 bg-white/15 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-full" />
            </Link>
            <Link
              href="/agent"
              className="group inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-transparent px-9 py-[15px] font-medium text-white/65 transition-all duration-300 hover:border-primary/45 hover:text-white hover:bg-primary/8 active:scale-[0.97] w-full sm:w-auto justify-center"
              style={{ fontSize: "1rem" }}
            >
              <Bot className="w-4 h-4 text-primary" />
              <span>Talk to Agent</span>
            </Link>
          </div>
        </motion.div>
      </section>

      <footer className="relative z-10 py-8 px-6 border-t border-white/6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-white/25 font-mono text-xs tracking-widest">OUWIBO AGENT © 2026</span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-primary/40 font-mono text-xs tracking-wider">ALL SYSTEMS NOMINAL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
