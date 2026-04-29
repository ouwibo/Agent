import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bot,
  Menu,
  RefreshCw,
  Settings,
  X,
  Send,
  Wallet,
  Globe,
  Zap,
  Code,
  History,
  Trash2,
} from 'lucide-react'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

type HealthResponse = {
  ok: boolean
  configured: boolean
  ready: boolean
  channel: string
  model: string | null
}

const starterPrompts = [
  "What's the current price of Bitcoin?",
  "Check wallet balance for 0x...",
  "Explain Uniswap v4 hooks",
  "Help me write a smart contract",
]

export default function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am Ouwibo Agent. I can help you with Web3 queries, smart contracts, market analysis, and more. What would you like to know?',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.title = 'Chat • Ouwibo Agent'
  }, [])

  useEffect(() => {
    fetchHealth()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchHealth() {
    try {
      const res = await fetch('/api/health')
      if (res.ok) {
        const data = await res.json()
        setHealth(data)
      }
    } catch {
      setHealth(null)
    }
  }

  async function sendMessage(text?: string) {
    const message = (text || input).trim()
    if (!message || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })

      const data = await res.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || data.error || 'Sorry, I could not process your request.',
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Connection error. Please try again.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  function clearChat() {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Chat cleared. How can I help you?',
        timestamp: new Date(),
      },
    ])
  }

  return (
    <div className="flex h-screen bg-[#050816] text-white">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-72 bg-black/50 backdrop-blur-xl border-r border-white/10 transition-transform duration-300`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-white/10">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                <Bot className="size-5 text-emerald-400" />
              </div>
              <div>
                <div className="font-semibold">Ouwibo Agent</div>
                <div className="text-xs text-white/50">Chat Interface</div>
              </div>
            </Link>
          </div>

          <div className="p-4">
            <button onClick={clearChat} className="w-full btn-secondary justify-center gap-2">
              <RefreshCw className="size-4" />
              New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm text-white/70">
                <Wallet className="size-4 text-emerald-400" />
                Wallet Scan
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm text-white/70">
                <Globe className="size-4 text-cyan-400" />
                Web Search
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm text-white/70">
                <Code className="size-4 text-purple-400" />
                Code Analysis
              </button>
            </div>

            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 mt-6">History</h3>
            <div className="text-sm text-white/40 text-center py-4">
              <History className="size-8 mx-auto mb-2 opacity-50" />
              No chat history
            </div>
          </div>

          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-white/50">
              <span className={`h-2 w-2 rounded-full ${health?.ready ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              {health?.ready ? `Connected • ${health.model}` : 'Checking status...'}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main chat area */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between gap-4 p-4 border-b border-white/10">
          <button 
            className="lg:hidden p-2 text-white/70"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="size-6" />
          </button>

          <div className="flex-1 flex items-center gap-3">
            <div className="size-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
              <Bot className="size-4 text-black" />
            </div>
            <div>
              <div className="font-medium text-sm">Ouwibo Agent</div>
              <div className="text-xs text-white/50">
                {health?.ready ? 'Online • Ready' : 'Connecting...'}
              </div>
            </div>
          </div>

          <button className="p-2 text-white/50 hover:text-white transition">
            <Settings className="size-5" />
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-white text-black rounded-br-md'
                    : 'border border-white/10 bg-white/8 text-white rounded-bl-md'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <div className={`text-xs mt-1 ${msg.role === 'user' ? 'text-black/40' : 'text-white/30'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white/60 rounded-bl-md">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    Thinking...
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-white/10">
          <div className="max-w-3xl mx-auto">
            {/* Starter prompts */}
            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 hover:bg-white/10 transition"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                placeholder="Ask about Web3, smart contracts, market data..."
                className="input-chat"
                disabled={loading}
              />
              <button 
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="size-4" />
              </button>
            </div>

            <p className="text-xs text-white/30 text-center mt-3">
              Ouwibo Agent can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
