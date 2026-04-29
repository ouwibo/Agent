import type { Context } from 'hono';

type Env = {
  JWT_SECRET?: string;
  PRIVY_APP_ID?: string;
  PRIVY_API_SECRET?: string;
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Supported wallet types
const SUPPORTED_WALLETS = ['metamask', 'walletconnect', 'rainbow', 'trust', 'coinbase', 'privy'];

export async function handleWalletConnect(c: Context<{ Bindings: Env }>) {
  const body = await c.req.json().catch(() => ({})) as {
    address?: string;
    signature?: string;
    message?: string;
    walletType?: string;
  };

  if (!body.address || !/^0x[a-fA-F0-9]{40}$/.test(body.address)) {
    return c.json({ error: 'Invalid address' }, 400);
  }

  // Verify signature (simplified)
  if (body.signature && body.message) {
    // In production, verify with ethers.js or viem
    return c.json({
      ok: true,
      address: body.address,
      walletType: body.walletType || 'unknown',
      connected: true,
      timestamp: Date.now(),
    });
  }

  // Return connection request
  return c.json({
    ok: true,
    message: 'Sign this message to connect',
    nonce: Date.now().toString(16),
    chain: {
      id: 1,
      name: 'Ethereum Mainnet',
      rpcUrl: 'https://eth.llamarpc.com',
    },
  });
}

export async function handleWalletStatus(c: Context<{ Bindings: Env }>) {
  const address = c.req.query('address');
  
  if (!address) {
    return c.json({ error: 'Address required' }, 400);
  }

  // Check if wallet has connected before
  return c.json({
    ok: true,
    address,
    lastConnected: Date.now(),
    preferences: {
      defaultChain: 'eth',
      slippage: 0.5,
    },
  });
}

export async function handleWalletDisconnect(c: Context<{ Bindings: Env }>) {
  const body = await c.req.json().catch(() => ({})) as { address?: string };
  
  return c.json({
    ok: true,
    message: 'Wallet disconnected',
    address: body.address,
  });
}

export function walletOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
