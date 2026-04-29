"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';
import { Send, Loader2, Wallet, ExternalLink, Copy, Check } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://agent.ouwibo.workers.dev';

const CHAINS = [
  { id: 1, name: 'Ethereum', symbol: 'ETH' },
  { id: 137, name: 'Polygon', symbol: 'MATIC' },
  { id: 8453, name: 'Base', symbol: 'ETH' },
  { id: 42161, name: 'Arbitrum', symbol: 'ETH' },
];

export function Web3Chat() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('qwen3.5-plus');
  const [models, setModels] = useState<Array<{ id: string; name: string }>>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedChain, setSelectedChain] = useState(CHAINS[0]);

  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });

  // Fetch models
  useEffect(() => {
    fetch(`${API_URL}/api/models`)
      .then(r => r.json())
      .then(data => setModels(data.models || []))
      .catch(console.error);
  }, []);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, model }),
      });
      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error}` }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Network error' }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, model]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-black font-bold">O</div>
            <div>
              <h1 className="font-semibold">Ouwibo Agent</h1>
              <p className="text-xs text-gray-400">Web3 AI Platform</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Chain Selector */}
            <select 
              value={selectedChain.id}
              onChange={(e) => setSelectedChain(CHAINS.find(c => c.id === Number(e.target.value)) || CHAINS[0])}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
            >
              {CHAINS.map(chain => (
                <option key={chain.id} value={chain.id}>{chain.name}</option>
              ))}
            </select>

            {/* Wallet Connection */}
            {isConnected && address ? (
              <div className="flex items-center gap-2">
                <div className="text-sm">
                  <span className="text-gray-400">{address.slice(0, 6)}...{address.slice(-4)}</span>
                  {balance && <span className="ml-2 text-amber-400">{parseFloat(balance.formatted).toFixed(4)} {balance.symbol}</span>}
                </div>
                <button 
                  onClick={() => disconnect()}
                  className="p-2 hover:bg-gray-800 rounded-lg"
                >
                  <Wallet className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => connect({ connector: connectors[0] })}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg font-medium transition"
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chat Section */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
              {/* Model Selector */}
              <div className="border-b border-gray-800 p-4">
                <select 
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                >
                  {models.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Messages */}
              <div className="h-[500px] overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="h-full flex items-center justify-center text-center text-gray-400">
                    <div>
                      <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Send className="w-8 h-8 text-amber-400" />
                      </div>
                      <p>Start a conversation with Ouwibo Agent</p>
                    </div>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user' 
                          ? 'bg-amber-500/20 border border-amber-500/30' 
                          : 'bg-gray-800 border border-gray-700'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      {msg.role === 'assistant' && (
                        <button 
                          onClick={() => copyToClipboard(msg.content, String(i))}
                          className="mt-2 text-xs text-gray-400 hover:text-white flex items-center gap-1"
                        >
                          {copied === String(i) ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copied === String(i) ? 'Copied' : 'Copy'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t border-gray-800 p-4">
                <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                  <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500"
                    disabled={loading}
                  />
                  <button 
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-600 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-left flex items-center gap-3">
                  <span className="text-2xl">💰</span>
                  <span>Check Balance</span>
                </button>
                <button className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-left flex items-center gap-3">
                  <span className="text-2xl">🔄</span>
                  <span>Swap Tokens</span>
                </button>
                <button className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-left flex items-center gap-3">
                  <span className="text-2xl">🎨</span>
                  <span>Mint NFT</span>
                </button>
                <button className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-left flex items-center gap-3">
                  <span className="text-2xl">📊</span>
                  <span>Portfolio</span>
                </button>
              </div>
            </div>

            {/* Crypto Prices */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4">
              <h3 className="font-semibold mb-4">Live Prices</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">ETH</span>
                  <span>$3,245.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">BTC</span>
                  <span>$67,000.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">USDC</span>
                  <span>$1.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
