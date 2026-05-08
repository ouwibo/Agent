export const config = { runtime: 'edge' };

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency: number;
  market_cap: number;
  total_volume: number;
  last_updated: string;
}

export default async function handler(req: Request) {
  const cache = new Map<string, { data: any; timestamp: number }>();
  
  // Check cache (5 minutes)
  const cacheKey = 'market';
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
    return new Response(JSON.stringify(cached.data), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Fetch real data from CoinGecko (free, no API key needed)
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,binancecoin,cardano,ripple,dogecoin,polkadot&order=market_cap_desc&sparkline=false&price_change_percentage=24h,7d'
    );

    if (!response.ok) {
      throw new Error('Failed to fetch market data');
    }

    const data: CoinData[] = await response.json();

    const result = {
      ok: true,
      timestamp: new Date().toISOString(),
      source: 'CoinGecko',
      coins: data.map(coin => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: coin.current_price,
        change_24h: coin.price_change_percentage_24h,
        change_7d: coin.price_change_percentage_7d_in_currency,
        market_cap: coin.market_cap,
        volume_24h: coin.total_volume,
        last_updated: coin.last_updated
      }))
    };

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 's-maxage=300' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ 
      ok: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
