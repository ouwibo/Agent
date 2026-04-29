import type { Env } from '../index';

const ONEINCH_API = 'https://api.1inch.dev/swap/v6.0';
const ZEROX_API = 'https://api.0x.org';

export interface SwapQuote {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  estimatedGas: string;
  route: string;
  priceImpact: number;
}

export async function getQuote(
  env: Env,
  params: {
    chain: string;
    fromToken: string;
    toToken: string;
    amount: string;
  }
): Promise<SwapQuote | null> {
  const chainId = {
    eth: 1,
    polygon: 137,
    base: 8453,
    arbitrum: 42161,
    optimism: 10,
    bsc: 56,
  }[params.chain] || 1;

  // Simplified quote - in production use 1inch API
  return {
    fromToken: params.fromToken,
    toToken: params.toToken,
    fromAmount: params.amount,
    toAmount: '0',
    estimatedGas: '150000',
    route: 'Uniswap V3',
    priceImpact: 0.1,
  };
}

export async function getSwapTx(
  env: Env,
  params: {
    chain: string;
    fromToken: string;
    toToken: string;
    amount: string;
    slippage: number;
    fromAddress: string;
  }
): Promise<{ to: string; data: string; value: string; gas: string } | null> {
  // In production, build actual swap transaction
  return {
    to: '0x0000000000000000000000000000000000000000',
    data: '0x',
    value: '0',
    gas: '150000',
  };
}

export async function getTokenPrices(
  tokens: string[]
): Promise<Record<string, { usd: number; change24h: number }>> {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${tokens.join(',')}&vs_currencies=usd&include_24hr_change=true`
    );
    const data = await response.json() as Record<string, { usd: number; usd_24h_change: number }>;
    
    const result: Record<string, { usd: number; change24h: number }> = {};
    for (const [token, price] of Object.entries(data)) {
      result[token] = {
        usd: price.usd,
        change24h: price.usd_24h_change || 0,
      };
    }
    
    return result;
  } catch {
    return {};
  }
}

export const TOKENS = {
  eth: {
    address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    symbol: 'ETH',
    decimals: 18,
    name: 'Ethereum',
    coingeckoId: 'ethereum',
  },
  weth: {
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    symbol: 'WETH',
    decimals: 18,
    name: 'Wrapped Ether',
    coingeckoId: 'ethereum',
  },
  usdc: {
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    symbol: 'USDC',
    decimals: 6,
    name: 'USD Coin',
    coingeckoId: 'usd-coin',
  },
  usdt: {
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    symbol: 'USDT',
    decimals: 6,
    name: 'Tether USD',
    coingeckoId: 'tether',
  },
  wbtc: {
    address: '0x2260fac5e5542a773aa44fbcfedf7c193bc86c88',
    symbol: 'WBTC',
    decimals: 8,
    name: 'Wrapped Bitcoin',
    coingeckoId: 'bitcoin',
  },
};
