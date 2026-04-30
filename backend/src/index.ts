import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/cloudflare-workers';
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

// Static frontend assets
app.use('/*', serveStatic({ root: './' }));

// 404 handler
app.notFound((c) => c.json({ error: 'Not found' }, 404));

export default app;
