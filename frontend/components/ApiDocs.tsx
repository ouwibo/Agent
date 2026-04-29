"use client";

import { useState } from 'react';
import { Info, ExternalLink, Copy, Check } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://agent.ouwibo.workers.dev';

export function ApiDocs() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const endpoints = [
    {
      name: 'Chat',
      method: 'POST',
      path: '/api/chat',
      description: 'Send a message to the AI',
      body: { message: 'string', model: 'string (optional)' },
      response: { ok: true, answer: 'string', model: 'string' },
    },
    {
      name: 'Get Balance',
      method: 'GET',
      path: '/api/crypto/balance?address=0x...&chain=eth',
      description: 'Get wallet balance for a specific chain',
      response: { ok: true, address: 'string', balance: 'string', chain: 'string' },
    },
    {
      name: 'Swap Quote',
      method: 'POST',
      path: '/api/crypto/swap',
      description: 'Get a swap quote',
      body: { fromToken: 'string', toToken: 'string', amount: 'string', fromAddress: 'string' },
      response: { ok: true, quote: 'object' },
    },
    {
      name: 'Token Prices',
      method: 'GET',
      path: '/api/crypto/prices?tokens=ethereum,bitcoin',
      description: 'Get current token prices',
      response: { ok: true, prices: 'object' },
    },
    {
      name: 'Wallet Connect',
      method: 'POST',
      path: '/api/wallet/connect',
      description: 'Connect and verify wallet',
      body: { address: 'string', signature: 'string', message: 'string' },
      response: { ok: true, address: 'string', connected: true },
    },
    {
      name: 'Farcaster Chat Frame',
      method: 'POST',
      path: '/api/farcaster/frames/chat',
      description: 'Handle Farcaster chat frame interaction',
      body: 'FormData with frameData',
      response: 'HTML with frame metadata',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white py-16">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-2">API Documentation</h1>
        <p className="text-gray-400 mb-8">Ouwibo Agent v2.0 - Web3 AI Platform</p>

        <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-400 mt-0.5" />
          <div>
            <p className="text-sm">Base URL: <code className="bg-gray-800 px-2 py-0.5 rounded">{API_URL}</code></p>
            <p className="text-xs text-gray-400 mt-1">All endpoints require CORS headers. Authentication via wallet signature for protected routes.</p>
          </div>
        </div>

        <div className="space-y-6">
          {endpoints.map((endpoint, i) => (
            <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      endpoint.method === 'GET' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>{endpoint.method}</span>
                    <code className="text-sm">{endpoint.path}</code>
                  </div>
                  <h3 className="font-semibold">{endpoint.name}</h3>
                </div>
                <p className="text-sm text-gray-400 mt-2">{endpoint.description}</p>
              </div>
              
              {endpoint.body && (
                <div className="p-4 border-b border-gray-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-400 uppercase">Request Body</span>
                    <button 
                      onClick={() => copyCode(JSON.stringify(endpoint.body, null, 2), `body-${i}`)}
                      className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                    >
                      {copied === `body-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <pre className="text-xs bg-gray-800 p-3 rounded overflow-x-auto">
                    {JSON.stringify(endpoint.body, null, 2)}
                  </pre>
                </div>
              )}

              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-400 uppercase">Response</span>
                  <button 
                    onClick={() => copyCode(JSON.stringify(endpoint.response, null, 2), `res-${i}`)}
                    className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                  >
                    {copied === `res-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <pre className="text-xs bg-gray-800 p-3 rounded overflow-x-auto">
                  {JSON.stringify(endpoint.response, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Supported Chains</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {['Ethereum', 'Polygon', 'Base', 'Arbitrum', 'Optimism', 'BSC'].map(chain => (
              <div key={chain} className="p-4 bg-gray-800 rounded-xl text-center">{chain}</div>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">SDK Examples</h2>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <pre className="text-xs overflow-x-auto">
{`// JavaScript/TypeScript
const response = await fetch('https://agent.ouwibo.workers.dev/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Hello!', model: 'qwen3.5-plus' })
});
const data = await response.json();
console.log(data.answer);

// Get wallet balance
const balance = await fetch(
  'https://agent.ouwibo.workers.dev/api/crypto/balance?address=0x...&chain=eth'
).then(r => r.json());
console.log(balance);`}
            </pre>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <a href="https://github.com/ouwibo/Agent" className="flex items-center gap-2 text-amber-400 hover:text-amber-300">
            <ExternalLink className="w-4 h-4" />
            GitHub Repository
          </a>
        </div>
      </div>
    </div>
  );
}
