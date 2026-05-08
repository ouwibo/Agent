import { motion } from "framer-motion";
import { Link } from "wouter";
import { MatrixBackground } from "@/components/matrix-background";
import { Bitcoin, TrendingUp, BarChart3, Zap, ArrowRight, Bot } from "lucide-react";

const features = [
  { icon: TrendingUp, title: "Market Analysis", desc: "Real-time crypto price analysis and trend prediction" },
  { icon: BarChart3, title: "DeFi Insights", desc: "Yield farming, liquidity pools, and protocol analysis" },
  { icon: Zap, title: "Trading Signals", desc: "AI-powered entry/exit points and risk assessment" },
  { icon: Bitcoin, title: "Token Research", desc: "Fundamental analysis and tokenomics evaluation" },
];

const examples = [
  "Analyze BTC price trend for next week",
  "Compare ETH vs SOL performance",
  "Top DeFi protocols by TVL",
  "Market sentiment analysis today",
  "Best yield farming opportunities",
  "Explain Uniswap v4 hooks",
];

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const rise = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Home() {
  return (
    <div className="relative bg-black overflow-x-hidden text-white">
      <MatrixBackground />

      {/* Hero */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(0,255,65,0.08) 0%, transparent 70%)" }}
        />

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[11px] font-mono text-primary tracking-[0.2em] font-medium">
            CRYPTO AI AGENT ONLINE
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-4"
        >
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Bitcoin className="w-10 h-10 text-primary" />
          </div>
          <h1
            className="font-bold leading-none"
            style={{ fontSize: "clamp(2.5rem, 12vw, 7rem)", letterSpacing: "-0.02em" }}
          >
            OUWIBO
          </h1>
          <p className="font-mono text-primary/60 tracking-[0.3em] text-sm mt-1">CRYPTO AGENT</p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-white/45 mb-8 max-w-md leading-relaxed"
        >
          AI-powered cryptocurrency analysis. Market trends, DeFi protocols, trading signals, and blockchain insights.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-black font-semibold hover:opacity-90 transition-opacity"
          >
            Open Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/agent"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-white/15 bg-white/5 text-white/80 hover:bg-white/10 transition-colors"
          >
            <Bot className="w-4 h-4 text-primary" />
            Try AI Agent
          </Link>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-24 px-6 max-w-6xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.div variants={rise} className="flex items-center gap-3 mb-4">
            <div className="h-px w-7 bg-primary/50" />
            <span className="text-[11px] font-mono text-primary/60 tracking-[0.25em]">CAPABILITIES</span>
          </motion.div>

          <motion.h2 variants={rise} className="text-3xl md:text-4xl font-bold mb-12">
            Crypto Intelligence Tools
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                variants={rise}
                className="group p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-primary/5 hover:border-primary/30 transition-all"
              >
                <feature.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-white/50">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Examples */}
      <section className="relative z-10 py-16 px-6 max-w-4xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.div variants={rise} className="flex items-center gap-3 mb-4">
            <div className="h-px w-7 bg-primary/50" />
            <span className="text-[11px] font-mono text-primary/60 tracking-[0.25em]">EXAMPLE PROMPTS</span>
          </motion.div>

          <motion.h2 variants={rise} className="text-2xl md:text-3xl font-bold mb-8">
            Ask OUWIBO about crypto
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {examples.map((ex, i) => (
              <motion.div key={i} variants={rise}>
                <Link
                  href={`/agent?q=${encodeURIComponent(ex)}`}
                  className="flex items-start gap-3 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-primary/10 hover:border-primary/30 transition-all"
                >
                  <Zap className="w-4 h-4 text-primary/60 mt-0.5 shrink-0" />
                  <span className="text-sm text-white/60">{ex}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to analyze?</h2>
          <p className="text-white/50 mb-8">Start your crypto market analysis with AI-powered insights.</p>
          <Link
            href="/agent"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-black font-semibold hover:opacity-90 transition-opacity"
          >
            <Bot className="w-5 h-5" />
            Start AI Analysis
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-6 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-white/40">
          <span>OUWIBO Crypto Agent © 2026</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>All systems operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
