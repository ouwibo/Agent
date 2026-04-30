import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  Bot,
  Coins,
  Copy,
  ExternalLink,
  FileText,
  Flame,
  Globe,
  Layers3,
  Loader2,
  MessageSquare,
  Menu,
  Mic,
  Palette,
  Rocket,
  Send,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Wallet,
  X,
  Check,
  Zap,
} from 'lucide-react'
import './index.css'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  model?: string
}

type Mode = 'chat' | 'frames' | 'wallet' | 'market' | 'docs'

type QuickAction = {
  label: string
  prompt?: string
  href?: string
  icon: typeof Sparkles
}

const API_URL = 'https://agent.ouwibo.workers.dev'

const quickActions: QuickAction[] = [
  { label: 'Build a mini app', prompt: 'Create a Farcaster-style mini app UI with smooth mobile interactions.', icon: Rocket },
  { label: 'Market scan', prompt: 'Give me a concise crypto market scan for ETH, SOL, and BASE.', icon: TrendingUp },
  { label: 'Onchain plan', prompt: 'Outline a safe onchain workflow for a user tip jar and treasury.', icon: Wallet },
  { label: 'Frames idea', prompt: 'Design 3 Farcaster Frames for chat, crypto, and NFT minting.', icon: Layers3 },
  { label: 'Prompt polish', prompt: 'Rewrite my prompt into a clean product spec with sections and priorities.', icon: FileText },
  { label: 'Launch copy', prompt: 'Write short launch copy for a premium AI agent website.', icon: Flame },
]

const modes: { id: Mode; label: string; icon: typeof MessageSquare }[] = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'frames', label: 'Frames', icon: Layers3 },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'market', label: 'Market', icon: TrendingUp },
  { id: 'docs', label: 'Docs', icon: FileText },
]

const capabilities = [
  'Mobile-first layout',
  'Smooth animations',
  'Quick actions',
  'Farcaster-ready',
  'Onchain workflow',
  'Edge API',
]

const shortcuts = [
  'Summarize BTC in 1 line',
  'Draft a Farcaster post',
  'Plan a token launch',
  'Generate product copy',
]

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [activeMode, setActiveMode] = useState<Mode>('chat')
  const [selectedModel, setSelectedModel] = useState('qwen3.5-plus')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    document.title = 'Ouwibo AI | Mini App'
  }, [])

  const statusText = useMemo(() => {
    if (loading) return 'Thinking'
    return 'Ready'
  }, [loading])

  async function sendMessage(prompt: string, model: string = selectedModel) {
    const content = prompt.trim()
    if (!content || loading) return

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: 'user',
      content,
      timestamp: new Date(),
      model,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ message: content, model }),
      })

      const data = await response.json()
      const reply = data.answer || data.reply || 'No response available.'

      const aiMessage: Message = {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
        model,
      }

      setMessages((prev) => [...prev, aiMessage])
      setActiveMode('chat')
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          role: 'assistant',
          content: 'Connection error. Please try again.',
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    void sendMessage(input, selectedModel)
  }

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopied(id)
    window.setTimeout(() => setCopied(null), 1400)
  }

  const modeTitle =
    {
      chat: 'AI Chat',
      frames: 'Farcaster Frames',
      wallet: 'Wallet Ops',
      market: 'Market Pulse',
      docs: 'Agent Docs',
    }[activeMode] || 'AI Chat'

  return (
    <div className="min-h-screen bg-[#060816] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10rem] top-[-8rem] h-80 w-80 rounded-full bg-cyan-500/18 blur-3xl animate-pulse-slow" />
        <div className="absolute right-[-8rem] top-[12rem] h-72 w-72 rounded-full bg-fuchsia-500/16 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-[-8rem] left-[30%] h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl animate-pulse-slow" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#060816]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/8 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)]">
              <Bot className="h-5 w-5 text-cyan-300" />
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(74,222,128,0.9)]" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.35em] text-white/35">Ouwibo AI</div>
              <div className="flex items-center gap-2 text-sm font-medium text-white/85">
                <span>{modeTitle}</span>
                <span className="rounded-full border border-white/10 bg-white/6 px-2 py-0.5 text-[10px] text-white/50">{statusText}</span>
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {modes.map((mode) => {
              const Icon = mode.icon
              const active = mode.id === activeMode
              return (
                <button
                  key={mode.id}
                  onClick={() => setActiveMode(mode.id)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-all ${
                    active
                      ? 'border-cyan-400/30 bg-cyan-400/12 text-cyan-100 shadow-[0_12px_40px_-16px_rgba(34,211,238,0.75)]'
                      : 'border-white/10 bg-white/5 text-white/65 hover:bg-white/8 hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {mode.label}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 focus:border-cyan-400/30 focus:bg-white/8"
            >
              <option value="qwen3.5-turbo">Qwen Turbo</option>
              <option value="qwen3.5-plus">Qwen Plus</option>
              <option value="qwen3.5-max">Qwen Max</option>
            </select>
            <button
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-white/80 transition hover:bg-white/10 md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div className="border-t border-white/10 px-4 py-3 md:hidden">
            <div className="grid grid-cols-2 gap-2">
              {modes.map((mode) => {
                const Icon = mode.icon
                const active = mode.id === activeMode
                return (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setActiveMode(mode.id)
                      setMenuOpen(false)
                    }}
                    className={`flex items-center gap-2 rounded-2xl border px-3 py-3 text-sm transition ${
                      active ? 'border-cyan-400/30 bg-cyan-400/12 text-cyan-100' : 'border-white/10 bg-white/5 text-white/70'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {mode.label}
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 pb-28 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:pb-10">
        <section className="space-y-6">
          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_30px_100px_-45px_rgba(0,0,0,0.95)] backdrop-blur-xl sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-cyan-100">
                <Sparkles className="h-3.5 w-3.5" />
                Farcaster-like mini app
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/60">
                <Shield className="h-3.5 w-3.5" />
                Smooth mobile UX
              </span>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Make Ouwibo feel like a polished mini app.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
                  Dense button set, soft motion, mobile-first spacing, and a clear action surface for chat, crypto, frames, and onchain workflows.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
                {[
                  { label: 'Smooth', value: 'UI' },
                  { label: 'Modes', value: '5' },
                  { label: 'Actions', value: '12+' },
                  { label: 'Mobile', value: 'First' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center">
                    <div className="text-xl font-bold text-white">{item.value}</div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.24em] text-white/45">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.label}
                    onClick={() => action.prompt && void sendMessage(action.prompt, selectedModel)}
                    className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left transition-all hover:-translate-y-0.5 hover:border-cyan-400/25 hover:bg-white/8 hover:shadow-[0_16px_60px_-24px_rgba(34,211,238,0.35)]"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-fuchsia-500/20 text-cyan-100">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-white">{action.label}</div>
                      <div className="mt-1 text-xs text-white/48">Tap to prefill</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-white/35 transition group-hover:translate-x-0.5 group-hover:text-white/70" />
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {capabilities.map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-white/70 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl">
                {item}
              </div>
            ))}
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#0a1022]/90 shadow-[0_35px_120px_-50px_rgba(0,0,0,0.95)] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4 sm:px-5">
              <div>
                <div className="text-xs uppercase tracking-[0.28em] text-white/35">Chat surface</div>
                <h2 className="mt-1 text-lg font-semibold text-white">Interactive AI panel</h2>
              </div>
              <div className="flex items-center gap-2">
                <button className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 text-xs text-white/70 transition hover:bg-white/10">
                  <Mic className="mr-2 h-4 w-4" /> Voice
                </button>
                <button className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 text-xs text-white/70 transition hover:bg-white/10">
                  <Globe className="mr-2 h-4 w-4" /> Web
                </button>
              </div>
            </div>

            <div className="max-h-[58vh] min-h-[430px] space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
              {messages.map((message) => {
                const user = message.role === 'user'
                return (
                  <div key={message.id} className={`flex ${user ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[88%] rounded-[24px] border px-4 py-3 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.85)] sm:max-w-[82%] ${user ? 'border-cyan-400/20 bg-gradient-to-br from-cyan-400/20 to-fuchsia-500/10 text-white' : 'border-white/10 bg-white/6 text-white/90'}`}>
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${user ? 'bg-white/10' : 'bg-gradient-to-br from-cyan-400/20 to-fuchsia-500/20'}`}>
                          {user ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-cyan-100" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="whitespace-pre-wrap text-[15px] leading-7 text-white/92">{message.content}</div>
                          <div className="mt-3 flex items-center gap-2 text-[11px] text-white/40">
                            <span>{formatTime(message.timestamp)}</span>
                            {!user ? (
                              <button
                                onClick={() => copyText(message.content, message.id)}
                                className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 transition hover:bg-white/10"
                              >
                                {copied === message.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                                {copied === message.id ? 'Copied' : 'Copy'}
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {loading ? (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/6 px-4 py-3 text-white/70">
                    <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
                    Thinking...
                  </div>
                </div>
              ) : null}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={onSubmit} className="border-t border-white/10 p-4 sm:p-5">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <div className="flex flex-wrap gap-2">
                  {shortcuts.map((shortcut) => (
                    <button
                      key={shortcut}
                      type="button"
                      onClick={() => setInput(shortcut)}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 transition hover:bg-white/10"
                    >
                      {shortcut}
                    </button>
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 font-semibold text-[#040816] shadow-[0_20px_60px_-24px_rgba(34,211,238,0.7)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send className="mr-2 h-4 w-4" /> Send
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-white/35">
                <span>Press Enter to send</span>
                <span>Mobile-friendly controls</span>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    void sendMessage(input, selectedModel)
                  }
                }}
                placeholder="Ask for a Farcaster post, crypto scan, mobile UI, or onchain plan"
                className="mt-3 min-h-[92px] w-full resize-none rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-[15px] leading-7 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400/30 focus:bg-white/8"
              />
            </form>
          </div>
        </section>

        <aside className="space-y-6 lg:sticky lg:top-[88px] lg:h-[calc(100vh-112px)] lg:self-start lg:overflow-y-auto">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_80px_-40px_rgba(0,0,0,0.95)] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.28em] text-white/35">Mode deck</div>
                <div className="mt-1 text-lg font-semibold text-white">Mini app buttons</div>
              </div>
              <Palette className="h-5 w-5 text-cyan-300" />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {modes.map((mode) => {
                const Icon = mode.icon
                const active = mode.id === activeMode
                return (
                  <button
                    key={mode.id}
                    onClick={() => setActiveMode(mode.id)}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all ${
                      active ? 'border-cyan-400/25 bg-cyan-400/12 text-white shadow-[0_18px_50px_-26px_rgba(34,211,238,0.55)]' : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/8'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/6">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold">{mode.label}</span>
                        <span className="block text-xs text-white/40">Open {mode.label.toLowerCase()} tools</span>
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-white/35" />
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.28em] text-white/35">Actions</div>
                <div className="mt-1 text-lg font-semibold text-white">Ready buttons</div>
              </div>
              <Star className="h-5 w-5 text-fuchsia-300" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { label: 'Open GitHub', href: 'https://github.com/ouwibo/Agent', icon: ExternalLink },
                { label: 'Launch App', href: 'https://agent.ouwibo.workers.dev', icon: Rocket },
                { label: 'Frames plan', prompt: 'Draft a Farcaster Frames rollout plan for this product.', icon: Layers3 },
                { label: 'Onchain flow', prompt: 'Design an onchain treasury and tipping flow.', icon: Coins },
              ].map((item) => {
                const Icon = item.icon
                if (item.href) {
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-xs font-medium text-white/75 transition hover:-translate-y-0.5 hover:bg-white/8"
                    >
                      <Icon className="h-4 w-4 text-cyan-300" />
                      {item.label}
                    </a>
                  )
                }
                return (
                  <button
                    key={item.label}
                    onClick={() => item.prompt && void sendMessage(item.prompt, selectedModel)}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-left text-xs font-medium text-white/75 transition hover:-translate-y-0.5 hover:bg-white/8"
                  >
                    <Icon className="h-4 w-4 text-cyan-300" />
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-cyan-400/10 via-white/[0.04] to-fuchsia-500/10 p-5 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.28em] text-white/35">Final polish</div>
            <div className="mt-1 text-lg font-semibold text-white">Smooth like a mini app</div>
            <p className="mt-3 text-sm leading-7 text-white/60">
              If you want, next pass we can add: bottom nav, wallet connect button, Farcaster frame cards, and a command drawer.
            </p>
          </div>
        </aside>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#060816]/92 px-3 py-2 backdrop-blur-xl md:hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-5 gap-2">
          {modes.map((mode) => {
            const Icon = mode.icon
            const active = mode.id === activeMode
            return (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[10px] transition ${
                  active ? 'bg-cyan-400/12 text-cyan-100' : 'text-white/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{mode.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default App
