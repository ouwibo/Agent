'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, Sparkles, Zap, Shield, Menu, X, ExternalLink, Check, Copy } from 'lucide-react';
import { GithubIcon } from '@/components/GitHubIcon';
import { Message } from '@/types';
import { chat } from '@/lib/api';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await chat(input);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: res.answer || res.reply || 'No response', timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      const errMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Error: ' + (err.message || 'Failed to get response'), timestamp: new Date() };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const features = [
    { icon: Zap, title: 'Lightning Fast', desc: 'Sub-second response times powered by edge computing' },
    { icon: Shield, title: 'Secure & Private', desc: 'Your conversations stay private and encrypted' },
    { icon: Sparkles, title: 'Smart AI', desc: 'Advanced reasoning with multi-model support' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center animate-spin-slow">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Ouwibo Agent</h1>
                <p className="text-xs text-slate-400">AI Assistant</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-slate-300 hover:text-white transition-colors">Features</a>
              <a href="#chat" className="text-slate-300 hover:text-white transition-colors">Chat</a>
              <a href="https://github.com/ouwibo/Agent" target="_blank" rel="noopener" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                <GithubIcon className="w-4 h-4" /> GitHub
              </a>
            </div>

            {/* Mobile menu button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-slate-300">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur-xl animate-slideDown">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-slate-300 hover:text-white transition-colors">Features</a>
              <a href="#chat" className="block text-slate-300 hover:text-white transition-colors">Chat</a>
              <a href="https://github.com/ouwibo/Agent" target="_blank" rel="noopener" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                <GithubIcon className="w-4 h-4" /> GitHub
              </a>
            </div>
          </div>
        )}
      </nav>

      <main className="relative pt-24">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm mb-6 animate-bounce-slow">
              <Sparkles className="w-4 h-4" />
              Powered by Advanced AI
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Your AI Assistant
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
              Experience the next generation of AI-powered conversations. Fast, intelligent, and always available.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#chat" className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all hover:-translate-y-1">
                Start Chatting
                <Send className="inline ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="https://github.com/ouwibo/Agent" target="_blank" rel="noopener" className="px-8 py-4 bg-slate-800 border border-slate-700 rounded-xl font-semibold text-white hover:bg-slate-700 transition-all hover:-translate-y-1">
                <GithubIcon className="inline mr-2 w-4 h-4" />
                View Source
              </a>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="group p-8 bg-slate-800/50 border border-slate-700/50 rounded-2xl hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all hover:-translate-y-2 animate-fadeIn" style={{ animationDelay: `${i * 0.2}s` }}>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <f.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                <p className="text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Chat Section */}
        <section id="chat" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl animate-fadeIn">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center animate-pulse">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Ouwibo AI</h3>
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs">v2.0</span>
              </div>
            </div>

            {/* Messages */}
            <div className="h-[500px] overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && !loading && (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 animate-bounce-slow">
                    <Bot className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Start a Conversation</h3>
                  <p className="text-slate-400 max-w-md">Ask me anything! I'm powered by advanced AI models and ready to help.</p>
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slideIn`}>
                  <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-500' : 'bg-gradient-to-br from-purple-500 to-pink-500'}`}>
                        {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                      </div>
                      <div className={`group relative px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-100'}`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <button onClick={() => copyToClipboard(msg.content, msg.id)} className="absolute -right-2 -top-2 w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-500">
                          {copied === msg.id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-slate-300" />}
                        </button>
                      </div>
                    </div>
                    <p className={`text-xs text-slate-500 mt-1 ${msg.role === 'user' ? 'text-right mr-10' : 'ml-10'}`}>
                      {msg.timestamp?.toLocaleTimeString?.([], { hour: '2-digit', minute: '2-digit' }) || 'Just now'}
                    </p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start animate-slideIn">
                  <div className="flex items-center gap-2 px-4 py-3 bg-slate-700 rounded-2xl">
                    <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                    <span className="text-slate-300">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="px-6 py-4 border-t border-slate-700/50 bg-slate-800/80">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 transition-all"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-800 bg-slate-900/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Ouwibo Agent</h3>
                  <p className="text-sm text-slate-400">AI Assistant Platform</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <a href="https://github.com/ouwibo/Agent" target="_blank" rel="noopener" className="text-slate-400 hover:text-white transition-colors">
                  <GithubIcon className="w-5 h-5" />
                </a>
                <a href="https://agent.ouwibo.workers.dev" target="_blank" rel="noopener" className="text-slate-400 hover:text-white transition-colors">
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
              © {new Date().getFullYear()} Ouwibo Agent. Built with ❤️
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
