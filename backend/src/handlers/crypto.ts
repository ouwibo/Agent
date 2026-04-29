import type { Context } from 'hono';

type Env = {
  ALCHEMY_API_KEY?: string;
  MORALIS_API_KEY?: string;
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Supported chains
const CHAINS: Record<string, string> = {
  eth: '0x1',
  polygon: '0x89',
  base: '0x2105',
  arbitrum: '0xa4b1',
  optimism: '0xa',
  bsc: '0x38',
};

export async function handleBalance(c: Context<{ Bindings: Env }>) {
  const address = c.req.query('address');
  const chain = c.req.query('chain') || 'eth';

  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return c.json({ error: 'Invalid address' }, 400);
  }

  const chainId = CHAINS[chain];
  if (!chainId) {
    return c.json({ error: 'Unsupported chain' }, 400);
  }

  try {
    // Use Alchemy or Moralis for balance
    if (c.env.ALCHEMY_API_KEY) {
      const rpcUrl = `https://eth-mainnet.g.alchemy.com/v2/${c.env.ALCHEMY_API_KEY}`;
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_getBalance',
          params: [address, 'latest'],
        }),
      });
      const data = await response.json() as { result?: string };
      const balanceWei = BigInt(data.result || '0x0');
      const balanceEth = Number(balanceWei) / 1e18;
      
      return c.json({
        ok: true,
        address,
        chain,
        chainId,
        balance: balanceEth.toFixed(6),
        symbol: chain === 'eth' ? 'ETH' : chain.toUpperCase(),
      });
    }

    // Fallback to public RPC
    const response = await fetch('https://eth.llamarpc.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getBalance',
        params: [address, 'latest'],
      }),
    });
    const data = await response.json() as { result?: string };
    const balanceWei = BigInt(data.result || '0x0');
    const balanceEth = Number(balanceWei) / 1e18;
    
    return c.json({
      ok: true,
      address,
      chain,
      chainId,
      balance: balanceEth.toFixed(6),
      symbol: 'ETH',
    });
  } catch (err) {
    return c.json({ error: 'Failed to fetch balance' }, 500);
  }
}

export async function handleSwap(c: Context<{ Bindings: Env }>) {
  const body = await c.req.json().catch(() => ({})) as {
    fromToken?: string;
    toToken?: string;
    amount?: string;
    fromAddress?: string;
    slippage?: number;
  };

  if (!body.fromToken || !body.toToken || !body.amount || !body.fromAddress) {
    return c.json({ error: 'Missing required fields' }, 400);
  }

  // Return swap quote and tx data
  return c.json({
    ok: true,
    quote: {
      fromToken: body.fromToken,
      toToken: body.toToken,
      fromAmount: body.amount,
      toAmount: '0',
      gasEstimate: '150000',
      route: 'Uniswap V3',
    },
    message: 'Connect wallet to execute swap',
    note: 'Use 1inch or 0x API for production',
  });
}

export async function handlePrice(c: Context<{ Bindings: Env }>) {
  const tokens = c.req.query('tokens')?.split(',') || ['ethereum', 'bitcoin', 'usd-coin'];
  
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${tokens.join(',')}&vs_currencies=usd&include_24hr_change=true`
    );
    const data = await response.json() as Record<string, { usd: number; usd_24h_change: number }>;
    
    return c.json({ ok: true, prices: data, timestamp: Date.now() });
  } catch (err) {
    return c.json({ error: 'Failed to fetch prices' }, 500);
  }
}

export function cryptoOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
