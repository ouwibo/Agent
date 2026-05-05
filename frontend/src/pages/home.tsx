import { motion } from "framer-motion";
import { Link } from "wouter";
import { MatrixBackground } from "@/components/matrix-background";
import { Shield, Terminal, Cpu, Zap, ArrowRight, Bot } from "lucide-react";

const features = [
  { icon: Terminal, title: "System Access", desc: "Full shell immersion with raw data streaming across every node.", tag: "CORE" },
  { icon: Shield, title: "Cyber Defense", desc: "Military-grade neural encryption protocols running 24/7.", tag: "SECURITY" },
  { icon: Cpu, title: "Neural Compute", desc: "Unmatched processing power distributed across global clusters.", tag: "ENGINE" },
  { icon: Zap, title: "Overdrive", desc: "Hyper-threaded execution for fully autonomous task handling.", tag: "SPEED" },
];

const stats = [
  { val: "9,420", label: "Active Nodes" },
  { val: "99.99%", label: "Uptime" },
  { val: "1.2M", label: "Cycles / sec" },
  { val: "0", label: "Threats Detected" },
];

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};
const rise = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export default function Home() {
  return (
    <div className="relative bg-black overflow-x-hidden selection:bg-primary selection:text-black text-white">
      <MatrixBackground />
      <div className="scanline" />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(0,255,65,0.07) 0%, transparent 70%)",
          }}
        />

        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/8 backdrop-blur-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[11px] font-mono text-primary tracking-[0.18em] font-medium">
            AUTONOMOUS INTELLIGENCE ONLINE
          </span>
        </motion.div>

        {/* Logotype */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="glitch-text font-bold leading-none select-none mb-5"
          style={{
            fontFamily: "var(--app-font-display)",
            fontSize: "clamp(4.5rem, 22vw, 13rem)",
            letterSpacing: "-0.025em",
            textShadow: "0 0 60px rgba(0,255,65,0.3)",
          }}
        >
          OUWIBO
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.35, ease: "easeOut" }}
          className="text-white/45 mb-9 max-w-xs sm:max-w-md leading-relaxed"
          style={{
            fontFamily: "var(--app-font-sans)",
            fontSize: "clamp(0.875rem, 1.6vw, 1.0625rem)",
          }}
        >
          The next-generation AI agent OS — built for people who think in systems.
          Autonomous. Precise. Relentless.
        </motion.p>

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.55, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <Link
            href="/dashboard"
            className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-primary px-8 py-[14px] font-semibold text-black transition-all duration-300 hover:scale-[1.04] active:scale-[0.97] hover:shadow-[0_0_52px_rgba(0,255,65,0.65)] w-full sm:w-auto justify-center"
            style={{ fontFamily: "var(--app-font-sans)", fontSize: "0.9375rem", letterSpacing: "-0.01em" }}
          >
            <span className="relative z-10">Launch App</span>
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

        {/* Scroll cue — desktop only */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
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

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section className="relative z-10 py-28 px-6 max-w-7xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
          <motion.div variants={rise} className="flex items-center gap-3 mb-5">
            <div className="h-px w-7 bg-primary/50" />
            <span className="text-[11px] font-mono text-primary/60 tracking-[0.25em]">CAPABILITIES</span>
          </motion.div>

          <motion.h2
            variants={rise}
            className="mb-16 text-white leading-tight"
            style={{
              fontFamily: "var(--app-font-display)",
              fontSize: "clamp(2.25rem, 5.5vw, 4.5rem)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
            }}
          >
            Built for the future.
            <br />
            <span className="text-primary">Deployed today.</span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                variants={rise}
                className="group relative p-6 rounded-2xl border border-white/7 bg-white/2 hover:border-primary/35 hover:bg-primary/5 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/4 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-10 h-10 rounded-xl bg-primary/12 border border-primary/18 flex items-center justify-center group-hover:bg-primary/22 transition-colors duration-300">
                      <f.icon className="w-4.5 h-4.5 text-primary" style={{ width: 18, height: 18 }} />
                    </div>
                    <span className="text-[10px] font-mono text-primary/35 tracking-[0.2em]">{f.tag}</span>
                  </div>
                  <h3
                    className="text-white mb-2.5"
                    style={{ fontFamily: "var(--app-font-display)", fontSize: "1.0625rem", fontWeight: 600, letterSpacing: "-0.01em" }}
                  >
                    {f.title}
                  </h3>
                  <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
                </div>
                <div className="absolute bottom-0 left-0 h-px w-0 bg-primary group-hover:w-full transition-all duration-700 ease-out" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────── */}
      <section className="relative z-10 border-y border-white/6 bg-white/[0.015]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/6"
        >
          {stats.map((s, i) => (
            <motion.div key={i} variants={rise} className="flex flex-col items-center justify-center py-14 px-6 text-center">
              <div
                className="text-white mb-1.5"
                style={{
                  fontFamily: "var(--app-font-display)",
                  fontSize: "clamp(2rem, 4.5vw, 3.75rem)",
                  fontWeight: 700,
                  letterSpacing: "-0.04em",
                  textShadow: "0 0 36px rgba(0,255,65,0.4)",
                }}
              >
                {s.val}
              </div>
              <div className="text-white/30 text-[11px] font-mono tracking-[0.2em] uppercase">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────── */}
      <section className="relative z-10 py-36 px-6 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,255,65,0.055) 0%, transparent 70%)" }}
        />
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-3xl mx-auto text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-7">
            <div className="h-px flex-1 max-w-14 bg-primary/25" />
            <span className="text-[11px] font-mono text-primary/50 tracking-[0.25em]">INITIALIZE</span>
            <div className="h-px flex-1 max-w-14 bg-primary/25" />
          </div>

          <h2
            className="text-white mb-5 leading-tight"
            style={{
              fontFamily: "var(--app-font-display)",
              fontSize: "clamp(2.5rem, 6.5vw, 5rem)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
            }}
          >
            Ready to connect?
          </h2>

          <p className="text-white/35 mb-10 leading-relaxed max-w-sm mx-auto" style={{ fontSize: "1.0625rem" }}>
            Access the full power of OUWIBO — one command away.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-primary px-9 py-[15px] font-semibold text-black transition-all duration-300 hover:scale-[1.04] active:scale-[0.97] hover:shadow-[0_0_60px_rgba(0,255,65,0.6)] w-full sm:w-auto justify-center"
              style={{ fontFamily: "var(--app-font-sans)", fontSize: "1rem", letterSpacing: "-0.01em" }}
            >
              <span className="relative z-10">Open Dashboard</span>
              <ArrowRight className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              <span className="absolute inset-0 bg-white/15 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-full" />
            </Link>
            <Link
              href="/agent"
              className="group inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-transparent px-9 py-[15px] font-medium text-white/65 transition-all duration-300 hover:border-primary/45 hover:text-white hover:bg-primary/8 active:scale-[0.97] w-full sm:w-auto justify-center"
              style={{ fontFamily: "var(--app-font-sans)", fontSize: "1rem", letterSpacing: "-0.01em" }}
            >
              <Bot className="w-4 h-4 text-primary" />
              <span>Talk to Agent</span>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer className="relative z-10 py-8 px-6 border-t border-white/6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-white/25 font-mono text-xs tracking-widest">OUWIBO © 2026</span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-primary/40 font-mono text-xs tracking-wider">ALL SYSTEMS NOMINAL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
