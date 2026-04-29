import type { Context } from "hono";

const COINGECKO_URL = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,binancecoin,ripple&order=market_cap_desc&per_page=5&page=1&sparkline=false&price_change_percentage=24h";

type Asset = {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number | null;
};

export default async function snapshot(c: Context) {
  try {
    const response = await fetch(COINGECKO_URL, { headers: { accept: "application/json" } });
    if (!response.ok) {
      return c.json({ error: "Unable to load market snapshot" }, 503);
    }

    const data = (await response.json()) as Array<{
      id: string;
      symbol: string;
      name: string;
      current_price: number;
      price_change_percentage_24h: number | null;
    }>;

    const assets: Asset[] = data.slice(0, 5).map((asset) => ({
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      price: asset.current_price,
      change24h: asset.price_change_percentage_24h,
    }));

    return c.json({ ok: true, updatedAt: new Date().toISOString(), assets });
  } catch {
    return c.json({ error: "Unable to load market snapshot" }, 503);
  }
}
