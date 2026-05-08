import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  TrendingUp,
  TrendingDown,
  Bitcoin,
  BarChart3,
  Wallet,
  Newspaper,
  Zap,
  Bot,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { MatrixBackground } from "@/components/matrix-background";

// Mock data - will be replaced with real API
const MARKET_DATA = [
  { symbol: "BTC", name: "Bitcoin", price: 94500, change: 2.4, trend: "up" },
  { symbol: "ETH", name: "Ethereum", price: 3280, change: 1.8, trend: "up" },
  { symbol: "SOL", name: "Solana", price: 178, change: -0.5, trend: "down" },
  { symbol: "BNB", name: "BNB", price: 612, change: 0.3, trend: "up" },
];

const CRYPTO_TOOLS = [
  { icon: BarChart3, title: "Market Analysis", desc: "Real-time price analysis and trends", color: "text-green-400" },
  { icon: Wallet, title: "Portfolio Tracker", desc: "Track your crypto holdings", color: "text-blue-400" },
  { icon: Newspaper, title: "Crypto News", desc: "Latest news and updates", color: "text-purple-400" },
  { icon: Zap, title: "Trading Signals", desc: "AI-powered trading insights", color: "text-yellow-400" },
];

const QUICK_PROMPTS = [
  "Analyze BTC price trend",
  "What's happening with ETH?",
  "Top gainers today",
  "Market sentiment analysis",
];

export default function Dashboard() {
  return (
    <div className="relative min-h-screen bg-[#050608] text-white overflow-x-hidden">
      <MatrixBackground />
      
      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Bitcoin className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold">OUWIBO<span className="text-primary">_</span></span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link
              href="/agent"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
            >
              <Bot className="w-4 h-4" />
              Open Agent
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Crypto Intelligence Dashboard</h1>
          <p className="text-white/50">AI-powered crypto analysis and insights</p>
        </motion.div>

        {/* Market Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Market Overview
            </h2>
            <button className="flex items-center gap-1 text-sm text-white/50 hover:text-white transition-colors">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {MARKET_DATA.map((coin, i) => (
              <motion.div
                key={coin.symbol}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{coin.symbol}</span>
                    <span className="text-xs text-white/40">{coin.name}</span>
                  </div>
                  {coin.trend === "up" ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                </div>
                <div className="text-2xl font-bold mb-1">
                  ${coin.price.toLocaleString()}
                </div>
                <div className={`text-sm ${coin.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {coin.change >= 0 ? "+" : ""}{coin.change}%
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tools Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold mb-4">Crypto Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CRYPTO_TOOLS.map((tool, i) => (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group"
              >
                <tool.icon className={`w-8 h-8 ${tool.color} mb-3`} />
                <h3 className="font-semibold mb-1">{tool.title}</h3>
                <p className="text-sm text-white/50">{tool.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold mb-4">Ask AI Agent</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {QUICK_PROMPTS.map((prompt, i) => (
              <Link
                key={prompt}
                href={`/agent?q=${encodeURIComponent(prompt)}`}
                className="p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-primary/10 hover:border-primary/30 transition-all text-sm text-white/70 hover:text-white"
              >
                {prompt}
              </Link>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center py-8"
        >
          <p className="text-white/50 mb-4">Ready to analyze crypto markets with AI?</p>
          <Link
            href="/agent"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-black rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            <Bot className="w-5 h-5" />
            Start AI Analysis
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm text-white/40">
          <span>OUWIBO Crypto Agent © 2026</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>All systems operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
