import { Hono } from "hono";

const app = new Hono();

const OLLAMA_URL = "http://localhost:11434";
const OLLAMA_MODEL = "gemma3:1b";

const SYSTEM_PROMPT = `You are OUWIBO, a professional AI crypto analyst with access to REAL-TIME market data.

You provide accurate, data-driven insights about:
- Cryptocurrency market analysis (BTC, ETH, SOL, major altcoins)
- DeFi protocols and yield farming strategies
- Trading signals and technical analysis
- Blockchain technology and tokenomics
- Market sentiment and on-chain metrics

CRITICAL RULES:
1. When asked about current prices, use the REAL-TIME DATA provided in the user context
2. NEVER make up prices or dates from your training data - it is OUTDATED
3. Always cite the actual numbers from the real-time data provided
4. Provide balanced analysis with both bullish and bearish scenarios
5. Remind users to DYOR before investment decisions
6. Respond in the same language the user uses
7. Keep responses concise and informative

You are helpful, professional, and prioritize ACCURACY above all.`;

async function getMarketData(): Promise<string> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,binancecoin,cardano,ripple,dogecoin,polkadot&order=market_cap_desc&sparkline=false&price_change_percentage=24h,7d'
    );
    if (!response.ok) return "";
    const data = await response.json();
    const coins = data.map((c: any) => 
      `${c.name} (${c.symbol.toUpperCase()}): $${c.current_price.toLocaleString()} | 24h: ${c.price_change_percentage_24h?.toFixed(2)}% | 7d: ${c.price_change_percentage_7d_in_currency?.toFixed(2)}%`
    ).join('\n');
    return `\n\n=== REAL-TIME MARKET DATA (Updated: ${new Date().toUTCString()}) ===\n${coins}\n=== END MARKET DATA ===\n\n`;
  } catch {
    return "";
  }
}

// Health endpoint
app.get('/health', (c) => {
  return c.json({ 
    ok: true, 
    time: new Date().toISOString(),
    serverKeys: { ai: true },
    defaultModel: OLLAMA_MODEL,
    ollamaUrl: OLLAMA_URL
  });
});

// Models endpoint
app.get('/models', (c) => {
  return c.json({
    ok: true,
    models: [
      { model_name: "gemma3:1b", label: "Gemma 3 1B", vendor: "Google", type: "free", context_window: 32000, description: "Fast and efficient" },
    ],
    recommendedModel: OLLAMA_MODEL
  });
});

// Chat endpoint (non-streaming for reliability)
app.post('/agent', async (c) => {
  try {
    const body = await c.req.json();
    const { input, model_name = OLLAMA_MODEL, history = [] } = body;

    if (!input || !input.trim()) {
      return c.json({ error: 'Input is required' }, 400);
    }

    // Fetch real-time market data
    const marketData = await getMarketData();
    const systemWithMarket = SYSTEM_PROMPT + marketData;

    const messages = [
      { role: "system", content: systemWithMarket },
      ...history.slice(-10).map((m: any) => ({ role: m.role, content: m.content })),
      { role: "user", content: input.trim() }
    ];

    const response = await fetch(OLLAMA_URL + "/api/chat", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: model_name, messages, stream: false }),
    });

    if (!response.ok) {
      return c.json({ error: "Ollama error: " + response.status }, response.status);
    }

    const data = await response.json();
    const content = data.message?.content || "No response";

    // Return as SSE stream for frontend compatibility
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode("data: " + JSON.stringify({ type: 'text', content }) + "\n\n"));
        controller.enqueue(encoder.encode("data: " + JSON.stringify({ type: 'done' }) + "\n\n"));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Live prices endpoint
app.get('/live-prices', async (c) => {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin,ripple,cardano,dogecoin,polkadot&vs_currencies=usd&include_24hr_change=true'
    );
    
    if (!response.ok) {
      return c.json({ ok: false, error: 'CoinGecko error' }, 500);
    }

    const data = await response.json();
    
    const coins = Object.entries(data).map(([id, prices]: [string, any]) => ({
      id,
      symbol: id.substring(0, 3).toUpperCase(),
      name: id.charAt(0).toUpperCase() + id.slice(1),
      price: prices.usd,
      change_24h: prices.usd_24h_change || 0,
      last_updated: new Date().toISOString()
    }));

    return c.json({ 
      ok: true, 
      timestamp: new Date().toISOString(),
      source: 'CoinGecko',
      coins 
    });
  } catch (error: any) {
    return c.json({ ok: false, error: error.message }, 500);
  }
});

export default app;
