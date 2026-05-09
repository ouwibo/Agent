import { motion } from "framer-motion";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { Bot, Newspaper, BarChart3, Target, Zap } from "lucide-react";

const QUICK_PROMPTS = [
  { label: "Analyze BTC price trend", prompt: "Analyze the current Bitcoin price trend and give your outlook" },
  { label: "What's happening with ETH?", prompt: "What's the current Ethereum price and market sentiment?" },
  { label: "Top gainers today", prompt: "Which cryptocurrencies are gaining the most today?" },
  { label: "Market sentiment analysis", prompt: "Analyze the overall crypto market sentiment today" },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#050608] text-white">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-white/10 bg-black/50 backdrop-blur-xl p-4 flex flex-col">
        <Link href="/" className="flex items-center gap-2 mb-6">
          <span className="text-xl font-bold tracking-wider">OUWIBO<span className="text-primary">_</span></span>
        </Link>

        <nav className="space-y-2 flex-1">
          <Link href="/agent" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
            <Bot className="w-4 h-4" />
            <span>AI Agent</span>
          </Link>

          <div className="pt-4">
            <p className="text-[10px] font-mono text-white/30 tracking-widest mb-2">TOOLS</p>
            {[
              { icon: BarChart3, label: "Market Analysis" },
              { icon: Target, label: "Portfolio" },
              { icon: Newspaper, label: "News" },
              { icon: Zap, label: "Signals" },
            ].map((item, i) => (
              <button key={i} className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-white/50 hover:bg-white/5 hover:text-white transition-colors">
                <item.icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="pt-4 border-t border-white/10">
          <p className="text-[10px] font-mono text-white/30 tracking-widest mb-2">ASK AI AGENT</p>
          {QUICK_PROMPTS.map((item, i) => (
            <Link
              key={i}
              href={`/agent?q=${encodeURIComponent(item.prompt)}`}
              className="block px-3 py-1.5 text-xs text-white/50 hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold">Crypto Intelligence Dashboard</h1>
          <p className="text-sm text-white/40 mt-1">AI-powered cryptocurrency analysis</p>
        </header>

        {/* Quick Actions */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Start AI Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {QUICK_PROMPTS.map((item, i) => (
              <Link
                key={i}
                href={`/agent?q=${encodeURIComponent(item.prompt)}`}
                className="p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:border-primary/20 hover:bg-primary/5 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-white/40">Ask AI Agent</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-12 border-t border-white/10">
          <h2 className="text-xl font-semibold mb-2">Ready to analyze?</h2>
          <p className="text-white/40 mb-6">Get real-time crypto insights powered by AI</p>
          <Link
            href="/agent"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-black rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            <Bot className="w-5 h-5" />
            Start AI Analysis
          </Link>
        </section>
      </main>
    </div>
  );
}
