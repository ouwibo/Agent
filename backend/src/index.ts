import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handleChat, chatOptions } from './handlers/chat';
import { handleBalance, handleSwap, handlePrice, cryptoOptions } from './handlers/crypto';
import { handleChatFrame, handleCryptoFrame, handleNFTFrame, frameOptions } from './handlers/frames';
import { handleWalletConnect, handleWalletStatus, handleWalletDisconnect, walletOptions } from './handlers/wallet';
import { getSupportedChains, getChainConfig } from './services/web3-service';
import { getTokenPrices, TOKENS } from './services/swap-service';

export type Env = {
  DASHSCOPE_API_KEY: string;
  DASHSCOPE_BASE_URL?: string;
  DEFAULT_MODEL?: string;
  ALCHEMY_API_KEY?: string;
  MORALIS_API_KEY?: string;
  NEYNAR_API_KEY?: string;
  PRIVY_APP_ID?: string;
  PRIVY_API_SECRET?: string;
  JWT_SECRET?: string;
  FRAME_BASE_URL?: string;
};

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// ============== UI ROUTES ==============

// Landing page
app.get('/', (c) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ouwibo AI - Web3 AI Agent</title>
  <meta name="description" content="Advanced Web3 AI Agent with Chat, Crypto Trading, and Uniswap Integration">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            dark: { 900: '#0a0a0f', 800: '#111118', 700: '#1a1a24' },
            teal: { 400: '#2dd4bf', 500: '#0d9488', 600: '#0f766e' }
          }
        }
      }
    }
  </script>
</head>
<body class="bg-dark-900 text-white min-h-screen">
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <header class="flex justify-between items-center mb-16">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center text-black font-bold text-xl">O</div>
        <div>
          <h1 class="text-xl font-bold">Ouwibo AI</h1>
          <p class="text-gray-400 text-sm">Web3 AI Agent</p>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <span class="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">● Online</span>
        <a href="#/chat" class="px-6 py-2 bg-teal-500 hover:bg-teal-600 rounded-lg font-medium transition">Try Now</a>
      </div>
    </header>
    
    <!-- Hero -->
    <section class="text-center py-20">
      <h2 class="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent">Web3 AI Agent</h2>
      <p class="text-xl text-gray-400 max-w-2xl mx-auto mb-8">Chat with AI, trade crypto on Uniswap, analyze liquidity, and execute swaps — all in one powerful agent.</p>
      <div class="flex flex-wrap justify-center gap-4">
        <a href="#/chat" class="px-8 py-4 bg-teal-500 hover:bg-teal-600 rounded-xl font-medium transition flex items-center gap-2">
          <span>Start Chatting</span>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </a>
        <a href="#/wallet" class="px-8 py-4 bg-dark-700 hover:bg-dark-800 border border-gray-700 rounded-xl font-medium transition">Connect Wallet</a>
      </div>
    </section>
    
    <!-- Features -->
    <section class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
      <div class="p-6 bg-dark-800 rounded-2xl border border-gray-800">
        <div class="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
        </div>
        <h3 class="text-lg font-semibold mb-2">AI Chat</h3>
        <p class="text-gray-400 text-sm">Multi-model AI chat with Qwen, GPT-4, and Claude integration.</p>
      </div>
      <div class="p-6 bg-dark-800 rounded-2xl border border-gray-800">
        <div class="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
        </div>
        <h3 class="text-lg font-semibold mb-2">Uniswap Integration</h3>
        <p class="text-gray-400 text-sm">Swap tokens, analyze liquidity positions, and execute trades on Uniswap v3/v4.</p>
      </div>
      <div class="p-6 bg-dark-800 rounded-2xl border border-gray-800">
        <div class="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        </div>
        <h3 class="text-lg font-semibold mb-2">Crypto Analysis</h3>
        <p class="text-gray-400 text-sm">Real-time price data, on-chain analytics, and portfolio insights.</p>
      </div>
      <div class="p-6 bg-dark-800 rounded-2xl border border-gray-800">
        <div class="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L8 18H6a2 2 0 01-2-2v-6a2 2 0 012-2h2"></path></svg>
        </div>
        <h3 class="text-lg font-semibold mb-2">Wallet Management</h3>
        <p class="text-gray-400 text-sm">Connect MetaMask, WalletConnect, and manage multiple chains.</p>
      </div>
    </section>
    
    <!-- Stats -->
    <section class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
      <div class="text-center p-6 bg-dark-800 rounded-xl">
        <div class="text-3xl font-bold text-teal-400 mb-1">6+</div>
        <div class="text-gray-400 text-sm">Chains Supported</div>
      </div>
      <div class="text-center p-6 bg-dark-800 rounded-xl">
        <div class="text-3xl font-bold text-teal-400 mb-1">5+</div>
        <div class="text-gray-400 text-sm">AI Models</div>
      </div>
      <div class="text-center p-6 bg-dark-800 rounded-xl">
        <div class="text-3xl font-bold text-teal-400 mb-1">Uniswap</div>
        <div class="text-gray-400 text-sm">v3 & v4 Ready</div>
      </div>
      <div class="text-center p-6 bg-dark-800 rounded-xl">
        <div class="text-3xl font-bold text-teal-400 mb-1">&lt;100ms</div>
        <div class="text-gray-400 text-sm">API Response</div>
      </div>
    </section>
    
    <!-- Footer -->
    <footer class="border-t border-gray-800 pt-8 mt-20">
      <div class="flex flex-wrap justify-between items-center gap-4">
        <div class="text-gray-400 text-sm">© 2026 Ouwibo AI. Built on Cloudflare Workers.</div>
        <div class="flex gap-6">
          <a href="https://github.com/ouwibo/Agent" class="text-gray-400 hover:text-white transition">GitHub</a>
          <a href="#/docs" class="text-gray-400 hover:text-white transition">Docs</a>
          <a href="#/api" class="text-gray-400 hover:text-white transition">API</a>
        </div>
      </div>
    </footer>
  </div>
</body>
</html>`;
  return c.html(html);
});

// ============== API ROUTES ==============

// Health check
app.get('/health', (c) => c.json({ 
  status: 'ok', 
  agent: 'Ouwibo Agent', 
  version: '2.0.0',
  model: c.env.DEFAULT_MODEL || 'qwen3.5-plus',
  features: ['chat', 'crypto', 'wallet', 'frames', 'nft']
}));

// Chat API
app.options('/api/chat', chatOptions);
app.post('/api/chat', handleChat);

// Crypto API
app.options('/api/crypto/*', cryptoOptions);
app.get('/api/crypto/balance', handleBalance);
app.post('/api/crypto/swap', handleSwap);
app.get('/api/crypto/prices', handlePrice);
app.get('/api/crypto/chains', async (c) => c.json({ ok: true, chains: await getSupportedChains() }));
app.get('/api/crypto/tokens', (c) => c.json({ ok: true, tokens: TOKENS }));

// Wallet API
app.options('/api/wallet/*', walletOptions);
app.post('/api/wallet/connect', handleWalletConnect);
app.get('/api/wallet/status', handleWalletStatus);
app.post('/api/wallet/disconnect', handleWalletDisconnect);

// Farcaster Frames API
app.options('/api/farcaster/*', frameOptions);
app.post('/api/farcaster/frames/chat', handleChatFrame);
app.post('/api/farcaster/frames/crypto', handleCryptoFrame);
app.post('/api/farcaster/frames/nft', handleNFTFrame);

// Frame images
app.get('/api/frame/image', async (c) => {
  const text = c.req.query('text') || 'Hello!';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">
    <rect width="100%" height="100%" fill="#0a0a0f"/>
    <text x="50%" y="50%" fill="white" font-family="Arial" font-size="24" text-anchor="middle">${text}</text>
    <text x="50%" y="90%" fill="#888" font-family="Arial" font-size="12" text-anchor="middle">Ouwibo Agent</text>
  </svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
});

app.get('/api/frame/crypto-image', async (c) => {
  const prices = await getTokenPrices(['ethereum', 'bitcoin', 'usd-coin']);
  const eth = prices.ethereum?.usd || 0;
  const btc = prices.bitcoin?.usd || 0;
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">
    <rect width="100%" height="100%" fill="#0a0a0f"/>
    <text x="50%" y="30%" fill="#fbbf24" font-family="Arial" font-size="32" text-anchor="middle">Crypto Prices</text>
    <text x="50%" y="50%" fill="white" font-family="Arial" font-size="24" text-anchor="middle">ETH: $${eth.toLocaleString()}</text>
    <text x="50%" y="70%" fill="white" font-family="Arial" font-size="24" text-anchor="middle">BTC: $${btc.toLocaleString()}</text>
    <text x="50%" y="95%" fill="#888" font-family="Arial" font-size="12" text-anchor="middle">Ouwibo Agent</text>
  </svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
});

app.get('/api/frame/nft-image', (c) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">
    <rect width="100%" height="100%" fill="#0a0a0f"/>
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#fbbf24"/>
        <stop offset="100%" style="stop-color:#f59e0b"/>
      </linearGradient>
    </defs>
    <rect x="150" y="50" width="300" height="300" fill="url(#g)" rx="20"/>
    <text x="50%" y="40%" fill="white" font-family="Arial" font-size="48" text-anchor="middle">🎨</text>
    <text x="50%" y="95%" fill="#888" font-family="Arial" font-size="12" text-anchor="middle">Ouwibo NFT - Mint Now!</text>
  </svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
});

// Models API
app.get('/api/models', (c) => c.json({
  models: [
    { id: 'qwen3.5-turbo', name: 'Qwen 3.5 Turbo', description: 'Fast responses' },
    { id: 'qwen3.5-plus', name: 'Qwen 3.5 Plus', description: 'Balanced performance' },
    { id: 'qwen3.5-max', name: 'Qwen 3.5 Max', description: 'Best quality' },
  ],
  default: c.env.DEFAULT_MODEL || 'qwen3.5-plus'
}));

// Docs API
app.get('/api/docs', (c) => c.json({
  version: '2.0.0',
  endpoints: {
    chat: { method: 'POST', path: '/api/chat', body: { message: 'string', model: 'string?' } },
    balance: { method: 'GET', path: '/api/crypto/balance', params: { address: 'string', chain: 'string?' } },
    swap: { method: 'POST', path: '/api/crypto/swap', body: { fromToken: 'string', toToken: 'string', amount: 'string', fromAddress: 'string' } },
    prices: { method: 'GET', path: '/api/crypto/prices', params: { tokens: 'string?' } },
    walletConnect: { method: 'POST', path: '/api/wallet/connect', body: { address: 'string', signature: 'string', message: 'string' } },
    frames: { method: 'POST', path: '/api/farcaster/frames/{chat|crypto|nft}' },
  }
}));

// Favicon
app.get('/favicon.svg', (c) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" rx="16" fill="#0a0a0f"/>
    <circle cx="32" cy="32" r="20" fill="#fbbf24"/>
    <text x="32" y="42" fill="#0a0a0f" font-family="Arial" font-size="24" text-anchor="middle" font-weight="bold">O</text>
  </svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
});

// Robots.txt
app.get('/robots.txt', (c) => c.text('User-agent: *\nAllow: /'));

// Sitemap
app.get('/sitemap.xml', (c) => c.text(`<?xml version="1.0"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${c.req.url.split('?')[0]}</loc></url>
</urlset>`));

// 404 handler
app.notFound((c) => c.json({ error: 'Not found' }, 404));

export default app;
