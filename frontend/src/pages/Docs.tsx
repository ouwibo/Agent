import { Link } from 'react-router-dom'
import {
  Bot,
  Code,
  Copy,
  Check,
  ArrowRight,
  Terminal,
  Book,
  Zap,
  Shield,
} from 'lucide-react'

const endpoints = [
  {
    method: 'GET',
    path: '/api/health',
    description: 'Check API health and configuration status',
    response: `{
  "ok": true,
  "configured": true,
  "ready": true,
  "channel": "managed",
  "model": "qwen3.5-plus"
}`,
  },
  {
    method: 'POST',
    path: '/api/chat',
    description: 'Send a message to the AI agent',
    request: `{
  "message": "What is the price of ETH?",
  "conversationId": "optional-conversation-id"
}`,
    response: `{
  "reply": "ETH is currently trading at $3,245...",
  "conversationId": "conv_abc123",
  "configured": true,
  "channel": "managed"
}`,
  },
  {
    method: 'GET',
    path: '/api/crypto-snapshot',
    description: 'Get cryptocurrency market snapshot',
    response: `{
  "bitcoin": { "price": 67000, "change_24h": 2.5 },
  "ethereum": { "price": 3245, "change_24h": 1.8 },
  ...
}`,
  },
]

const codeExamples = {
  curl: `curl -X POST https://ouwibo-agent.your-domain.workers.dev/api/chat \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Hello, how are you?"}'`,
  
  javascript: `const response = await fetch('https://ouwibo-agent.your-domain.workers.dev/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Hello, how are you?' })
});

const data = await response.json();
console.log(data.reply);`,
  
  python: `import requests

response = requests.post(
    'https://ouwibo-agent.your-domain.workers.dev/api/chat',
    json={'message': 'Hello, how are you?'}
)

data = response.json()
print(data['reply'])`,
}

export default function Docs() {
  return (
    <div className="min-h-screen bg-[#050816] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-[-10rem] h-[28rem] bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_42%)]" />
      </div>

      {/* Header */}
      <nav className="relative mx-auto max-w-7xl px-6 py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 backdrop-blur">
              <Bot className="size-6 text-emerald-400" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.38em] text-white/40">Ouwibo</div>
              <div className="text-sm font-semibold text-white">Documentation</div>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/chat" className="btn-secondary">
              Try Chat
            </Link>
            <a 
              href="https://github.com/ouwibo/Agent" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary"
            >
              GitHub
              <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-6 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-black tracking-tight sm:text-6xl">
            API{' '}
            <span className="gradient-text">Documentation</span>
          </h1>
          <p className="mt-4 text-lg text-white/60">
            Integrate Ouwibo Agent into your applications with our simple REST API
          </p>
        </div>
      </section>

      {/* Quick Start */}
      <section className="relative mx-auto max-w-7xl px-6 py-12">
        <div className="glass-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="size-6 text-emerald-400" />
            <h2 className="text-2xl font-bold">Quick Start</h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="font-semibold mb-3">1. Base URL</h3>
              <code className="block p-4 rounded-xl bg-black/50 border border-white/10 text-sm text-emerald-400 font-mono">
                https://ouwibo-agent.your-domain.workers.dev
              </code>
            </div>

            <div>
              <h3 className="font-semibold mb-3">2. Authentication</h3>
              <p className="text-white/60 text-sm mb-3">
                API key required for production use. Add header:
              </p>
              <code className="block p-4 rounded-xl bg-black/50 border border-white/10 text-sm text-cyan-400 font-mono">
                Authorization: Bearer YOUR_API_KEY
              </code>
            </div>
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section className="relative mx-auto max-w-7xl px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Terminal className="size-6 text-emerald-400" />
          <h2 className="text-2xl font-bold">API Endpoints</h2>
        </div>

        <div className="space-y-6">
          {endpoints.map((endpoint) => (
            <div key={endpoint.path} className="glass-card p-6">
              <div className="flex items-start gap-4">
                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  endpoint.method === 'GET' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {endpoint.method}
                </span>
                <div className="flex-1">
                  <code className="text-lg font-mono text-white">{endpoint.path}</code>
                  <p className="text-white/60 mt-1">{endpoint.description}</p>

                  {endpoint.request && (
                    <>
                      <h4 className="text-sm font-semibold text-white/70 mt-4 mb-2">Request Body</h4>
                      <pre className="p-4 rounded-xl bg-black/50 border border-white/10 text-sm text-white/80 overflow-x-auto">
                        {endpoint.request}
                      </pre>
                    </>
                  )}

                  <h4 className="text-sm font-semibold text-white/70 mt-4 mb-2">Response</h4>
                  <pre className="p-4 rounded-xl bg-black/50 border border-white/10 text-sm text-white/80 overflow-x-auto">
                    {endpoint.response}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Code Examples */}
      <section className="relative mx-auto max-w-7xl px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Code className="size-6 text-emerald-400" />
          <h2 className="text-2xl font-bold">Code Examples</h2>
        </div>

        <div className="glass-card p-6">
          <div className="flex gap-2 mb-4 border-b border-white/10 pb-4">
            {(['curl', 'javascript', 'python'] as const).map((lang) => (
              <button 
                key={lang}
                className={`px-4 py-2 rounded-lg text-sm transition ${
                  lang === 'curl' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          <pre className="p-4 rounded-xl bg-black/50 border border-white/10 text-sm text-white/80 overflow-x-auto font-mono">
            {codeExamples.curl}
          </pre>
        </div>
      </section>

      {/* Features */}
      <section className="relative mx-auto max-w-7xl px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="size-6 text-emerald-400" />
          <h2 className="text-2xl font-bold">Features</h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass-card p-6">
            <h3 className="font-semibold text-lg mb-3">Web3 Integration</h3>
            <ul className="space-y-2 text-white/70 text-sm">
              <li>• Multi-chain wallet scanning</li>
              <li>• ENS name resolution</li>
              <li>• Real-time price data</li>
              <li>• Transaction analysis</li>
            </ul>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-semibold text-lg mb-3">Rate Limiting</h3>
            <ul className="space-y-2 text-white/70 text-sm">
              <li>• Free: 100 requests/day</li>
              <li>• Pro: Unlimited</li>
              <li>• Enterprise: Custom limits</li>
            </ul>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-semibold text-lg mb-3">Session Management</h3>
            <ul className="space-y-2 text-white/70 text-sm">
              <li>• Conversation continuity</li>
              <li>• Context preservation</li>
              <li>• Multi-turn conversations</li>
            </ul>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-semibold text-lg mb-3">Error Handling</h3>
            <ul className="space-y-2 text-white/70 text-sm">
              <li>• Structured error responses</li>
              <li>• Retry mechanisms</li>
              <li>• Fallback channels</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative mx-auto max-w-7xl px-6 py-12 border-t border-white/10">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/50">
            Need help? <a href="#" className="text-emerald-400 hover:underline">Contact support</a>
          </p>
          <Link to="/chat" className="btn-primary">
            Try the Chat
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </footer>
    </div>
  )
}
