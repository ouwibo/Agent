import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, ArrowLeft, Copy, Check } from 'lucide-react';
import { Message } from '@/types';
import { chat } from '@/lib/api';

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Head>
        <title>Chat - Ouwibo Agent</title>
      </Head>

      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center animate-pulse">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Ouwibo AI</h3>
              <p className="text-xs text-green-400">Online</p>
            </div>
          </div>
          <div className="w-20" />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 animate-bounce-slow">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Start a Conversation</h3>
              <p className="text-slate-400 max-w-md">Ask me anything! I&apos;m powered by advanced AI models and ready to help.</p>
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
        <form onSubmit={handleSend} className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-xl">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={loading}
              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 transition-all"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
