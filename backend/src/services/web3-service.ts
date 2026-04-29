import type { Env } from '../index';

const CHAIN_CONFIG = {
  eth: {
    id: 1,
    name: 'Ethereum Mainnet',
    rpc: 'https://eth.llamarpc.com',
    symbol: 'ETH',
    explorer: 'https://etherscan.io',
  },
  polygon: {
    id: 137,
    name: 'Polygon',
    rpc: 'https://polygon-rpc.com',
    symbol: 'MATIC',
    explorer: 'https://polygonscan.com',
  },
  base: {
    id: 8453,
    name: 'Base',
    rpc: 'https://mainnet.base.org',
    symbol: 'ETH',
    explorer: 'https://basescan.org',
  },
  arbitrum: {
    id: 42161,
    name: 'Arbitrum One',
    rpc: 'https://arb1.arbitrum.io/rpc',
    symbol: 'ETH',
    explorer: 'https://arbiscan.io',
  },
  optimism: {
    id: 10,
    name: 'Optimism',
    rpc: 'https://mainnet.optimism.io',
    symbol: 'ETH',
    explorer: 'https://optimistic.etherscan.io',
  },
};

export type ChainId = keyof typeof CHAIN_CONFIG;

export async function getBalance(
  env: Env,
  address: string,
  chain: ChainId = 'eth'
): Promise<{ balance: string; symbol: string }> {
  const config = CHAIN_CONFIG[chain];
  
  const response = await fetch(config.rpc, {
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

  return {
    balance: balanceEth.toFixed(6),
    symbol: config.symbol,
  };
}

export async function getChainConfig(chain: ChainId) {
  return CHAIN_CONFIG[chain];
}

export async function getSupportedChains() {
  return Object.entries(CHAIN_CONFIG).map(([key, config]) => ({
    id: key,
    ...config,
  }));
}

export function getExplorerUrl(chain: ChainId, hash: string, type: 'tx' | 'address' | 'token' = 'tx') {
  const config = CHAIN_CONFIG[chain];
  return `${config.explorer}/${type}/${hash}`;
}
